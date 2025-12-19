# Tasks: Configurar Conexão PostgreSQL

**Input**: Design documents from `/specs/002-postgres-config/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No tests explicitly requested - configuration-only change.

**Organization**: Tasks grouped by user story to enable independent verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` directory
- **Configuration**: `backend/.env`
- **Settings**: `backend/elosaude_backend/settings.py` (no changes needed)

---

## Phase 1: Setup (Pre-Implementation Checks)

**Purpose**: Verify prerequisites before making configuration changes

- [x] T001 Backup current database configuration in backend/.env (copy relevant lines)
- [x] T002 [P] Test network connectivity to 192.168.40.25:5432 using ping/telnet
- [x] T003 [P] Verify database server is running and accessible

**Checkpoint**: Prerequisites verified - configuration can proceed

---

## Phase 2: User Story 1 - Configurar Conexão (Priority: P1) 🎯 MVP

**Goal**: Configure application to connect to PostgreSQL database at 192.168.40.25

**Independent Test**: `python manage.py check` passes and `python manage.py dbshell` connects successfully

### Implementation for User Story 1

- [x] T004 [US1] Update DB_HOST=192.168.40.25 in backend/.env
- [x] T005 [US1] Update DB_NAME=elosaude_app in backend/.env
- [x] T006 [US1] Update DB_USER=junior_app in backend/.env
- [x] T007 [US1] Update DB_PASSWORD=junior_app_2025 in backend/.env

**Checkpoint**: Database connection parameters configured in .env file

---

## Phase 3: User Story 2 - Validação de Conectividade (Priority: P1)

**Goal**: Verify the application can successfully connect to the new database

**Independent Test**: Django management commands execute without connection errors

### Implementation for User Story 2

- [x] T008 [US2] Run `python manage.py check` to validate Django configuration
- [x] T009 [US2] Run `python manage.py dbshell` to test database connection
- [x] T010 [US2] Run `python manage.py migrate --check` to verify schema compatibility
- [x] T011 [US2] Start development server and verify API responds (python manage.py runserver)

**Checkpoint**: Application successfully connects to new database

---

## Phase 4: User Story 3 - Segurança das Credenciais (Priority: P2)

**Goal**: Ensure credentials are stored securely and not exposed

**Independent Test**: Credentials not visible in git history or server logs

### Implementation for User Story 3

- [x] T012 [US3] Verify backend/.env is in .gitignore
- [x] T013 [US3] Check that no credentials are logged during application startup
- [x] T014 [US3] Verify backend/.env.example does NOT contain real credentials

**Checkpoint**: Credentials are securely managed

---

## Phase 5: Polish & Final Verification

**Purpose**: Complete validation and documentation

- [x] T015 Test API endpoints to verify data operations work correctly
- [x] T016 Document rollback procedure if issues are discovered later
- [x] T017 Mark feature as complete and update spec status

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - network checks first
- **User Story 1 (Phase 2)**: Depends on Setup - cannot configure without network access
- **User Story 2 (Phase 3)**: Depends on US1 - cannot validate until configured
- **User Story 3 (Phase 4)**: Can run in parallel with US2 - independent security checks
- **Polish (Phase 5)**: Depends on US1 and US2 completion

### User Story Dependencies

```
T001-T003 (Setup)
    ↓
T004-T007 (US1: Configuration) ← MVP
    ↓
T008-T011 (US2: Validation)
    ↓
T015-T017 (Polish)

T012-T014 (US3: Security) ← Can run after US1, parallel to US2
```

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel
- **Phase 2**: T004-T007 must be sequential (same file)
- **Phase 4**: T012-T014 can run in parallel with Phase 3

---

## Parallel Example: Setup Phase

```bash
# Launch network checks together:
Task: "Test network connectivity to 192.168.40.25:5432"
Task: "Verify database server is running and accessible"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup (network verification)
2. Complete Phase 2: User Story 1 (update .env)
3. Complete Phase 3: User Story 2 (validate connection)
4. **STOP and VALIDATE**: Application works with new database
5. Feature is functional at this point

### Complete Delivery

1. Complete MVP (Phases 1-3)
2. Complete Phase 4: User Story 3 (security verification)
3. Complete Phase 5: Polish (final validation)
4. Mark feature as complete

---

## Rollback Plan

If issues occur after configuration, revert `backend/.env` to:

```bash
DB_NAME=elosaude_db
DB_HOST=localhost
DB_USER=n8n
DB_PASSWORD=xjoA531Gs24zKUwXRMdc
```

---

## Notes

- This is a **configuration-only** change - no code modifications required
- Django settings already support environment variables via python-decouple
- Total estimated time: ~15-30 minutes
- Low risk: Easy rollback if issues occur
- Commit after Phase 2 completion to preserve working configuration
