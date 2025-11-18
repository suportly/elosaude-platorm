#!/usr/bin/env python
"""
Test Oracle connection via direct oracledb connection
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elosaude_backend.settings')
django.setup()

from apps.oracle_integration.connection import OracleConnection


def test_direct_connection():
    """Test Oracle database connection"""
    print("=" * 80)
    print("TESTING ORACLE DIRECT CONNECTION")
    print("=" * 80)

    try:
        # Test basic connection
        print("\n1. Testing connection...")
        OracleConnection.test_connection()
        print("   ✓ Connection successful!")

    except Exception as e:
        print(f"   ✗ Connection failed: {e}")
        return False

    try:
        # Test Carteirinha query
        print("\n2. Testing ESAU_V_APP_CARTEIRINHA...")
        carteirinha_query = "SELECT COUNT(*) AS CNT FROM DBAPS.ESAU_V_APP_CARTEIRINHA WHERE SN_ATIVO = 'S'"
        result = OracleConnection.execute_query(carteirinha_query)
        count = result[0]['CNT'] if result else 0
        print(f"   ✓ Found {count:,} active records")

        # Get sample
        sample_query = "SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRINHA WHERE SN_ATIVO = 'S' AND ROWNUM <= 1"
        sample = OracleConnection.execute_query(sample_query)
        if sample:
            print(f"   Sample: {sample[0].get('NOME_DO_BENEFICIARIO')} - {sample[0].get('MATRICULA')}")

    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

    try:
        # Test Unimed query (query total count only due to PL/SQL function issue)
        print("\n3. Testing ESAU_V_APP_UNIMED...")
        unimed_count_query = "SELECT COUNT(*) AS CNT FROM DBAPS.ESAU_V_APP_UNIMED"
        result = OracleConnection.execute_query(unimed_count_query)
        count = result[0]['CNT'] if result else 0
        print(f"   ✓ Found {count:,} total records")
        print(f"   ℹ Note: This view requires CPF filter in production (PL/SQL function)")

    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

    try:
        # Test Reciprocidade query
        print("\n4. Testing ESAU_V_APP_RECIPROCIDADE...")
        reciprocidade_query = "SELECT COUNT(*) AS CNT FROM DBAPS.ESAU_V_APP_RECIPROCIDADE WHERE SN_ATIVO = 'S'"
        result = OracleConnection.execute_query(reciprocidade_query)
        count = result[0]['CNT'] if result else 0
        print(f"   ✓ Found {count:,} active records")

    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

    print("\n" + "=" * 80)
    print("ALL TESTS PASSED!")
    print("=" * 80)

    return True


if __name__ == '__main__':
    success = test_direct_connection()
    sys.exit(0 if success else 1)
