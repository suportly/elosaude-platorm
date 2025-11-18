#!/usr/bin/env python
"""
Oracle Database Analysis Script
Analyzes DBAPS schema and specific views for Elosaúde platform integration
"""

import oracledb
import json
import sys
from datetime import datetime
from collections import defaultdict

# Oracle connection parameters
ORACLE_CONFIG = {
    'user': 'estagiario',
    'password': 'EIst4269uu',
    'host': '192.168.40.29',
    'port': 1521,
    'service_name': 'SIML'
}

# Views to analyze in detail
TARGET_VIEWS = [
    'DBAPS.ESAU_V_APP_CARTEIRINHA',
    'DBAPS.ESAU_V_APP_UNIMED',
    'DBAPS.ESAU_V_APP_RECIPROCIDADE'
]


def connect_to_oracle():
    """Establish connection to Oracle database"""
    try:
        # Initialize thick mode with Oracle Instant Client for older Oracle versions
        try:
            oracle_client_path = '/opt/oracle/instantclient_21_7'
            oracledb.init_oracle_client(lib_dir=oracle_client_path)
            print(f"✓ Using Oracle thick mode with Instant Client: {oracle_client_path}")
        except Exception as thick_err:
            print(f"ℹ Thick mode initialization issue: {thick_err}")
            print(f"ℹ Attempting thin mode connection...")

        dsn = oracledb.makedsn(
            ORACLE_CONFIG['host'],
            ORACLE_CONFIG['port'],
            service_name=ORACLE_CONFIG['service_name']
        )
        connection = oracledb.connect(
            user=ORACLE_CONFIG['user'],
            password=ORACLE_CONFIG['password'],
            dsn=dsn
        )
        print(f"✓ Connected to Oracle database: {ORACLE_CONFIG['host']}:{ORACLE_CONFIG['port']}/{ORACLE_CONFIG['service_name']}")
        return connection
    except Exception as e:
        print(f"✗ Failed to connect to Oracle: {str(e)}")
        print(f"\nℹ If connection issues persist, check:")
        print(f"  - Network connectivity to {ORACLE_CONFIG['host']}:{ORACLE_CONFIG['port']}")
        print(f"  - Oracle service name: {ORACLE_CONFIG['service_name']}")
        print(f"  - User credentials: {ORACLE_CONFIG['user']}")
        sys.exit(1)


def get_table_columns(cursor, schema, table_name):
    """Get column metadata for a table or view"""
    try:
        query = """
            SELECT
                COLUMN_NAME,
                DATA_TYPE,
                DATA_LENGTH,
                DATA_PRECISION,
                DATA_SCALE,
                NULLABLE,
                COLUMN_ID
            FROM ALL_TAB_COLUMNS
            WHERE OWNER = :schema
            AND TABLE_NAME = :table_name
            ORDER BY COLUMN_ID
        """
        cursor.execute(query, {'schema': schema, 'table_name': table_name})
        columns = []
        for row in cursor:
            col_info = {
                'name': row[0],
                'data_type': row[1],
                'length': row[2],
                'precision': row[3],
                'scale': row[4],
                'nullable': row[5] == 'Y',
                'position': row[6]
            }
            columns.append(col_info)
        return columns
    except Exception as e:
        print(f"  ✗ Error getting columns for {schema}.{table_name}: {str(e)}")
        return []


def get_sample_data(cursor, schema, table_name, limit=5):
    """Get sample data from a table or view"""
    try:
        # First get column names
        columns = get_table_columns(cursor, schema, table_name)
        if not columns:
            return []

        col_names = [col['name'] for col in columns]

        # Query sample data
        query = f'SELECT {", ".join(col_names)} FROM {schema}.{table_name} WHERE ROWNUM <= {limit}'
        cursor.execute(query)

        rows = []
        for row in cursor:
            row_dict = {}
            for i, col_name in enumerate(col_names):
                value = row[i]
                # Convert to JSON-serializable format
                if value is not None:
                    if hasattr(value, 'isoformat'):  # datetime objects
                        value = value.isoformat()
                    elif isinstance(value, bytes):
                        value = value.decode('utf-8', errors='ignore')
                    elif isinstance(value, (int, float, str, bool)):
                        pass
                    else:
                        value = str(value)
                row_dict[col_name] = value
            rows.append(row_dict)

        return rows
    except Exception as e:
        print(f"  ✗ Error getting sample data from {schema}.{table_name}: {str(e)}")
        return []


def get_row_count(cursor, schema, table_name):
    """Get row count for a table or view"""
    try:
        query = f'SELECT COUNT(*) FROM {schema}.{table_name}'
        cursor.execute(query)
        count = cursor.fetchone()[0]
        return count
    except Exception as e:
        print(f"  ✗ Error counting rows in {schema}.{table_name}: {str(e)}")
        return -1


