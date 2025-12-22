# Data Model: Painel Administrativo Web

**Feature**: 006-web-admin
**Date**: 2025-12-21
**Status**: Complete

## Entity Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXISTING ENTITIES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  User (Django)  ─────┬──> Beneficiary ──> Company                           │
│       │              │         │          HealthPlan                         │
│       │              │         └──> ReimbursementRequest ──> ReimbursementDoc│
│       │              │                                                       │
│       │              └──> AccreditedProvider ──> Specialty                   │
│       │                          │                                           │
│       │                          └──> ProviderReview                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                            NEW ENTITIES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  AdminProfile ──────────> AuditLog                                          │
│       │                                                                      │
│       └─────────────────> SystemConfiguration                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Existing Entities (Backend - Read/Manage via Admin)

### User (Django Built-in)
Django's built-in User model, extended with `is_staff` flag for admin access.

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| username | String(150) | Unique username |
| email | String(254) | Email address |
| password | String(128) | Hashed password |
| first_name | String(150) | First name |
| last_name | String(150) | Last name |
| is_staff | Boolean | Admin access flag |
| is_active | Boolean | Account active |
| is_superuser | Boolean | Superadmin flag |
| last_login | DateTime | Last login timestamp |
| date_joined | DateTime | Registration date |

---

### Beneficiary (apps.beneficiaries)
Healthcare plan beneficiaries (titular or dependents).

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| user | FK(User) | Optional linked user |
| registration_number | String(50) | Unique "ELO" number |
| cpf | String(11) | Unique CPF |
| full_name | String(200) | Full name |
| birth_date | Date | Birth date |
| gender | Enum | M, F, OTHER |
| phone | String(20) | Phone |
| email | String | Email |
| address | Text | Address |
| city | String(100) | City |
| state | String(2) | State (UF) |
| zip_code | String(8) | CEP |
| beneficiary_type | Enum | TITULAR, DEPENDENT |
| titular | FK(self) | Reference to titular (if dependent) |
| company | FK(Company) | Sponsor company |
| health_plan | FK(HealthPlan) | Health plan |
| status | Enum | ACTIVE, SUSPENDED, CANCELLED |
| enrollment_date | Date | Enrollment date |
| created_at | DateTime | Created timestamp |
| updated_at | DateTime | Updated timestamp |

**State Transitions**:
```
ACTIVE ──> SUSPENDED ──> ACTIVE
   │                        │
   └───────> CANCELLED <────┘
```

---

### AccreditedProvider (apps.providers)
Accredited healthcare providers.

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| provider_type | Enum | DOCTOR, CLINIC, LABORATORY, HOSPITAL, PHARMACY |
| name | String(200) | Official name |
| trade_name | String(200) | Trade name |
| cnpj | String(14) | CNPJ (optional) |
| crm | String(20) | CRM for doctors |
| phone | String(20) | Phone |
| email | String | Email |
| website | URL | Website |
| address | Text | Address |
| city | String(100) | City |
| state | String(2) | State |
| zip_code | String(8) | CEP |
| latitude | Decimal(9,6) | Latitude |
| longitude | Decimal(9,6) | Longitude |
| specialties | M2M(Specialty) | Medical specialties |
| accepts_telemedicine | Boolean | Telemedicine flag |
| accepts_emergency | Boolean | Emergency flag |
| working_hours | JSON | Working hours |
| rating | Decimal(3,2) | Average rating |
| total_reviews | Integer | Review count |
| is_active | Boolean | Active status |
| created_at | DateTime | Created timestamp |
| updated_at | DateTime | Updated timestamp |

**State Transitions (for admin approval)**:
```
[NEW] ──> PENDING ──> ACTIVE
              │           │
              └──> REJECTED │
                           │
               INACTIVE <──┘
```

Note: Current model has only `is_active`. Consider adding `status` field for pending approvals.

---

### ReimbursementRequest (apps.reimbursements)
Reimbursement requests from beneficiaries.

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| beneficiary | FK(Beneficiary) | Requesting beneficiary |
| protocol_number | String(50) | Unique "REIMB" protocol |
| expense_type | Enum | CONSULTATION, EXAM, MEDICATION, etc. |
| service_date | Date | Service date |
| service_description | Text | Description |
| provider_name | String(200) | Provider name |
| provider_cnpj_cpf | String(14) | Provider document |
| requested_amount | Decimal(10,2) | Requested amount |
| approved_amount | Decimal(10,2) | Approved amount (nullable) |
| bank_details | JSON | Bank account info |
| status | Enum | IN_ANALYSIS, APPROVED, PARTIALLY_APPROVED, DENIED, PAID, CANCELLED |
| request_date | DateTime | Request timestamp |
| analysis_date | DateTime | Analysis timestamp |
| payment_date | Date | Payment date |
| notes | Text | Internal notes |
| denial_reason | Text | Denial reason |
| created_at | DateTime | Created timestamp |
| updated_at | DateTime | Updated timestamp |

**State Transitions**:
```
IN_ANALYSIS ──┬──> APPROVED ──────────> PAID
              │         │
              ├──> PARTIALLY_APPROVED ──> PAID
              │
              └──> DENIED

ANY_STATE ──> CANCELLED (except PAID)
```

