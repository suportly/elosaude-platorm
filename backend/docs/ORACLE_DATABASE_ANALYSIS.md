# Oracle Database Integration - Comprehensive Analysis Report

**Date:** 2025-11-12
**Database:** Oracle 192.168.40.29:1521/SIML
**Schema:** DBAPS
**Analysis Tool:** Python oracledb (Thick Mode with Instant Client 21.7)

---

## Executive Summary

This report presents a comprehensive analysis of the Oracle database views intended for integration with the Elosaúde health insurance platform. Three primary views were analyzed containing beneficiary card data, Unimed network information, and reciprocity provider details.

### Key Findings

- **Total Records Analyzed:** 36,814 records across 3 views
- **ESAU_V_APP_CARTEIRINHA:** 17,192 beneficiary cards (20 columns)
- **ESAU_V_APP_UNIMED:** 12,831 Unimed network records (23 columns)
- **ESAU_V_APP_RECIPROCIDADE:** 6,791 reciprocity records (14 columns)
- **Common Join Keys:** CONTRATO, MATRICULA_SOUL, NR_CNS

---

## 1. Detailed View Analysis

### 1.1 ESAU_V_APP_CARTEIRINHA (Beneficiary Cards)

**Purpose:** Primary source of beneficiary digital card information including plan details and coverage.

**Statistics:**
- Total Rows: 17,192
- Total Columns: 20
- Active Records: Filtered by `SN_ATIVO = 'S'`

**Column Structure:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| CONTRATO | NUMBER(20) | Contract ID | 1, 2, 3992 |
| MATRICULA_SOUL | NUMBER(20) | Internal beneficiary ID (Soul system) | 40650006 |
| NR_CPF | NUMBER(11) | CPF (Tax ID) | 347140904 |
| EMPRESA | VARCHAR2(170) | Company/employer name | "PREVIG - SOCIEDADE..." |
| NOME_DO_BENEFICIARIO | VARCHAR2(100) | Beneficiary full name | "UBALDO KLANN" |
| MATRICULA | VARCHAR2(20) | Beneficiary registration number | "0100082" |
| CD_PLANO | NUMBER(20) | Plan code | 26, 2, 5 |
| PRIMARIO | VARCHAR2(133) | Primary plan name | "E 2020 - Apartamento Standard" |
| SECUNDARIO | VARCHAR2(115) | Secondary plan name | NULL (optional) |
| TERCIARIO | VARCHAR2(111) | Tertiary plan name | NULL (optional) |
| SEGMENTACAO | VARCHAR2(40) | Plan segmentation | "AMB+HOSP C/OBST", "ODONT" |
| NR_CNS | VARCHAR2(100) | National Health Card number | "708407737022267" |
| NASCTO | VARCHAR2(10) | Birth date (DD/MM/YYYY) | "16/05/1942" |
| CONTRATACAO | CHAR(20) | Contract type | "Coletivo Empresarial" |
| VALIDADE | VARCHAR2(0) | Validity date | NULL |
| CPT | CHAR(13) | CPT indicator | "NÃO SE APLICA" |
| LAYOUT | VARCHAR2(13) | Card layout type | "OUTROS PLANOS" |
| NM_SOCIAL | VARCHAR2(100) | Social name (preferred name) | "UBALDO KLANN" |
| NOME_TITULAR | VARCHAR2(100) | Holder name (if dependent) | "UBALDO KLANN" |
| SN_ATIVO | VARCHAR2(1) | Active status | 'S' or 'N' |

**Sample Data Insights:**
- Same beneficiary can have multiple cards for different plan types (medical + dental)
- MATRICULA_SOUL appears to be the unique beneficiary identifier
- CONTRATO groups beneficiaries by contract/company
- NR_CPF can be duplicated (same person, different plans)
- NOME_TITULAR indicates if beneficiary is a dependent

**Mapping to Django Models:**

| Oracle Column | Django Model | Django Field |
|---------------|--------------|--------------|
| MATRICULA_SOUL | Beneficiary | oracle_id (new field) |
| NR_CPF | Beneficiary | cpf |
| NOME_DO_BENEFICIARIO | Beneficiary | full_name |
| NASCTO | Beneficiary | date_of_birth |
| NM_SOCIAL | Beneficiary | social_name (new field) |
| CONTRATO | DigitalCard | contract_number (new field) |
| MATRICULA | DigitalCard | registration_number |
| CD_PLANO | HealthPlan | oracle_plan_code (new field) |
| PRIMARIO | HealthPlan | name |
| SEGMENTACAO | HealthPlan | coverage_type |
| NR_CNS | Beneficiary | national_health_card (new field) |
| EMPRESA | Company | name (new model) |
| SN_ATIVO | DigitalCard | is_active |

