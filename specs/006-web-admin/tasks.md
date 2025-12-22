# Tasks: Painel Administrativo Web

**Input**: Design documents from `/specs/006-web-admin/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/admin-api.yaml, research.md, quickstart.md

**Tests**: Not explicitly requested in specification - tests omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/apps/admin_api/` (new Django app)
- **Frontend**: `admin/src/` (new Next.js project)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for both backend and frontend

- [ ] T001 Create Next.js 14 project with TypeScript in admin/ directory
- [ ] T002 [P] Install frontend dependencies (TanStack Query, React Hook Form, Zod, Recharts) in admin/package.json
- [ ] T003 [P] Initialize shadcn/ui and add base components (button, input, card, table, dialog, form) in admin/src/components/ui/
- [ ] T004 [P] Configure Tailwind CSS with custom theme in admin/tailwind.config.ts
- [ ] T005 [P] Create Django admin_api app structure in backend/apps/admin_api/
- [ ] T006 [P] Register admin_api app in backend/elosaude_backend/settings.py
- [ ] T007 [P] Add admin_api URLs to backend/elosaude_backend/urls.py
- [ ] T008 [P] Create environment configuration in admin/.env.local
- [ ] T009 [P] Configure TypeScript strict mode in admin/tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [ ] T010 Create AdminProfile model with roles (ADMIN, SUPER_ADMIN, VIEWER) in backend/apps/admin_api/models.py
- [ ] T011 [P] Create AuditLog model (immutable audit trail) in backend/apps/admin_api/models.py
- [ ] T012 [P] Create SystemConfiguration model (key-value settings) in backend/apps/admin_api/models.py
- [ ] T013 Run migrations for admin_api models via backend/manage.py makemigrations && migrate
- [ ] T014 [P] Create AdminProfile serializer in backend/apps/admin_api/serializers.py
- [ ] T015 [P] Create AuditLog serializer in backend/apps/admin_api/serializers.py
- [ ] T016 [P] Create SystemConfiguration serializer in backend/apps/admin_api/serializers.py
- [ ] T017 Create IsAdminUser permission class in backend/apps/admin_api/permissions.py
- [ ] T018 [P] Create audit logging signal/decorator in backend/apps/admin_api/signals.py
- [ ] T019 Create base admin viewset with audit logging mixin in backend/apps/admin_api/views/__init__.py
- [ ] T020 [P] Create data migration for initial SystemConfiguration entries in backend/apps/admin_api/migrations/

### Frontend Foundation

- [ ] T021 Create API client with axios and interceptors in admin/src/lib/api/client.ts
- [ ] T022 [P] Create TypeScript types from OpenAPI spec in admin/src/types/api.ts
- [ ] T023 Configure TanStack Query provider in admin/src/app/providers.tsx
- [ ] T024 [P] Create NextAuth configuration for Django JWT in admin/src/lib/auth/config.ts
- [ ] T025 Create NextAuth API route in admin/src/app/api/auth/[...nextauth]/route.ts
- [ ] T026 Create root layout with providers in admin/src/app/layout.tsx
- [ ] T027 [P] Create Sidebar component in admin/src/components/layout/sidebar.tsx
- [ ] T028 [P] Create Header component in admin/src/components/layout/header.tsx
- [ ] T029 [P] Create Breadcrumb component in admin/src/components/layout/breadcrumb.tsx
- [ ] T030 Create protected dashboard layout with sidebar in admin/src/app/(dashboard)/layout.tsx
- [ ] T031 [P] Create auth layout for login page in admin/src/app/(auth)/layout.tsx
- [ ] T032 [P] Create loading skeleton components in admin/src/components/ui/skeleton.tsx
- [ ] T033 [P] Create toast notification setup in admin/src/components/ui/toast.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Autenticacao e Acesso Seguro (Priority: P1) 🎯 MVP

**Goal**: Admin pode fazer login seguro e acessar o painel; sessao expira apos 30 minutos de inatividade

**Independent Test**: Criar credenciais de admin, fazer login, verificar redirecionamento para dashboard. Aguardar 30min e verificar que sessao expira.

### Backend for US1

- [ ] T034 [US1] Create auth views (login, refresh, me) in backend/apps/admin_api/views/auth.py
- [ ] T035 [US1] Add login attempt tracking and account lockout logic in backend/apps/admin_api/views/auth.py
- [ ] T036 [US1] Create auth URL routes in backend/apps/admin_api/urls.py

### Frontend for US1

- [ ] T037 [US1] Create login page with form in admin/src/app/(auth)/login/page.tsx
- [ ] T038 [US1] Create login form component with validation in admin/src/components/forms/login-form.tsx
- [ ] T039 [US1] Implement useAuth hook for session management in admin/src/hooks/use-auth.ts
- [ ] T040 [US1] Add auth middleware for route protection in admin/src/middleware.ts
- [ ] T041 [US1] Create session timeout handler (30 min inactivity) in admin/src/lib/auth/session-timeout.ts
- [ ] T042 [US1] Create logout functionality in header component in admin/src/components/layout/header.tsx

