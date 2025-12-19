# Data Model: PostgreSQL Database Configuration

**Feature**: 002-postgres-config
**Date**: 2025-12-15

## Overview

This feature involves database **configuration**, not schema changes. No new entities, tables, or relationships are introduced.

## Existing Entities (Unchanged)

The new database `elosaude_app` on host `192.168.40.25` is expected to contain the same schema as the current database. All existing Django models remain unchanged:

### Core Apps

| App | Key Models | Purpose |
|-----|------------|---------|
| accounts | User, Profile | User authentication |
| beneficiaries | Beneficiary, Dependent | Health plan members |
| providers | Provider, Specialty | Healthcare providers |
| guides | Guide, GuideItem | Medical authorizations (TISS) |
| reimbursements | ReimbursementRequest, Document | Expense claims |
| financial | Invoice, Payment | Financial transactions |
| notifications | Notification, PushToken | User notifications |
| uploads | UploadedFile | File attachments |
| health_records | HealthRecord | Medical records |
| oracle_integration | (connection only) | Legacy system integration |

## Configuration Entity (Logical)

While not a Django model, the database configuration can be conceptualized as:

```
DatabaseConfiguration {
    host: string        # 192.168.40.25
    port: integer       # 5432
    database: string    # elosaude_app
    username: string    # junior_app
    password: string    # (secure, from env var)
    engine: string      # postgresql
}
```

### Storage

- Configuration stored in: `backend/.env`
- Loaded by: `python-decouple` library
- Applied in: `backend/elosaude_backend/settings.py`

## Data Migration Considerations

### Assumed State

The specification assumes the target database (`elosaude_app`) already contains:
- All required tables matching Django models
- Proper user permissions for CRUD operations
- Data compatible with current application version

### If Migration Needed

If the new database is empty, Django migrations must be applied:

```bash
python manage.py migrate
```

This will create all tables based on current model definitions.

## Validation Rules

No new validation rules are introduced. Existing model validations remain active:
- All models use Django's built-in validators
- Custom validators defined in respective apps
- Database constraints enforced by PostgreSQL

## No API Changes

This feature does not introduce or modify any API endpoints. The data model remains identical - only the underlying database server changes.