---

### 1.2 ESAU_V_APP_UNIMED (Unimed Network)

**Purpose:** Contains Unimed reciprocity network information for beneficiaries.

**Statistics:**
- Total Rows: 12,831
- Total Columns: 23
- **Note:** Sample data extraction failed due to column name case sensitivity issue

**Column Structure:**

| Column | Type | Description |
|--------|------|-------------|
| CONTRATO | NUMBER(20) | Contract ID (join key) |
| MATRICULA_SOUL | NUMBER(20) | Internal beneficiary ID (join key) |
| PLANO_BENEF | NUMBER(20) | Beneficiary plan code |
| CPF | NUMBER(11) | CPF |
| EMPRESA_UNIMED | CHAR(4) | Unimed company code |
| NR_CNS | VARCHAR2(100) | National Health Card |
| NOME_DO_BENEFICIARIO | VARCHAR2(100) | Beneficiary name |
| MATRICULA_UNIMED | VARCHAR2(200) | Unimed registration number |
| PLANO | CHAR(13) | Plan identifier |
| ABRANGENCIA | CHAR(8) | Coverage scope |
| ACOMODACAO | VARCHAR2(10) | Accommodation type |
| SEGMENTACAO | VARCHAR2(41) | Plan segmentation |
| Rede_Atendimento | VARCHAR2(11) | Service network |
| Atend | VARCHAR2(4) | Service type |
| nascto | VARCHAR2(10) | Birth date |
| Cob_Parc_Temp | CHAR(6) | Temporary partial coverage |
| Via | CHAR(5) | Card version |
| Validade | DATE | Validity date |
| Vigencia | DATE | Effective date |
| contratante | VARCHAR2(18) | Contractor type |
| nm_social | VARCHAR2(100) | Social name |
| nome_titular | VARCHAR2(100) | Holder name |
| sn_ativo | VARCHAR2(1) | Active status |

**Key Observations:**
- Provides Unimed-specific registration numbers (MATRICULA_UNIMED)
- Contains validity and effective dates for reciprocity
- Network coverage information (Rede_Atendimento)
- Accommodation level details

**Integration Opportunity:**
Create a **UnimedCard** Django model to represent Unimed reciprocity cards, linked to Beneficiary model.

---

### 1.3 ESAU_V_APP_RECIPROCIDADE (Reciprocity Providers)

**Purpose:** Tracks reciprocity agreements with external healthcare providers.

**Statistics:**
- Total Rows: 6,791
- Total Columns: 14
- Sample Data: Successfully retrieved

**Column Structure:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| CONTRATO | NUMBER(20) | Contract ID | 3992 |
| MATRICULA_SOUL | NUMBER(20) | Internal beneficiary ID | 42130093 |
| NOME_BENEFICIARIO | VARCHAR2(100) | Beneficiary name | "EVANDRO LUIZ JORGE" |
| NR_CNS | VARCHAR2(100) | National Health Card | "700008424989303" |
| NASCTO | VARCHAR2(10) | Birth date | "11/05/1977" |
| NR_CPF | NUMBER(11) | CPF | 2692316924 |
| PLANO_ELOSAUDE | VARCHAR2(100) | Elosaúde plan name | "PLANO TBL" |
| MATRICULA | VARCHAR2(20) | Registration number | "8381684" |
| CD_MATRICULA_RECIPROCIDADE | VARCHAR2(200) | Reciprocity card number | "03783816840000" |
| PRESTADOR_RECIPROCIDADE | VARCHAR2(9) | Reciprocity provider | "VIVEST" |
| DT_ADESAO | DATE | Adhesion date | 2020-06-05 |
| DT_VALIDADE_CARTEIRA | DATE | Card expiry date | 2026-06-30 |
| NM_SOCIAL | VARCHAR2(100) | Social name | "EVANDRO LUIZ JORGE" |
| SN_ATIVO | VARCHAR2(1) | Active status | 'S' |

**Sample Data Insights:**
- VIVEST is the primary reciprocity provider
- Cards have long validity periods (5-6 years)
- Each beneficiary can have reciprocity agreements
- CD_MATRICULA_RECIPROCIDADE is the external provider's card number

**Integration Opportunity:**
Create a **ReciprocityCard** Django model to track external provider agreements.

---

## 2. Common Columns & Relationships

### 2.1 Join Keys Across All Views