def get_primary_keys(cursor, schema, table_name):
    """Get primary key columns for a table"""
    try:
        query = """
            SELECT
                ACC.COLUMN_NAME,
                ACC.POSITION
            FROM ALL_CONSTRAINTS AC
            JOIN ALL_CONS_COLUMNS ACC ON AC.CONSTRAINT_NAME = ACC.CONSTRAINT_NAME
                AND AC.OWNER = ACC.OWNER
            WHERE AC.OWNER = :schema
            AND AC.TABLE_NAME = :table_name
            AND AC.CONSTRAINT_TYPE = 'P'
            ORDER BY ACC.POSITION
        """
        cursor.execute(query, {'schema': schema, 'table_name': table_name})
        pk_columns = [row[0] for row in cursor]
        return pk_columns
    except Exception as e:
        print(f"  ✗ Error getting primary keys for {schema}.{table_name}: {str(e)}")
        return []


def get_foreign_keys(cursor, schema, table_name):
    """Get foreign key relationships for a table"""
    try:
        query = """
            SELECT
                ACC.COLUMN_NAME,
                R_ACC.TABLE_NAME AS REFERENCED_TABLE,
                R_ACC.COLUMN_NAME AS REFERENCED_COLUMN
            FROM ALL_CONSTRAINTS AC
            JOIN ALL_CONS_COLUMNS ACC ON AC.CONSTRAINT_NAME = ACC.CONSTRAINT_NAME
                AND AC.OWNER = ACC.OWNER
            JOIN ALL_CONSTRAINTS R_AC ON AC.R_CONSTRAINT_NAME = R_AC.CONSTRAINT_NAME
                AND AC.R_OWNER = R_AC.OWNER
            JOIN ALL_CONS_COLUMNS R_ACC ON R_AC.CONSTRAINT_NAME = R_ACC.CONSTRAINT_NAME
                AND R_AC.OWNER = R_ACC.OWNER
            WHERE AC.OWNER = :schema
            AND AC.TABLE_NAME = :table_name
            AND AC.CONSTRAINT_TYPE = 'R'
            ORDER BY ACC.POSITION
        """
        cursor.execute(query, {'schema': schema, 'table_name': table_name})
        fk_relationships = []
        for row in cursor:
            fk_relationships.append({
                'column': row[0],
                'referenced_table': row[1],
                'referenced_column': row[2]
            })
        return fk_relationships
    except Exception as e:
        print(f"  ✗ Error getting foreign keys for {schema}.{table_name}: {str(e)}")
        return []


def analyze_view_detail(cursor, view_full_name):
    """Perform detailed analysis of a specific view"""
    print(f"\n📊 Analyzing view: {view_full_name}")

    schema, view_name = view_full_name.split('.')

    analysis = {
        'full_name': view_full_name,
        'schema': schema,
        'view_name': view_name,
        'columns': [],
        'sample_data': [],
        'row_count': 0,
        'primary_keys': [],
        'foreign_keys': []
    }

    # Get columns
    print(f"  → Getting column metadata...")
    analysis['columns'] = get_table_columns(cursor, schema, view_name)
    print(f"  ✓ Found {len(analysis['columns'])} columns")

    # Get row count
    print(f"  → Counting rows...")
    analysis['row_count'] = get_row_count(cursor, schema, view_name)
    print(f"  ✓ Total rows: {analysis['row_count']:,}")

    # Get sample data
    print(f"  → Extracting sample data...")
    analysis['sample_data'] = get_sample_data(cursor, schema, view_name, limit=5)
    print(f"  ✓ Retrieved {len(analysis['sample_data'])} sample rows")

    # Get primary keys
    print(f"  → Checking for primary keys...")
    analysis['primary_keys'] = get_primary_keys(cursor, schema, view_name)
    if analysis['primary_keys']:
        print(f"  ✓ Primary keys: {', '.join(analysis['primary_keys'])}")
    else:
        print(f"  ℹ No primary keys found (normal for views)")

    # Get foreign keys
    print(f"  → Checking for foreign keys...")
    analysis['foreign_keys'] = get_foreign_keys(cursor, schema, view_name)
    if analysis['foreign_keys']:
        print(f"  ✓ Found {len(analysis['foreign_keys'])} foreign key relationships")
    else:
        print(f"  ℹ No foreign keys found (normal for views)")

    return analysis


