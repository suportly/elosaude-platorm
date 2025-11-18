#!/usr/bin/env python
"""
Check Oracle user permissions
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elosaude_backend.settings')
django.setup()

from apps.oracle_integration.connection import OracleConnection


def check_permissions():
    """Check Oracle user permissions and capabilities"""
    print("=" * 80)
    print("CHECKING ORACLE USER PERMISSIONS")
    print("=" * 80)

    # Check current user
    print("\n1. Current User Information:")
    try:
        user_query = "SELECT USER FROM DUAL"
        result = OracleConnection.execute_query(user_query)
        current_user = result[0]['USER'] if result else 'UNKNOWN'
        print(f"   Current User: {current_user}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

    # Check privileges
    print("\n2. User Privileges:")
    try:
        privs_query = """
            SELECT PRIVILEGE
            FROM USER_SYS_PRIVS
            ORDER BY PRIVILEGE
        """
        privs = OracleConnection.execute_query(privs_query)
        if privs:
            print(f"   Found {len(privs)} system privileges:")
            for priv in privs:
                print(f"   - {priv['PRIVILEGE']}")
        else:
            print("   ℹ No system privileges found")
    except Exception as e:
        print(f"   Note: {e}")

    # Check role privileges
    print("\n3. Role Privileges:")
    try:
        role_privs_query = """
            SELECT GRANTED_ROLE
            FROM USER_ROLE_PRIVS
            ORDER BY GRANTED_ROLE
        """
        roles = OracleConnection.execute_query(role_privs_query)
        if roles:
            print(f"   Found {len(roles)} roles:")
            for role in roles:
                print(f"   - {role['GRANTED_ROLE']}")
        else:
            print("   ℹ No roles found")
    except Exception as e:
        print(f"   Note: {e}")

    # Check table privileges
    print("\n4. Table Privileges:")
    try:
        table_privs_query = """
            SELECT OWNER, TABLE_NAME, PRIVILEGE
            FROM USER_TAB_PRIVS
            WHERE ROWNUM <= 20
            ORDER BY OWNER, TABLE_NAME
        """
        table_privs = OracleConnection.execute_query(table_privs_query)
        if table_privs:
            print(f"   Found {len(table_privs)} table privileges (showing first 20):")
            for priv in table_privs[:10]:
                print(f"   - {priv['PRIVILEGE']} on {priv['OWNER']}.{priv['TABLE_NAME']}")
        else:
            print("   ℹ No table privileges found")
    except Exception as e:
        print(f"   Note: {e}")

    # Check if user can create tables
    print("\n5. Testing CREATE TABLE Permission:")
    try:
        test_create = """
            CREATE TABLE TEST_DJANGO_MIGRATION_CHECK (
                ID NUMBER(10) PRIMARY KEY,
                TEST_FIELD VARCHAR2(100)
            )
        """
        conn = OracleConnection.get_connection()
        cursor = conn.cursor()
        cursor.execute(test_create)
        print("   ✓ CREATE TABLE permission: YES")

        # Clean up
        cursor.execute("DROP TABLE TEST_DJANGO_MIGRATION_CHECK")
        conn.commit()
        cursor.close()
        print("   ✓ Test table created and dropped successfully")
    except Exception as e:
        print(f"   ✗ CREATE TABLE permission: NO")
        print(f"   Error: {e}")
        print("\n   ⚠️  WARNING: User does not have CREATE TABLE permission!")
        print("   Django migrations will FAIL without this permission.")
        print("\n   Possible solutions:")
        print("   1. Contact Oracle DBA to grant CREATE TABLE, CREATE SEQUENCE")
        print("   2. Use a different Oracle user with write permissions")
        print("   3. Keep PostgreSQL for Django tables, use Oracle only for DBAPS views")

    # Check schemas accessible
    print("\n6. Accessible Schemas:")
    try:
        schemas_query = """
            SELECT DISTINCT OWNER
            FROM ALL_TABLES
            WHERE OWNER IN ('DBAPS', USER)
            ORDER BY OWNER
        """
        schemas = OracleConnection.execute_query(schemas_query)
        if schemas:
            for schema in schemas:
                print(f"   - {schema['OWNER']}")

        # Count tables in each
        for schema in schemas:
            owner = schema['OWNER']
            count_query = f"SELECT COUNT(*) AS CNT FROM ALL_TABLES WHERE OWNER = '{owner}'"
            count_result = OracleConnection.execute_query(count_query)
            count = count_result[0]['CNT'] if count_result else 0
            print(f"     ({count} tables)")
    except Exception as e:
        print(f"   Note: {e}")

    print("\n" + "=" * 80)
    print("PERMISSION CHECK COMPLETE")
    print("=" * 80)

    return True


if __name__ == '__main__':
    success = check_permissions()
    sys.exit(0 if success else 1)