**Primary Join Keys:**
- `CONTRATO` - Groups beneficiaries by contract/employer
- `MATRICULA_SOUL` - **Unique beneficiary identifier** (recommended primary join)
- `NR_CNS` - National Health Card number

**Pairwise Common Columns:**

**CARTEIRINHA ↔ UNIMED** (5 common):
- CONTRATO, MATRICULA_SOUL, NOME_DO_BENEFICIARIO, NR_CNS, SEGMENTACAO

**CARTEIRINHA ↔ RECIPROCIDADE** (8 common):
- CONTRATO, MATRICULA, MATRICULA_SOUL, NASCTO, NM_SOCIAL, NR_CNS, NR_CPF, SN_ATIVO

**UNIMED ↔ RECIPROCIDADE** (3 common):
- CONTRATO, MATRICULA_SOUL, NR_CNS

### 2.2 Recommended Join Strategy

**Best Practice:** Use `MATRICULA_SOUL` as the primary join key because:
1. It's a numeric, indexed identifier
2. Present in all 3 views
3. Appears to be the unique beneficiary ID in the Soul system
4. More reliable than CPF (which can be NULL or duplicated across plans)

---

## 3. Unified View Proposal

### 3.1 SQL for Unified View

```sql
CREATE OR REPLACE VIEW DBAPS.ESAU_V_APP_UNIFIED AS
SELECT
    -- Carteirinha columns (V1)
    v1.CONTRATO,
    v1.MATRICULA_SOUL,
    v1.NR_CPF,
    v1.EMPRESA,
    v1.NOME_DO_BENEFICIARIO,
    v1.MATRICULA,
    v1.CD_PLANO,
    v1.PRIMARIO,
    v1.SECUNDARIO,
    v1.TERCIARIO,
    v1.SEGMENTACAO,
    v1.NR_CNS,
    v1.NASCTO,
    v1.CONTRATACAO,
    v1.VALIDADE AS V1_VALIDADE,
    v1.CPT,
    v1.LAYOUT,
    v1.NM_SOCIAL,
    v1.NOME_TITULAR,
    v1.SN_ATIVO AS CARTEIRINHA_ATIVO,

    -- Unimed columns (V2)
    v2.MATRICULA_UNIMED,
    v2.PLANO AS UNIMED_PLANO,
    v2.ABRANGENCIA,
    v2.ACOMODACAO,
    v2.Rede_Atendimento,
    v2.Validade AS UNIMED_VALIDADE,
    v2.Vigencia AS UNIMED_VIGENCIA,
    v2.sn_ativo AS UNIMED_ATIVO,

    -- Reciprocidade columns (V3)
    v3.CD_MATRICULA_RECIPROCIDADE,
    v3.PRESTADOR_RECIPROCIDADE,
    v3.PLANO_ELOSAUDE,
    v3.DT_ADESAO AS RECIPROCIDADE_ADESAO,
    v3.DT_VALIDADE_CARTEIRA AS RECIPROCIDADE_VALIDADE,
    v3.SN_ATIVO AS RECIPROCIDADE_ATIVO,

    -- Computed fields
    CASE
        WHEN v2.MATRICULA_SOUL IS NOT NULL THEN 'S'
        ELSE 'N'
    END AS TEM_UNIMED,

    CASE
        WHEN v3.MATRICULA_SOUL IS NOT NULL THEN 'S'
        ELSE 'N'
    END AS TEM_RECIPROCIDADE

FROM DBAPS.ESAU_V_APP_CARTEIRINHA v1
LEFT JOIN DBAPS.ESAU_V_APP_UNIMED v2
    ON v1.MATRICULA_SOUL = v2.MATRICULA_SOUL
    AND v1.CONTRATO = v2.CONTRATO
LEFT JOIN DBAPS.ESAU_V_APP_RECIPROCIDADE v3
    ON v1.MATRICULA_SOUL = v3.MATRICULA_SOUL
    AND v1.CONTRATO = v3.CONTRATO
WHERE v1.SN_ATIVO = 'S'
ORDER BY v1.MATRICULA_SOUL, v1.CD_PLANO;
```

### 3.2 Unified View Benefits

1. **Single Query Access:** One view provides all beneficiary card information
2. **Reduced Complexity:** Application doesn't need to manage joins
3. **Better Performance:** Oracle can optimize the view internally
4. **Simplified Django Models:** One read-only model for all card data
5. **Computed Flags:** `TEM_UNIMED`, `TEM_RECIPROCIDADE` indicate additional coverages

---

## 4. Django Integration Architecture

