#!/usr/bin/env python
"""
Test Oracle connection via Django ORM
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elosaude_backend.settings')
django.setup()

from apps.oracle_integration.models import OracleCarteirinha, OracleUnimed, OracleReciprocidade


def test_connection():
    """Test Oracle database connection"""
    print("=" * 80)
    print("TESTING ORACLE CONNECTION VIA DJANGO ORM")
    print("=" * 80)

    try:
        # Test Carteirinha
        print("\n1. Testing ESAU_V_APP_CARTEIRINHA...")
        carteirinha_count = OracleCarteirinha.objects.using('oracle').filter(sn_ativo='S').count()
        print(f"   ✓ Connected! Found {carteirinha_count:,} active records")

        # Get sample record
        sample = OracleCarteirinha.objects.using('oracle').filter(sn_ativo='S').first()
        if sample:
            print(f"   Sample: {sample.nome_do_beneficiario} - {sample.matricula}")

    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

    try:
        # Test Unimed
        print("\n2. Testing ESAU_V_APP_UNIMED...")
        unimed_count = OracleUnimed.objects.using('oracle').filter(sn_ativo='S').count()
        print(f"   ✓ Connected! Found {unimed_count:,} active records")

        # Get sample record
        sample = OracleUnimed.objects.using('oracle').filter(sn_ativo='S').first()
        if sample:
            print(f"   Sample: {sample.nome_do_beneficiario} - {sample.matricula_unimed}")

    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

    try:
        # Test Reciprocidade
        print("\n3. Testing ESAU_V_APP_RECIPROCIDADE...")
        reciprocidade_count = OracleReciprocidade.objects.using('oracle').filter(sn_ativo='S').count()
        print(f"   ✓ Connected! Found {reciprocidade_count:,} active records")

        # Get sample record
        sample = OracleReciprocidade.objects.using('oracle').filter(sn_ativo='S').first()
        if sample:
            print(f"   Sample: {sample.nome_beneficiario} - {sample.prestador_reciprocidade}")

    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

    print("\n" + "=" * 80)
    print("ALL TESTS PASSED!")
    print("=" * 80)
    print(f"\nTotal active records across all views:")
    print(f"  - Carteirinha:    {carteirinha_count:,}")
    print(f"  - Unimed:         {unimed_count:,}")
    print(f"  - Reciprocidade:  {reciprocidade_count:,}")
    print(f"  - TOTAL:          {carteirinha_count + unimed_count + reciprocidade_count:,}")

    return True


if __name__ == '__main__':
    success = test_connection()
    sys.exit(0 if success else 1)