**Checkpoint**: User Story 1 complete - Admin can login, logout, and session expires after 30min

---

## Phase 4: User Story 2 - Dashboard Principal com Metricas (Priority: P1) 🎯 MVP

**Goal**: Admin visualiza dashboard com metricas chave (usuarios, reembolsos pendentes, atividade recente)

**Independent Test**: Fazer login e verificar que dashboard exibe metricas consistentes com banco de dados

### Backend for US2

- [ ] T043 [US2] Create dashboard metrics view in backend/apps/admin_api/views/dashboard.py
- [ ] T044 [US2] Create recent activity view (from AuditLog) in backend/apps/admin_api/views/dashboard.py
- [ ] T045 [US2] Add dashboard URL routes in backend/apps/admin_api/urls.py

### Frontend for US2

- [ ] T046 [US2] Create dashboard API hooks in admin/src/lib/api/dashboard.ts
- [ ] T047 [US2] Create MetricCard component in admin/src/components/dashboard/metric-card.tsx
- [ ] T048 [P] [US2] Create RecentActivity component in admin/src/components/dashboard/recent-activity.tsx
- [ ] T049 [P] [US2] Create PeriodFilter component (today, week, month, year) in admin/src/components/dashboard/period-filter.tsx
- [ ] T050 [P] [US2] Create chart components (bar chart, line chart) in admin/src/components/charts/
- [ ] T051 [US2] Create dashboard page with metrics grid in admin/src/app/(dashboard)/page.tsx
- [ ] T052 [US2] Add metric card click navigation to detail pages in admin/src/app/(dashboard)/page.tsx

**Checkpoint**: User Stories 1 & 2 complete - Admin can login and view dashboard with metrics

---

## Phase 5: User Story 3 - Gerenciamento de Usuarios (Priority: P2)

**Goal**: Admin pode listar, criar, editar e desativar usuarios (beneficiarios)

**Independent Test**: Criar um novo usuario, editar seus dados, desativar e verificar que aparece como inativo

### Backend for US3

- [ ] T053 [US3] Create users admin viewset (list, create, update, deactivate) in backend/apps/admin_api/views/users.py
- [ ] T054 [US3] Create BeneficiaryAdmin serializer with validation in backend/apps/admin_api/serializers.py
- [ ] T055 [US3] Add users URL routes in backend/apps/admin_api/urls.py

### Frontend for US3

- [ ] T056 [US3] Create users API hooks in admin/src/lib/api/users.ts
- [ ] T057 [US3] Create DataTable base component with pagination, sorting, filtering in admin/src/components/tables/data-table.tsx
- [ ] T058 [US3] Create users table columns definition in admin/src/app/(dashboard)/users/columns.tsx
- [ ] T059 [US3] Create users list page in admin/src/app/(dashboard)/users/page.tsx
- [ ] T060 [P] [US3] Create user detail page in admin/src/app/(dashboard)/users/[id]/page.tsx
- [ ] T061 [P] [US3] Create user form component (create/edit) in admin/src/components/forms/user-form.tsx
- [ ] T062 [US3] Create new user page in admin/src/app/(dashboard)/users/new/page.tsx
- [ ] T063 [US3] Create edit user page in admin/src/app/(dashboard)/users/[id]/edit/page.tsx
- [ ] T064 [US3] Create deactivate user confirmation dialog in admin/src/components/dialogs/deactivate-user-dialog.tsx

**Checkpoint**: User Story 3 complete - Admin can fully manage users

---

## Phase 6: User Story 4 - Gerenciamento de Prestadores (Priority: P2)

**Goal**: Admin pode listar, editar, aprovar e rejeitar prestadores de servico

**Independent Test**: Aprovar um prestador pendente e verificar que status muda para ativo

### Backend for US4

- [ ] T065 [US4] Create providers admin viewset (list, update, approve, reject) in backend/apps/admin_api/views/providers.py
- [ ] T066 [US4] Create ProviderAdmin serializer in backend/apps/admin_api/serializers.py
- [ ] T067 [US4] Add provider status notification logic (email on approve/reject) in backend/apps/admin_api/views/providers.py
- [ ] T068 [US4] Add providers URL routes in backend/apps/admin_api/urls.py

### Frontend for US4