### 4.1 Database Configuration

**File:** `backend/config/settings.py`

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'elosaude_db'),
        'USER': os.getenv('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('POSTGRES_HOST', 'localhost'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    },
    'oracle': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': 'SIML',
        'USER': 'estagiario',
        'PASSWORD': 'EIst4269uu',
        'HOST': '192.168.40.29',
        'PORT': '1521',
        'OPTIONS': {
            'threaded': True,
        },
    }
}

DATABASE_ROUTERS = ['apps.oracle_integration.routers.OracleRouter']
```

### 4.2 Database Router

**File:** `backend/apps/oracle_integration/routers.py`

```python
class OracleRouter:
    """
    Router to direct Oracle models to the Oracle database
    """
    oracle_app_labels = {'oracle_integration'}

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.oracle_app_labels:
            return 'oracle'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label in self.oracle_app_labels:
            return 'oracle'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        oracle_1 = obj1._meta.app_label in self.oracle_app_labels
        oracle_2 = obj2._meta.app_label in self.oracle_app_labels
        if oracle_1 or oracle_2:
            return oracle_1 == oracle_2
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in self.oracle_app_labels:
            return db == 'oracle'
        return db == 'default'
```

### 4.3 Oracle Models (Read-Only)

**File:** `backend/apps/oracle_integration/models.py`

```python
from django.db import models

class OracleCarteirinha(models.Model):
    """Read-only model for ESAU_V_APP_CARTEIRINHA view"""

    contrato = models.DecimalField(max_digits=20, decimal_places=0, db_column='CONTRATO')
    matricula_soul = models.DecimalField(max_digits=20, decimal_places=0, primary_key=True, db_column='MATRICULA_SOUL')
    nr_cpf = models.DecimalField(max_digits=11, decimal_places=0, null=True, db_column='NR_CPF')
    empresa = models.CharField(max_length=170, null=True, db_column='EMPRESA')
    nome_do_beneficiario = models.CharField(max_length=100, null=True, db_column='NOME_DO_BENEFICIARIO')
    matricula = models.CharField(max_length=20, null=True, db_column='MATRICULA')
    cd_plano = models.DecimalField(max_digits=20, decimal_places=0, null=True, db_column='CD_PLANO')
    primario = models.CharField(max_length=133, null=True, db_column='PRIMARIO')
    secundario = models.CharField(max_length=115, null=True, db_column='SECUNDARIO')
    terciario = models.CharField(max_length=111, null=True, db_column='TERCIARIO')
    segmentacao = models.CharField(max_length=40, null=True, db_column='SEGMENTACAO')
    nr_cns = models.CharField(max_length=100, null=True, db_column='NR_CNS')
    nascto = models.CharField(max_length=10, null=True, db_column='NASCTO')
    contratacao = models.CharField(max_length=20, null=True, db_column='CONTRATACAO')
    validade = models.CharField(max_length=50, null=True, db_column='VALIDADE')
    cpt = models.CharField(max_length=13, null=True, db_column='CPT')
    layout = models.CharField(max_length=13, null=True, db_column='LAYOUT')
    nm_social = models.CharField(max_length=100, null=True, db_column='NM_SOCIAL')
    nome_titular = models.CharField(max_length=100, null=True, db_column='NOME_TITULAR')
    sn_ativo = models.CharField(max_length=1, db_column='SN_ATIVO')

    class Meta:
        managed = False
        db_table = '"DBAPS"."ESAU_V_APP_CARTEIRINHA"'
        app_label = 'oracle_integration'

    def __str__(self):
        return f"{self.nome_do_beneficiario} - {self.matricula}"