def explore_dbaps_schema(cursor):
    """Explore all tables and views in DBAPS schema"""
    print(f"\n🔍 Exploring DBAPS schema...")

    try:
        query = """
            SELECT
                TABLE_NAME,
                'TABLE' AS OBJECT_TYPE
            FROM ALL_TABLES
            WHERE OWNER = 'DBAPS'
            UNION ALL
            SELECT
                VIEW_NAME AS TABLE_NAME,
                'VIEW' AS OBJECT_TYPE
            FROM ALL_VIEWS
            WHERE OWNER = 'DBAPS'
            ORDER BY TABLE_NAME
        """
        cursor.execute(query)

        objects = []
        for row in cursor:
            table_name = row[0]
            object_type = row[1]

            # Get row count for tables (views might be expensive)
            if object_type == 'TABLE':
                row_count = get_row_count(cursor, 'DBAPS', table_name)
            else:
                row_count = -1  # Skip counting for views to save time

            objects.append({
                'name': table_name,
                'type': object_type,
                'row_count': row_count
            })

        print(f"✓ Found {len(objects)} objects in DBAPS schema")

        # Count by type
        tables = [o for o in objects if o['type'] == 'TABLE']
        views = [o for o in objects if o['type'] == 'VIEW']
        print(f"  - Tables: {len(tables)}")
        print(f"  - Views: {len(views)}")

        return objects
    except Exception as e:
        print(f"✗ Error exploring DBAPS schema: {str(e)}")
        return []


def find_common_columns(views_analysis):
    """Find common columns across the analyzed views"""
    print(f"\n🔗 Finding common columns across views...")

    if len(views_analysis) < 2:
        return []

    # Get column sets for each view
    view_columns = {}
    for view in views_analysis:
        col_names = set(col['name'] for col in view['columns'])
        view_columns[view['view_name']] = col_names

    # Find intersection
    common_columns = set.intersection(*view_columns.values())

    if common_columns:
        print(f"✓ Found {len(common_columns)} common columns: {', '.join(sorted(common_columns))}")
    else:
        print(f"ℹ No common columns found across all views")

    # Also find pairwise common columns
    pairwise_common = {}
    view_names = list(view_columns.keys())
    for i in range(len(view_names)):
        for j in range(i + 1, len(view_names)):
            v1, v2 = view_names[i], view_names[j]
            common = view_columns[v1] & view_columns[v2]
            if common:
                key = f"{v1} ↔ {v2}"
                pairwise_common[key] = sorted(common)
                print(f"  - {key}: {len(common)} common columns")

    return {
        'all_views': sorted(common_columns),
        'pairwise': pairwise_common
    }


def categorize_tables(schema_objects):
    """Categorize tables by potential use case"""
    print(f"\n🏷️  Categorizing tables by potential use...")

    categories = {
        'beneficiaries': [],
        'health_plans': [],
        'providers': [],
        'guides_authorizations': [],
        'financial': [],
        'reimbursements': [],
        'usage_history': [],
        'network_reciprocity': [],
        'other': []
    }

    # Keywords for categorization
    keywords = {
        'beneficiaries': ['BENEF', 'TITULAR', 'DEPEND', 'CARTEIRINHA', 'CARTAO', 'USUARIO', 'PESSOA'],
        'health_plans': ['PLANO', 'PLAN', 'COBERTURA', 'CONTRATO'],
        'providers': ['PRESTADOR', 'PREST', 'MEDICO', 'HOSPITAL', 'CLINICA', 'LABORATORIO'],
        'guides_authorizations': ['GUIA', 'AUTORIZACAO', 'AUTORIZA', 'SOLICITACAO', 'PROCEDIMENTO'],
        'financial': ['FATURA', 'FINANC', 'PAGAMENTO', 'COBRANCA', 'VALOR', 'PRECO'],
        'reimbursements': ['REEMBOLSO', 'RESSARC'],
        'usage_history': ['HISTORICO', 'USO', 'UTILIZACAO', 'ATENDIMENTO', 'CONSULTA'],
        'network_reciprocity': ['UNIMED', 'RECIPROCIDADE', 'REDE', 'CREDENCIADO']
    }

    for obj in schema_objects:
        name = obj['name']
        categorized = False

        for category, kw_list in keywords.items():
            if any(kw in name for kw in kw_list):
                categories[category].append(obj)
                categorized = True
                break

        if not categorized:
            categories['other'].append(obj)

    # Print summary
    for category, objects in categories.items():
        if objects:
            print(f"  - {category}: {len(objects)} objects")

    return categories