- [ ] T069 [US4] Create providers API hooks in admin/src/lib/api/providers.ts
- [ ] T070 [US4] Create providers table columns definition in admin/src/app/(dashboard)/providers/columns.tsx
- [ ] T071 [US4] Create providers list page with pending badge in admin/src/app/(dashboard)/providers/page.tsx
- [ ] T072 [P] [US4] Create provider detail page in admin/src/app/(dashboard)/providers/[id]/page.tsx
- [ ] T073 [P] [US4] Create provider form component (edit) in admin/src/components/forms/provider-form.tsx
- [ ] T074 [US4] Create edit provider page in admin/src/app/(dashboard)/providers/[id]/edit/page.tsx
- [ ] T075 [US4] Create approve/reject confirmation dialogs in admin/src/components/dialogs/provider-actions-dialog.tsx

**Checkpoint**: User Story 4 complete - Admin can manage and approve/reject providers

---

## Phase 7: User Story 5 - Gerenciamento de Reembolsos (Priority: P2)

**Goal**: Admin pode listar, visualizar detalhes, aprovar e rejeitar solicitacoes de reembolso

**Independent Test**: Aprovar um reembolso com justificativa e verificar que status atualiza corretamente

### Backend for US5

- [ ] T076 [US5] Create reimbursements admin viewset (list, detail, approve, reject, history) in backend/apps/admin_api/views/reimbursements.py
- [ ] T077 [US5] Create ReimbursementAdmin serializer with documents in backend/apps/admin_api/serializers.py
- [ ] T078 [US5] Add reimbursement status change notification logic in backend/apps/admin_api/views/reimbursements.py
- [ ] T079 [US5] Add reimbursements URL routes in backend/apps/admin_api/urls.py

### Frontend for US5

- [ ] T080 [US5] Create reimbursements API hooks in admin/src/lib/api/reimbursements.ts
- [ ] T081 [US5] Create reimbursements table columns definition in admin/src/app/(dashboard)/reimbursements/columns.tsx
- [ ] T082 [US5] Create reimbursements list page with status filters in admin/src/app/(dashboard)/reimbursements/page.tsx
- [ ] T083 [US5] Create reimbursement detail page with documents in admin/src/app/(dashboard)/reimbursements/[id]/page.tsx
- [ ] T084 [US5] Create approve reimbursement dialog with amount and notes in admin/src/components/dialogs/approve-reimbursement-dialog.tsx
- [ ] T085 [US5] Create reject reimbursement dialog with required reason in admin/src/components/dialogs/reject-reimbursement-dialog.tsx
- [ ] T086 [US5] Create reimbursement history timeline component in admin/src/components/reimbursement/history-timeline.tsx

**Checkpoint**: User Story 5 complete - Admin can manage and approve/reject reimbursements

---

## Phase 8: User Story 6 - Relatorios e Exportacao de Dados (Priority: P3)

**Goal**: Admin pode gerar relatorios e exportar dados em CSV e PDF

**Independent Test**: Gerar relatorio de usuarios e exportar CSV, verificar que arquivo contem dados corretos

### Backend for US6

- [ ] T087 [US6] Create reports view with data aggregation in backend/apps/admin_api/views/reports.py
- [ ] T088 [US6] Create CSV export functionality in backend/apps/admin_api/views/reports.py
- [ ] T089 [US6] Create PDF export functionality (using ReportLab) in backend/apps/admin_api/views/reports.py
- [ ] T090 [US6] Add background job for large exports (Celery task) in backend/apps/admin_api/tasks.py
- [ ] T091 [US6] Add reports URL routes in backend/apps/admin_api/urls.py

### Frontend for US6

- [ ] T092 [US6] Create reports API hooks in admin/src/lib/api/reports.ts
- [ ] T093 [US6] Create report type selector component in admin/src/components/reports/report-type-selector.tsx
- [ ] T094 [P] [US6] Create date range picker component in admin/src/components/reports/date-range-picker.tsx
- [ ] T095 [P] [US6] Create report preview table component in admin/src/components/reports/report-preview.tsx
- [ ] T096 [US6] Create reports page with preview and export in admin/src/app/(dashboard)/reports/page.tsx
- [ ] T097 [US6] Add export buttons (CSV, PDF) with loading state in admin/src/app/(dashboard)/reports/page.tsx

**Checkpoint**: User Story 6 complete - Admin can generate and export reports

---

## Phase 9: User Story 7 - Configuracoes do Sistema (Priority: P3)

**Goal**: Admin pode visualizar e alterar configuracoes do sistema agrupadas por categoria

**Independent Test**: Alterar uma configuracao e verificar que log de auditoria foi criado

### Backend for US7

- [ ] T098 [US7] Create settings admin viewset (list, get, update, history) in backend/apps/admin_api/views/settings.py
- [ ] T099 [US7] Add settings change logging to AuditLog in backend/apps/admin_api/views/settings.py
- [ ] T100 [US7] Add settings URL routes in backend/apps/admin_api/urls.py

### Frontend for US7