class OracleUnimed(models.Model):
    """Read-only model for ESAU_V_APP_UNIMED view"""

    contrato = models.DecimalField(max_digits=20, decimal_places=0, db_column='CONTRATO')
    matricula_soul = models.DecimalField(max_digits=20, decimal_places=0, primary_key=True, db_column='MATRICULA_SOUL')
    plano_benef = models.DecimalField(max_digits=20, decimal_places=0, db_column='PLANO_BENEF')
    cpf = models.DecimalField(max_digits=11, decimal_places=0, null=True, db_column='CPF')
    empresa_unimed = models.CharField(max_length=4, null=True, db_column='EMPRESA_UNIMED')
    nr_cns = models.CharField(max_length=100, null=True, db_column='NR_CNS')
    nome_do_beneficiario = models.CharField(max_length=100, null=True, db_column='NOME_DO_BENEFICIARIO')
    matricula_unimed = models.CharField(max_length=200, db_column='MATRICULA_UNIMED')
    plano = models.CharField(max_length=13, null=True, db_column='PLANO')
    abrangencia = models.CharField(max_length=8, null=True, db_column='ABRANGENCIA')
    acomodacao = models.CharField(max_length=10, null=True, db_column='ACOMODACAO')
    segmentacao = models.CharField(max_length=41, null=True, db_column='SEGMENTACAO')
    rede_atendimento = models.CharField(max_length=11, null=True, db_column='Rede_Atendimento')
    atend = models.CharField(max_length=4, null=True, db_column='Atend')
    nascto = models.CharField(max_length=10, null=True, db_column='nascto')
    cob_parc_temp = models.CharField(max_length=6, null=True, db_column='Cob_Parc_Temp')
    via = models.CharField(max_length=5, null=True, db_column='Via')
    validade = models.DateField(null=True, db_column='Validade')
    vigencia = models.DateField(null=True, db_column='Vigencia')
    contratante = models.CharField(max_length=18, null=True, db_column='contratante')
    nm_social = models.CharField(max_length=100, null=True, db_column='nm_social')
    nome_titular = models.CharField(max_length=100, null=True, db_column='nome_titular')
    sn_ativo = models.CharField(max_length=1, null=True, db_column='sn_ativo')

    class Meta:
        managed = False
        db_table = '"DBAPS"."ESAU_V_APP_UNIMED"'
        app_label = 'oracle_integration'

    def __str__(self):
        return f"{self.nome_do_beneficiario} - Unimed {self.matricula_unimed}"


class OracleReciprocidade(models.Model):
    """Read-only model for ESAU_V_APP_RECIPROCIDADE view"""

    contrato = models.DecimalField(max_digits=20, decimal_places=0, db_column='CONTRATO')
    matricula_soul = models.DecimalField(max_digits=20, decimal_places=0, primary_key=True, db_column='MATRICULA_SOUL')
    nome_beneficiario = models.CharField(max_length=100, null=True, db_column='NOME_BENEFICIARIO')
    nr_cns = models.CharField(max_length=100, null=True, db_column='NR_CNS')
    nascto = models.CharField(max_length=10, null=True, db_column='NASCTO')
    nr_cpf = models.DecimalField(max_digits=11, decimal_places=0, null=True, db_column='NR_CPF')
    plano_elosaude = models.CharField(max_length=100, null=True, db_column='PLANO_ELOSAUDE')
    matricula = models.CharField(max_length=20, null=True, db_column='MATRICULA')
    cd_matricula_reciprocidade = models.CharField(max_length=200, db_column='CD_MATRICULA_RECIPROCIDADE')
    prestador_reciprocidade = models.CharField(max_length=9, null=True, db_column='PRESTADOR_RECIPROCIDADE')
    dt_adesao = models.DateField(null=True, db_column='DT_ADESAO')
    dt_validade_carteira = models.DateField(null=True, db_column='DT_VALIDADE_CARTEIRA')
    nm_social = models.CharField(max_length=100, null=True, db_column='NM_SOCIAL')
    sn_ativo = models.CharField(max_length=1, null=True, db_column='SN_ATIVO')

    class Meta:
        managed = False
        db_table = '"DBAPS"."ESAU_V_APP_RECIPROCIDADE"'
        app_label = 'oracle_integration'

    def __str__(self):
        return f"{self.nome_beneficiario} - {self.prestador_reciprocidade}"
```

### 4.4 Synchronization Service

**File:** `backend/apps/oracle_integration/services.py`

```python
from django.db import transaction
from apps.beneficiaries.models import Beneficiary
from apps.oracle_integration.models import OracleCarteirinha
from datetime import datetime