def generate_unified_view_sql(views_analysis, common_columns_info):
    """Generate SQL for a unified view combining the 3 views"""
    print(f"\n🔨 Generating unified view SQL...")

    if not views_analysis or len(views_analysis) < 2:
        return ""

    # Use the common columns for joining
    common_cols = common_columns_info.get('all_views', [])

    if not common_cols:
        print("  ℹ No common columns found - will generate UNION approach")
        # Generate UNION ALL approach
        sql_parts = []
        for i, view in enumerate(views_analysis):
            view_name = view['full_name']
            col_names = [col['name'] for col in view['columns']]
            sql_parts.append(f"    SELECT '{view['view_name']}' AS SOURCE_VIEW, {', '.join(col_names)}\n    FROM {view_name}")

        unified_sql = "CREATE OR REPLACE VIEW DBAPS.ESAU_V_APP_UNIFIED AS\n" + "\n    UNION ALL\n".join(sql_parts) + ";"
    else:
        # Try to find best join key
        # Look for ID-like columns
        join_candidates = [col for col in common_cols if any(keyword in col for keyword in ['ID', 'COD', 'NUMERO', 'CPF'])]

        if not join_candidates:
            join_candidates = list(common_cols)[:1]  # Take first common column

        join_key = join_candidates[0] if join_candidates else common_cols[0]

        print(f"  → Proposed join key: {join_key}")

        # Generate JOIN approach
        view1 = views_analysis[0]
        unified_sql = f"CREATE OR REPLACE VIEW DBAPS.ESAU_V_APP_UNIFIED AS\nSELECT\n"

        # Add columns from first view with alias
        col_selects = []
        for col in view1['columns']:
            col_selects.append(f"    v1.{col['name']} AS V1_{col['name']}")

        # Add columns from other views
        for i, view in enumerate(views_analysis[1:], start=2):
            for col in view['columns']:
                if col['name'] != join_key:  # Don't duplicate join key
                    col_selects.append(f"    v{i}.{col['name']} AS V{i}_{col['name']}")

        unified_sql += ",\n".join(col_selects)
        unified_sql += f"\nFROM {view1['full_name']} v1\n"

        # Add joins
        for i, view in enumerate(views_analysis[1:], start=2):
            unified_sql += f"LEFT JOIN {view['full_name']} v{i} ON v1.{join_key} = v{i}.{join_key}\n"

        unified_sql += ";"

    print(f"  ✓ Unified view SQL generated")

    return unified_sql


def main():
    print("=" * 80)
    print("ORACLE DATABASE ANALYSIS - ELOSAÚDE PLATFORM")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Connect to Oracle
    connection = connect_to_oracle()
    cursor = connection.cursor()

    analysis_results = {
        'metadata': {
            'timestamp': datetime.now().isoformat(),
            'oracle_host': ORACLE_CONFIG['host'],
            'oracle_service': ORACLE_CONFIG['service_name']
        },
        'target_views': [],
        'dbaps_schema': [],
        'categorized_tables': {},
        'common_columns': {},
        'unified_view_sql': ''
    }

    try:
        # Analyze the 3 target views in detail
        print("\n" + "=" * 80)
        print("PHASE 1: ANALYZING TARGET VIEWS")
        print("=" * 80)

        for view_name in TARGET_VIEWS:
            view_analysis = analyze_view_detail(cursor, view_name)
            analysis_results['target_views'].append(view_analysis)

        # Find common columns
        analysis_results['common_columns'] = find_common_columns(analysis_results['target_views'])

        # Generate unified view SQL
        analysis_results['unified_view_sql'] = generate_unified_view_sql(
            analysis_results['target_views'],
            analysis_results['common_columns']
        )

        # Explore DBAPS schema
        print("\n" + "=" * 80)
        print("PHASE 2: EXPLORING DBAPS SCHEMA")
        print("=" * 80)

        analysis_results['dbaps_schema'] = explore_dbaps_schema(cursor)

        # Categorize tables
        analysis_results['categorized_tables'] = categorize_tables(analysis_results['dbaps_schema'])

        # Save results to JSON
        output_file = 'backend/scripts/oracle_analysis_results.json'
        print(f"\n💾 Saving analysis results to {output_file}...")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(analysis_results, f, indent=2, ensure_ascii=False)
        print(f"✓ Results saved successfully")

        print("\n" + "=" * 80)
        print("ANALYSIS COMPLETE!")
        print("=" * 80)
        print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"\nResults saved to: {output_file}")
        print("\nSummary:")
        print(f"  - Target views analyzed: {len(analysis_results['target_views'])}")
        print(f"  - Total objects in DBAPS: {len(analysis_results['dbaps_schema'])}")
        print(f"  - Common columns found: {len(analysis_results['common_columns'].get('all_views', []))}")

    except Exception as e:
        print(f"\n✗ Error during analysis: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        connection.close()
        print("\n✓ Database connection closed")


if __name__ == '__main__':
    main()