---

## New Entities (Admin-Specific)

### AdminProfile (NEW - apps.admin_api)
Extended profile for admin users with role-based permissions.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | Integer | Primary key | Auto |
| user | OneToOne(User) | Django User | Required |
| role | Enum | ADMIN, SUPER_ADMIN, VIEWER | Required |
| department | String(100) | Department | Optional |
| phone | String(20) | Contact phone | Optional |
| last_activity | DateTime | Last activity | Auto-updated |
| login_count | Integer | Login count | Default 0 |
| failed_login_attempts | Integer | Failed attempts | Default 0, max 5 |
| locked_until | DateTime | Lock expiry | Nullable |
| created_at | DateTime | Created | Auto |
| updated_at | DateTime | Updated | Auto |

**Roles**:
- `SUPER_ADMIN`: Full access, can manage other admins
- `ADMIN`: Full CRUD access to entities
- `VIEWER`: Read-only access (reports, dashboard)

**Validation Rules**:
- User must have `is_staff=True`
- `failed_login_attempts` resets to 0 on successful login
- `locked_until` set to `now + 15min` when `failed_login_attempts >= 5`

---

### AuditLog (NEW - apps.admin_api)
Immutable audit trail for all admin actions.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | Integer | Primary key | Auto |
| admin | FK(User) | Admin who performed action | Required |
| action | Enum | CREATE, UPDATE, DELETE, VIEW, APPROVE, REJECT, EXPORT | Required |
| entity_type | String(50) | Model name | Required |
| entity_id | Integer | Entity primary key | Required |
| entity_repr | String(200) | String representation | Required |
| changes | JSON | Before/after values | Nullable |
| ip_address | String(45) | Client IP | Required |
| user_agent | String(256) | Browser info | Optional |
| timestamp | DateTime | Action timestamp | Auto |
| session_id | String(64) | Session identifier | Optional |

**Index Requirements**:
- `(admin, timestamp)` - For admin activity queries
- `(entity_type, entity_id)` - For entity history queries
- `(timestamp)` - For date range queries

**Validation Rules**:
- Immutable: No UPDATE or DELETE allowed
- `changes` format: `{"field": {"old": value, "new": value}, ...}`

---

### SystemConfiguration (NEW - apps.admin_api)
System-wide configuration settings.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | Integer | Primary key | Auto |
| key | String(100) | Unique config key | Required, unique |
| value | JSON | Configuration value | Required |
| category | Enum | GENERAL, SECURITY, NOTIFICATIONS, REPORTS, INTEGRATION | Required |
| description | String(500) | Description | Required |
| is_sensitive | Boolean | Hide value in UI | Default False |
| last_modified_by | FK(User) | Last modifier | Required |
| created_at | DateTime | Created | Auto |
| updated_at | DateTime | Updated | Auto |

**Pre-defined Keys**:
| Key | Category | Default | Description |
|-----|----------|---------|-------------|
| `session_timeout_minutes` | SECURITY | 30 | Session timeout |
| `max_login_attempts` | SECURITY | 5 | Max failed logins |
| `lockout_duration_minutes` | SECURITY | 15 | Account lockout duration |
| `export_max_rows` | REPORTS | 10000 | Max export rows |
| `email_notifications_enabled` | NOTIFICATIONS | true | Email notifications |
| `audit_retention_days` | GENERAL | 365 | Audit log retention |

---

## Dashboard Aggregation Views (Virtual)

These are not stored entities but aggregated views for the dashboard.

### DashboardMetrics
| Metric | Calculation |
|--------|-------------|
| total_beneficiaries | COUNT(Beneficiary WHERE status=ACTIVE) |
| total_providers | COUNT(AccreditedProvider WHERE is_active=TRUE) |
| pending_reimbursements | COUNT(ReimbursementRequest WHERE status=IN_ANALYSIS) |
| total_reimbursement_value | SUM(approved_amount WHERE status IN (APPROVED, PAID)) |
| new_users_this_month | COUNT(User WHERE date_joined >= first_of_month) |
| pending_approvals | COUNT(items requiring admin approval) |

### RecentActivity
Last 20 items from AuditLog ordered by timestamp DESC.

---

## Entity Relationships Summary

```
User (1) ────────────── (0..1) AdminProfile
  │
  └────────────────────── (0..1) Beneficiary
                               │
                               └── (0..n) ReimbursementRequest
                                          │
                                          └── (1..n) ReimbursementDocument

AccreditedProvider (n) ─────── (m) Specialty
       │
       └── (0..n) ProviderReview ──── (1) Beneficiary

AdminProfile ──────────────────── (0..n) AuditLog (via User)
       │
       └── (0..n) SystemConfiguration (via last_modified_by)
```

---

## Migration Strategy

1. **Create `apps/admin_api/` Django app**
2. **Add AdminProfile model** - Extends User for admin-specific data
3. **Add AuditLog model** - Immutable audit trail
4. **Add SystemConfiguration model** - Key-value configuration
5. **Create initial SystemConfiguration entries** via data migration
6. **Add signals for automatic audit logging**