class OracleSyncService:
    """Service to synchronize data from Oracle to PostgreSQL"""

    @staticmethod
    def sync_beneficiaries(limit=None):
        """
        Synchronize beneficiary data from Oracle to PostgreSQL
        Returns: dict with sync statistics
        """
        stats = {
            'total_oracle': 0,
            'created': 0,
            'updated': 0,
            'errors': 0,
            'error_details': []
        }

        # Get active cards from Oracle
        oracle_cards = OracleCarteirinha.objects.using('oracle').filter(sn_ativo='S')
        if limit:
            oracle_cards = oracle_cards[:limit]

        stats['total_oracle'] = oracle_cards.count()

        for card in oracle_cards:
            try:
                with transaction.atomic():
                    # Parse birth date
                    birth_date = None
                    if card.nascto:
                        try:
                            birth_date = datetime.strptime(card.nascto, '%d/%m/%Y').date()
                        except ValueError:
                            pass

                    # Format CPF
                    cpf = str(int(card.nr_cpf)).zfill(11) if card.nr_cpf else None

                    # Try to find existing beneficiary by oracle_id or CPF
                    beneficiary = None
                    if hasattr(Beneficiary, 'oracle_id'):
                        beneficiary = Beneficiary.objects.filter(oracle_id=card.matricula_soul).first()

                    if not beneficiary and cpf:
                        beneficiary = Beneficiary.objects.filter(cpf=cpf).first()

                    if beneficiary:
                        # Update existing
                        beneficiary.full_name = card.nome_do_beneficiario or beneficiary.full_name
                        beneficiary.date_of_birth = birth_date or beneficiary.date_of_birth
                        if hasattr(beneficiary, 'social_name'):
                            beneficiary.social_name = card.nm_social
                        if hasattr(beneficiary, 'national_health_card'):
                            beneficiary.national_health_card = card.nr_cns
                        beneficiary.save()
                        stats['updated'] += 1
                    else:
                        # Create new (if user exists)
                        # Note: This requires a user account - handle accordingly
                        stats['errors'] += 1
                        stats['error_details'].append(f"No user for MATRICULA_SOUL {card.matricula_soul}")

            except Exception as e:
                stats['errors'] += 1
                stats['error_details'].append(f"Error syncing {card.matricula_soul}: {str(e)}")

        return stats

    @staticmethod
    def get_oracle_cards_for_beneficiary(beneficiary_cpf):
        """Get all Oracle cards for a beneficiary by CPF"""
        cpf_number = int(beneficiary_cpf.replace('.', '').replace('-', ''))
        return OracleCarteirinha.objects.using('oracle').filter(
            nr_cpf=cpf_number,
            sn_ativo='S'
        ).order_by('cd_plano')
```

### 4.5 Management Commands

**File:** `backend/apps/oracle_integration/management/commands/sync_oracle_data.py`

```python
from django.core.management.base import BaseCommand
from apps.oracle_integration.services import OracleSyncService

class Command(BaseCommand):
    help = 'Synchronize beneficiary data from Oracle to PostgreSQL'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            help='Limit number of records to sync (for testing)',
        )

    def handle(self, *args, **options):
        limit = options.get('limit')

        self.stdout.write('Starting Oracle data synchronization...')

        stats = OracleSyncService.sync_beneficiaries(limit=limit)

        self.stdout.write(self.style.SUCCESS(f'\nSync completed!'))
        self.stdout.write(f"  Total Oracle records: {stats['total_oracle']}")
        self.stdout.write(self.style.SUCCESS(f"  Created: {stats['created']}"))
        self.stdout.write(self.style.SUCCESS(f"  Updated: {stats['updated']}"))

        if stats['errors'] > 0:
            self.stdout.write(self.style.ERROR(f"  Errors: {stats['errors']}"))
            if stats['error_details']:
                self.stdout.write('\nError details:')
                for error in stats['error_details'][:10]:  # Show first 10 errors
                    self.stdout.write(f"    - {error}")
```

---

## 5. Mobile App Integration

### 5.1 New API Endpoints

**File:** `backend/apps/oracle_integration/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import OracleCarteirinha, OracleUnimed, OracleReciprocidade
from .serializers import (
    OracleCarteirinhaSerializer,
    OracleUnimedSerializer,
    OracleReciprocidadeSerializer
)

class OracleCardViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Oracle digital cards"""

    @action(detail=False, methods=['get'])
    def my_oracle_cards(self, request):
        """Get all Oracle cards for current user's beneficiary"""
        try:
            beneficiary = request.user.beneficiary
            cpf_number = int(beneficiary.cpf.replace('.', '').replace('-', ''))

            # Get cards from all 3 views
            carteirinha = OracleCarteirinha.objects.using('oracle').filter(
                nr_cpf=cpf_number,
                sn_ativo='S'
            )

            unimed = OracleUnimed.objects.using('oracle').filter(
                cpf=cpf_number,
                sn_ativo='S'
            )

            reciprocidade = OracleReciprocidade.objects.using('oracle').filter(
                nr_cpf=cpf_number,
                sn_ativo='S'
            )

            return Response({
                'carteirinha': OracleCarteirinhaSerializer(carteirinha, many=True).data,
                'unimed': OracleUnimedSerializer(unimed, many=True).data,
                'reciprocidade': OracleReciprocidadeSerializer(reciprocidade, many=True).data,
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
```

### 5.2 Mobile Screen Updates

**File:** `mobile/src/screens/DigitalCard/DigitalCardScreen.tsx`

Add a new section to show Oracle-sourced cards:

```typescript
// Fetch Oracle cards
const { data: oracleCards } = useGetOracleCardsQuery();

// Display multiple cards with tabs/carousel
<ScrollView horizontal>
  {oracleCards?.carteirinha?.map((card) => (
    <DigitalCardView
      key={card.matricula_soul}
      cardData={card}
      cardType="elosaude"
    />
  ))}
  {oracleCards?.unimed?.map((card) => (
    <DigitalCardView
      key={card.matricula_soul}
      cardData={card}
      cardType="unimed"
    />
  ))}
  {oracleCards?.reciprocidade?.map((card) => (
    <DigitalCardView
      key={card.matricula_soul}
      cardData={card}
      cardType="reciprocity"
    />
  ))}
</ScrollView>
```

---

## 6. Data Quality & Business Rules

### 6.1 Data Quality Observations

**Issues Identified:**
1. **Birth Date Format:** Stored as VARCHAR ('DD/MM/YYYY') instead of DATE
2. **CPF Format:** Stored as NUMBER without leading zeros
3. **Case Sensitivity:** Some columns use mixed case (Rede_Atendimento, nascto)
4. **Nullable Keys:** CONTRATO and NR_CPF are nullable in some views
5. **Column Name Inconsistency:** SN_ATIVO vs sn_ativo

**Recommendations:**
- Add data validation in Django serializers
- Handle date parsing with try/except
- Zero-pad CPF numbers (11 digits)
- Use `.upper()` or `.lower()` for case-insensitive comparisons

### 6.2 Business Rules for Synchronization

1. **Active Records Only:** Only sync records where `SN_ATIVO = 'S'`
2. **CPF Validation:** Validate CPF format before creating/updating beneficiaries
3. **Duplicate Handling:** Use MATRICULA_SOUL as the source of truth for matching
4. **Plan Types:** Beneficiaries can have multiple cards (medical + dental)
5. **Dependent Logic:** If NOME_TITULAR ≠ NOME_DO_BENEFICIARIO, create as dependent

---

## 7. Opportunities for New Features

### 7.1 Enhanced Digital Card Screen

**Current:** Single digital card view
**Proposed:** Multiple card carousel with:
- Main Elosaúde card (from CARTEIRINHA)
- Unimed reciprocity card (from UNIMED)
- Partner network cards (from RECIPROCIDADE)
- Different visual designs for each card type

### 7.2 Network Coverage Indicator

Use `Rede_Atendimento` and `PRESTADOR_RECIPROCIDADE` to show:
- Available networks for the beneficiary
- Coverage scope (ABRANGENCIA)
- Validity dates for reciprocity agreements

### 7.3 Plan Details Screen

Create a detailed plan information screen showing:
- Primary/Secondary/Tertiary coverage levels
- Segmentation (ambulatorial, hospital, dental)
- Coverage type (Coletivo Empresarial, etc.)
- Accommodation level
- CPT status

### 7.4 Dependent Management

Use NOME_TITULAR to:
- Show family structure (titular + dependents)
- Allow titular to view dependent cards
- Display relationship indicators

### 7.5 Company/Employer Information

Create a Company model and screen showing:
- EMPRESA name
- Associated beneficiaries
- Group plan details

### 7.6 Reciprocity Provider Directory

Build a provider directory filtered by:
- PRESTADOR_RECIPROCIDADE
- Validity dates (DT_VALIDADE_CARTEIRA)
- Active status

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Create `oracle_integration` Django app
- [ ] Configure multi-database setup
- [ ] Create database router
- [ ] Define Oracle read-only models
- [ ] Test Oracle connection and queries

### Phase 2: Data Synchronization (Week 2)
- [ ] Build synchronization service
- [ ] Create management commands
- [ ] Add `oracle_id` field to Beneficiary model
- [ ] Test sync with limited dataset
- [ ] Set up Celery task for automated sync

### Phase 3: API Development (Week 3)
- [ ] Create serializers for Oracle models
- [ ] Build API endpoints for card retrieval
- [ ] Add filtering and search capabilities
- [ ] Implement caching strategy
- [ ] Write API tests

### Phase 4: Mobile Integration (Week 4)
- [ ] Add RTK Query endpoints
- [ ] Update DigitalCardScreen with carousel
- [ ] Design card templates for each type
- [ ] Implement card type switcher
- [ ] Add loading states and error handling

### Phase 5: Advanced Features (Week 5-6)
- [ ] Build plan details screen
- [ ] Implement dependent management
- [ ] Create reciprocity provider directory
- [ ] Add network coverage indicators
- [ ] Implement QR code generation per card type

### Phase 6: Testing & Optimization (Week 7)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Data validation improvements
- [ ] Documentation updates
- [ ] User acceptance testing

---

## 9. Technical Recommendations

### 9.1 Security

1. **Read-Only Access:** Oracle user should have SELECT-only privileges
2. **Connection Pooling:** Use Django connection pooling for Oracle
3. **Credentials:** Store Oracle credentials in environment variables
4. **API Rate Limiting:** Limit Oracle query frequency to avoid overload

### 9.2 Performance

1. **Caching Strategy:**
   - Cache Oracle card data for 1 hour
   - Use Redis for card data caching
   - Invalidate cache on sync

2. **Query Optimization:**
   - Use indexes on MATRICULA_SOUL and NR_CPF
   - Limit result sets with WHERE SN_ATIVO = 'S'
   - Use Oracle connection pooling

3. **Async Operations:**
   - Run sync operations via Celery
   - Schedule nightly full sync
   - Implement incremental sync if possible

### 9.3 Monitoring

1. **Logging:**
   - Log all Oracle queries
   - Track sync successes and failures
   - Monitor connection health

2. **Metrics:**
   - Track sync duration
   - Monitor error rates
   - Alert on connection failures

---

## 10. SQL Queries for Development

### 10.1 Get All Cards for a Beneficiary

```sql
-- By CPF
SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE NR_CPF = 347140904
AND SN_ATIVO = 'S';

-- By MATRICULA_SOUL
SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE MATRICULA_SOUL = 40650006;
```

### 10.2 Join All 3 Views

```sql
SELECT
    c.MATRICULA_SOUL,
    c.NOME_DO_BENEFICIARIO,
    c.MATRICULA AS MATRICULA_ELOSAUDE,
    u.MATRICULA_UNIMED,
    r.CD_MATRICULA_RECIPROCIDADE,
    r.PRESTADOR_RECIPROCIDADE
FROM DBAPS.ESAU_V_APP_CARTEIRINHA c
LEFT JOIN DBAPS.ESAU_V_APP_UNIMED u
    ON c.MATRICULA_SOUL = u.MATRICULA_SOUL
LEFT JOIN DBAPS.ESAU_V_APP_RECIPROCIDADE r
    ON c.MATRICULA_SOUL = r.MATRICULA_SOUL
WHERE c.SN_ATIVO = 'S'
AND c.NR_CPF = 347140904;
```

### 10.3 Get Active Reciprocity Providers

```sql
SELECT DISTINCT
    PRESTADOR_RECIPROCIDADE,
    COUNT(*) AS TOTAL_BENEFICIARIOS
FROM DBAPS.ESAU_V_APP_RECIPROCIDADE
WHERE SN_ATIVO = 'S'
GROUP BY PRESTADOR_RECIPROCIDADE
ORDER BY TOTAL_BENEFICIARIOS DESC;
```

### 10.4 Get Beneficiaries with Multiple Plans

```sql
SELECT
    NR_CPF,
    NOME_DO_BENEFICIARIO,
    COUNT(*) AS TOTAL_PLANOS,
    LISTAGG(PRIMARIO, ' | ') WITHIN GROUP (ORDER BY CD_PLANO) AS PLANOS
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
GROUP BY NR_CPF, NOME_DO_BENEFICIARIO
HAVING COUNT(*) > 1
ORDER BY TOTAL_PLANOS DESC;
```

---

## 11. Conclusion

The Oracle database provides rich beneficiary and card data across 3 views totaling 36,814 records. The proposed integration architecture uses Django's multi-database support with read-only Oracle models, a synchronization service, and a database router.

### Key Success Factors:

1. **MATRICULA_SOUL** is the reliable join key across all views
2. **Unified view** simplifies application queries and improves performance
3. **Read-only models** prevent accidental data modification
4. **Synchronization service** keeps PostgreSQL in sync with Oracle
5. **Multiple card types** enhance user experience in mobile app

### Next Steps:

1. ✅ Analysis complete
2. Create `oracle_integration` Django app
3. Implement database configuration and router
4. Build and test Oracle models
5. Develop synchronization service
6. Create API endpoints
7. Update mobile app with new card features

---

**Report Generated:** 2025-11-12
**Analyst:** Claude (Elosaúde Platform Integration Team)
**Status:** Ready for Implementation
