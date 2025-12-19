# Data Model: Tela de Reembolso

**Feature**: 001-reimbursement-screen
**Date**: 2025-12-15
**Status**: Existing (documented)

## Entity Relationship Diagram

```
┌─────────────────────┐     ┌───────────────────────────┐
│    Beneficiary      │     │   ReimbursementRequest    │
├─────────────────────┤     ├───────────────────────────┤
│ id (PK)             │1───*│ id (PK)                   │
│ full_name           │     │ beneficiary_id (FK)       │
│ cpf                 │     │ protocol_number (unique)  │
│ ...                 │     │ expense_type              │
└─────────────────────┘     │ service_date              │
                            │ service_description       │
                            │ provider_name             │
                            │ provider_cnpj_cpf         │
                            │ requested_amount          │
                            │ approved_amount           │
                            │ bank_details (JSON)       │
                            │ status                    │
                            │ request_date              │
                            │ analysis_date             │
                            │ payment_date              │
                            │ notes                     │
                            │ denial_reason             │
                            │ created_at                │
                            │ updated_at                │
                            └───────────────────────────┘
                                         │
                                         │ 1
                                         │
                                         │ *
                            ┌───────────────────────────┐
                            │  ReimbursementDocument    │
                            ├───────────────────────────┤
                            │ id (PK)                   │
                            │ reimbursement_id (FK)     │
                            │ document_type             │
                            │ file                      │
                            │ description               │
                            │ uploaded_at               │
                            └───────────────────────────┘
```

## Entities

### ReimbursementRequest

Representa uma solicitação de reembolso feita pelo beneficiário.

**Location**: `backend/apps/reimbursements/models.py`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, Auto | Identificador único |
| beneficiary | FK(Beneficiary) | Required | Beneficiário solicitante |
| protocol_number | String(50) | Unique, Auto-generated | Formato: REIMB + 10 dígitos |
| expense_type | String(20) | Choices | Tipo de despesa médica |
| service_date | Date | Required | Data do atendimento |
| service_description | Text | Required | Descrição do serviço |
| provider_name | String(200) | Required | Nome do prestador |
| provider_cnpj_cpf | String(14) | Required | CNPJ ou CPF do prestador |
| requested_amount | Decimal(10,2) | Required | Valor solicitado |
| approved_amount | Decimal(10,2) | Nullable | Valor aprovado |
| bank_details | JSON | Required | Dados bancários para depósito |
| status | String(20) | Choices, Default='IN_ANALYSIS' | Status da solicitação |
| request_date | DateTime | Auto | Data da solicitação |
| analysis_date | DateTime | Nullable | Data da análise |
| payment_date | Date | Nullable | Data do pagamento |
| notes | Text | Optional | Observações internas |
| denial_reason | Text | Optional | Motivo da negativa |
| created_at | DateTime | Auto | Criação do registro |
| updated_at | DateTime | Auto | Última atualização |

**Expense Types (Choices)**:
| Value | Display |
|-------|---------|
| CONSULTATION | Consulta Médica |
| EXAM | Exame Médico |
| MEDICATION | Medicamento |
| HOSPITALIZATION | Internação |
| SURGERY | Cirurgia |
| THERAPY | Terapia |
| OTHER | Outro |

**Status (Choices)**:
| Value | Display | Description |
|-------|---------|-------------|
| IN_ANALYSIS | Em Análise | Aguardando análise da operadora |
| APPROVED | Aprovado | Valor total aprovado |
| PARTIALLY_APPROVED | Parcialmente Aprovado | Valor parcial aprovado |
| DENIED | Negado | Solicitação negada |
| PAID | Pago | Reembolso pago ao beneficiário |
| CANCELLED | Cancelado | Solicitação cancelada |

**Bank Details (JSON Structure)**:
```json
{
  "bank": "001",
  "bank_name": "Banco do Brasil",
  "agency": "1234",
  "account": "56789-0",
  "account_type": "CORRENTE"
}
```

### ReimbursementDocument

Representa um documento anexado à solicitação de reembolso.

**Location**: `backend/apps/reimbursements/models.py`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, Auto | Identificador único |
| reimbursement | FK(ReimbursementRequest) | Required, CASCADE | Solicitação relacionada |
| document_type | String(20) | Choices | Tipo do documento |
| file | FileField | Required | Arquivo do documento |
| description | String(200) | Optional | Descrição do arquivo |
| uploaded_at | DateTime | Auto | Data do upload |

**Document Types (Choices)**:
| Value | Display |
|-------|---------|
| INVOICE | Nota Fiscal/Recibo |
| PRESCRIPTION | Receita Médica |
| REPORT | Relatório Médico |
| RECEIPT | Comprovante de Pagamento |
| OTHER | Outro |

**File Storage**:
- Path: `reimbursements/documents/`
- Max size: 10MB (validated on mobile)
- Accepted formats: PDF, JPG, PNG

## State Transitions

```
                    ┌─────────────────┐
                    │   IN_ANALYSIS   │ ←── Initial state
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌──────────┐     ┌──────────────┐   ┌──────────┐
    │ APPROVED │     │ PARTIALLY_   │   │  DENIED  │
    └────┬─────┘     │   APPROVED   │   └──────────┘
         │           └──────┬───────┘
         │                  │
         └────────┬─────────┘
                  ▼
           ┌──────────┐
           │   PAID   │ ←── Final state (success)
           └──────────┘

Note: CANCELLED can occur from IN_ANALYSIS only (not in scope)
```

## Validation Rules

### ReimbursementRequest

| Rule | Field(s) | Validation |
|------|----------|------------|
| VR-001 | requested_amount | Must be > 0 |
| VR-002 | service_date | Must not be in the future |
| VR-003 | provider_cnpj_cpf | Must be valid CPF (11 digits) or CNPJ (14 digits) |
| VR-004 | bank_details | Must contain bank, agency, account, account_type |
| VR-005 | status transition | IN_ANALYSIS → APPROVED/PARTIALLY_APPROVED/DENIED only |
| VR-006 | approved_amount | Required when status is APPROVED or PARTIALLY_APPROVED |
| VR-007 | payment_date | Required when status is PAID |

### ReimbursementDocument

| Rule | Field(s) | Validation |
|------|----------|------------|
| VR-008 | file | Max 10MB |
| VR-009 | file | Must be PDF, JPG, or PNG |
| VR-010 | reimbursement.status | Must be IN_ANALYSIS to add new documents |

## Indexes

| Table | Index | Columns | Type |
|-------|-------|---------|------|
| ReimbursementRequest | idx_beneficiary | beneficiary_id | B-Tree |
| ReimbursementRequest | idx_status | status | B-Tree |
| ReimbursementRequest | idx_request_date | request_date | B-Tree |
| ReimbursementDocument | idx_reimbursement | reimbursement_id | B-Tree |

## Mobile Type Definitions

```typescript
// Existing in mobile/src/store/services/api.ts

export interface Reimbursement {
  id: number;
  protocol_number: string;
  beneficiary_name: string;
  expense_type: string;
  expense_type_display: string;
  service_date: string;
  provider_name: string;
  requested_amount: string;
  approved_amount: string | null;
  status: string;
  status_display: string;
  created_at: string;
}

export interface ReimbursementSummary {
  total_requested: number;
  total_approved: number;
  pending_count: number;
  approved_count: number;
}

// To be added for add-documents feature
export interface ReimbursementDocument {
  id: number;
  document_type: string;
  document_type_display: string;
  description: string;
  file_url: string;
  uploaded_at: string;
}
```
