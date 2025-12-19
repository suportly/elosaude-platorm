# Implementation Plan: Configurar Conexão PostgreSQL

**Branch**: `002-postgres-config` | **Date**: 2025-12-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-postgres-config/spec.md`

## Summary

Configure the Elosaúde backend application to connect to a new PostgreSQL database server at `192.168.40.25` with database `elosaude_app` and user `junior_app`. This is a configuration-only change - no code modifications are required as the existing Django settings infrastructure already supports environment-based database configuration.

## Technical Context

**Language/Version**: Python 3.11 (Backend)
**Primary Dependencies**: Django 4.2+, python-decouple, psycopg2-binary
**Storage**: PostgreSQL 14+ at 192.168.40.25
**Testing**: pytest, Django test client
**Target Platform**: Linux server / Docker container
**Project Type**: Web application (Backend API)
**Performance Goals**: Connection establishment < 5s, query response < 100ms
**Constraints**: Network access to 192.168.40.25:5432 required
**Scale/Scope**: Single configuration file change

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. LGPD & Privacy First | ✅ PASS | Database stores PHI - connection uses authenticated access |
| II. API-First Design | ✅ N/A | No API changes in this feature |
| III. Healthcare Standards | ✅ N/A | No healthcare workflow changes |
| IV. Security by Design | ✅ PASS | Credentials in .env (not committed), connection validated |
| V. Mobile-Accessible UX | ✅ N/A | Backend-only change |

**Gate Result**: PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/002-postgres-config/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output - configuration research
├── data-model.md        # Phase 1 output - entity documentation
├── quickstart.md        # Phase 1 output - implementation guide
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code (repository root)

```text
backend/
├── .env                 # Configuration file (TO BE UPDATED)
├── .env.example         # Template with safe defaults
└── elosaude_backend/
    └── settings.py      # Django settings (no changes needed)
```

**Structure Decision**: No new directories or files required. Only `backend/.env` will be modified with new database connection parameters.

## Implementation Approach

### Phase 1: Configuration Update

The implementation is straightforward:

1. **Update `.env` file** with new database connection parameters:
   - `DB_HOST=192.168.40.25`
   - `DB_NAME=elosaude_app`
   - `DB_USER=junior_app`
   - `DB_PASSWORD=junior_app_2025..`

2. **Verify connection** using Django management commands

3. **Test application** to ensure all functionality works

### Why No Code Changes?

The existing `settings.py` already uses `python-decouple` to load database configuration:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='elosaude_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    },
}
```

This design follows 12-factor app principles and allows configuration changes without code modifications.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Network connectivity issues | Medium | High | Test connectivity before applying |
| Wrong credentials | Low | Medium | Verify credentials with DBA |
| Schema mismatch | Low | High | Verify database has all tables |
| Data loss | N/A | N/A | No data deletion - just connection change |

## Rollback Plan

If issues occur, revert `backend/.env` to previous values:

```bash
DB_NAME=elosaude_db
DB_HOST=localhost
DB_USER=n8n
DB_PASSWORD=xjoA531Gs24zKUwXRMdc
```

## Artifacts Generated

| Artifact | Purpose |
|----------|---------|
| [research.md](./research.md) | Configuration research and decisions |
| [data-model.md](./data-model.md) | Entity documentation (unchanged) |
| [quickstart.md](./quickstart.md) | Step-by-step implementation guide |

## Next Steps

Run `/speckit.tasks` to generate the task list for implementation.