- [ ] T101 [US7] Create settings API hooks in admin/src/lib/api/settings.ts
- [ ] T102 [US7] Create settings category tabs component in admin/src/components/settings/category-tabs.tsx
- [ ] T103 [P] [US7] Create settings form for each category in admin/src/components/settings/settings-form.tsx
- [ ] T104 [P] [US7] Create settings change history component in admin/src/components/settings/change-history.tsx
- [ ] T105 [US7] Create settings page with categories in admin/src/app/(dashboard)/settings/page.tsx
- [ ] T106 [US7] Add audit log viewer page in admin/src/app/(dashboard)/settings/audit-logs/page.tsx

**Checkpoint**: User Story 7 complete - Admin can manage system settings

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T107 [P] Add error boundary component for graceful error handling in admin/src/components/error-boundary.tsx
- [ ] T108 [P] Add loading states for all pages in admin/src/app/(dashboard)/loading.tsx
- [ ] T109 [P] Add 404 page in admin/src/app/not-found.tsx
- [ ] T110 [P] Implement optimistic updates for CRUD operations in admin/src/lib/api/
- [ ] T111 Add keyboard shortcuts for common actions in admin/src/hooks/use-keyboard-shortcuts.ts
- [ ] T112 [P] Add responsive design adjustments for sidebar in admin/src/components/layout/sidebar.tsx
- [ ] T113 [P] Update backend CORS settings for admin frontend in backend/elosaude_backend/settings.py
- [ ] T114 [P] Create admin README with setup instructions in admin/README.md
- [ ] T115 Run quickstart.md validation and fix any issues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (Auth) must complete before US2-US7 (all require authentication)
  - US2-US7 can proceed in parallel after US1
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Setup (Phase 1)
     │
     ▼
Foundational (Phase 2)
     │
     ▼
US1: Auth (Phase 3) ──────────────────────────────────┐
     │                                                 │
     ├──> US2: Dashboard (Phase 4) 🎯 MVP             │
     │                                                 │
     ├──> US3: Users (Phase 5) ─────────┐             │
     │                                   │ Can run    │
     ├──> US4: Providers (Phase 6) ─────┤ in         │
     │                                   │ parallel   │
     ├──> US5: Reimbursements (Phase 7)─┘             │
     │                                                 │
     ├──> US6: Reports (Phase 8) ────────┐            │
     │                                    │ Can run   │
     └──> US7: Settings (Phase 9) ───────┘ in        │
                                           parallel   │
                                                      │
     ┌────────────────────────────────────────────────┘
     ▼
Polish (Phase 10)
```

### Within Each User Story

- Backend endpoints before frontend pages
- API hooks before components
- List pages before detail pages
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase**:
```
T001 (create project) → T002, T003, T004, T005, T006, T007, T008, T009 [all parallel]
```

**Foundational Phase**:
```
Backend models (T010, T011, T012) → T013 (migrations) → T014-T020 [parallel groups]
Frontend (T021-T033) [mostly parallel after T021, T023, T024]
```

**User Stories** (after US1 Auth):
```
US3, US4, US5 can run in parallel (different entities)
US6, US7 can run in parallel (different features)
```

---

## Parallel Example: Phase 2 Foundational

```bash
# Backend models in parallel:
Task: "Create AdminProfile model in backend/apps/admin_api/models.py"
Task: "Create AuditLog model in backend/apps/admin_api/models.py"
Task: "Create SystemConfiguration model in backend/apps/admin_api/models.py"

# After migrations, serializers in parallel:
Task: "Create AdminProfile serializer in backend/apps/admin_api/serializers.py"
Task: "Create AuditLog serializer in backend/apps/admin_api/serializers.py"
Task: "Create SystemConfiguration serializer in backend/apps/admin_api/serializers.py"

# Frontend layout components in parallel:
Task: "Create Sidebar component in admin/src/components/layout/sidebar.tsx"
Task: "Create Header component in admin/src/components/layout/header.tsx"
Task: "Create Breadcrumb component in admin/src/components/layout/breadcrumb.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Auth)
4. Complete Phase 4: User Story 2 (Dashboard)
5. **STOP and VALIDATE**: Test login and dashboard independently
6. Deploy/demo if ready - Admin can login and see metrics

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 → Test independently → Deploy/Demo (MVP!)
3. Add US3 (Users) → Test independently → Deploy/Demo
4. Add US4 (Providers) → Test independently → Deploy/Demo
5. Add US5 (Reimbursements) → Test independently → Deploy/Demo
6. Add US6 (Reports) → Test independently → Deploy/Demo
7. Add US7 (Settings) → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Phase 2:

- Developer A: US1 (Auth) then US3 (Users)
- Developer B: US2 (Dashboard) then US4 (Providers)
- Developer C: US5 (Reimbursements) after US1 complete
- Developer D: US6 (Reports) + US7 (Settings) after US1 complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend and frontend tasks within same story can be parallelized if different developers
