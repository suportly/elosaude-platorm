# Tasks: Email Token & Onboarding

**Input**: Design documents from `/specs/013-email-token-onboarding/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested - implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Environment Configuration)

**Purpose**: Configure email infrastructure and prepare environment

- [X] T001 Configure Gmail SMTP credentials in backend/.env (EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, DEFAULT_FROM_EMAIL)
- [ ] T002 [P] Verify SMTP connectivity by sending test email from Django shell
- [X] T003 [P] Create directory structure for OnboardingScreen in mobile/src/screens/Onboarding/

---

## Phase 2: Foundational (Shared Models & Infrastructure)

**Purpose**: Core models that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add VerificationToken model to backend/apps/accounts/models.py (6-digit token, expiry, is_used, resend tracking)
- [X] T005 Create and run migration for VerificationToken model in backend/apps/accounts/migrations/
- [X] T006 [P] Add onboarding_completed and onboarding_completed_at fields to Beneficiary model in backend/apps/beneficiaries/models.py
- [X] T007 [P] Add complete_onboarding() method to Beneficiary model in backend/apps/beneficiaries/models.py
- [X] T008 Create and run migration for Beneficiary onboarding fields in backend/apps/beneficiaries/migrations/
- [X] T009 Update BeneficiarySerializer to include onboarding_completed field in backend/apps/accounts/serializers.py
- [X] T010 [P] Add onboarding_completed to Beneficiary interface in mobile/src/store/slices/authSlice.ts
- [X] T011 [P] Add setOnboardingCompleted action to authSlice in mobile/src/store/slices/authSlice.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Recebimento de Token por Email (Priority: P1) 🎯 MVP

**Goal**: Beneficiário recebe email com token de 6 dígitos ao solicitar primeiro acesso

**Independent Test**: Solicitar primeiro acesso com CPF válido e verificar se email é recebido com token correto e visual adequado

### Backend Implementation for US1

- [X] T012 [US1] Create verification email template in backend/apps/accounts/templates/accounts/email/verification_email.html (logo, token, 10min expiry notice)
- [X] T013 [US1] Add send_verification_token() method to EmailService in backend/apps/accounts/utils/email_service.py
- [X] T014 [US1] Update first-access/request/ endpoint to generate 6-digit VerificationToken in backend/apps/accounts/views.py
- [X] T015 [US1] Update first-access/request/ endpoint to send verification email with token in backend/apps/accounts/views.py
- [X] T016 [US1] Update first-access/verify/ endpoint to validate 6-digit token in backend/apps/accounts/views.py
- [X] T017 [US1] Update first-access/activate/ endpoint to mark token as used after successful activation in backend/apps/accounts/views.py
- [X] T018 [US1] Add token expiration check (10 minutes) to verify endpoint in backend/apps/accounts/views.py

### Mobile Implementation for US1

- [X] T019 [US1] Update FirstAccessScreen to use 6-digit numeric token input in mobile/src/screens/Auth/FirstAccessScreen.tsx
- [X] T020 [US1] Add token input mask/validation for 6 digits in mobile/src/screens/Auth/FirstAccessScreen.tsx
- [X] T021 [US1] Update token verification API call to match new 6-digit format in mobile/src/screens/Auth/FirstAccessScreen.tsx
- [X] T022 [US1] Add expired token error handling and display in mobile/src/screens/Auth/FirstAccessScreen.tsx

**Checkpoint**: User Story 1 complete - beneficiário pode receber e usar token por email

---

## Phase 4: User Story 2 - Onboarding de Atualização de Dados (Priority: P2)

**Goal**: Após primeiro login, exibir tela de onboarding para atualizar telefone/email (apenas uma vez)

**Independent Test**: Fazer login com usuário que nunca acessou e verificar se tela de onboarding aparece apenas na primeira vez

### Backend Implementation for US2

- [X] T023 [US2] Add complete-onboarding endpoint to BeneficiaryViewSet in backend/apps/beneficiaries/views.py
- [X] T024 [US2] Implement profile update logic (phone, email) in complete-onboarding endpoint in backend/apps/beneficiaries/views.py
- [X] T025 [US2] Implement skip logic in complete-onboarding endpoint in backend/apps/beneficiaries/views.py
- [X] T026 [US2] Add URL route for complete-onboarding in backend/apps/beneficiaries/urls.py

### Mobile Implementation for US2

- [X] T027 [US2] Create OnboardingScreen component in mobile/src/screens/Onboarding/OnboardingScreen.tsx
- [X] T028 [US2] Implement read-only display of name, CPF, birth_date in OnboardingScreen in mobile/src/screens/Onboarding/OnboardingScreen.tsx
- [X] T029 [US2] Implement editable phone and email fields in OnboardingScreen in mobile/src/screens/Onboarding/OnboardingScreen.tsx
- [X] T030 [US2] Implement "Salvar e Continuar" button with API call in mobile/src/screens/Onboarding/OnboardingScreen.tsx
- [X] T031 [US2] Implement "Fazer depois" (skip) button in mobile/src/screens/Onboarding/OnboardingScreen.tsx
- [X] T032 [US2] Add onboarding route check to AppNavigator in mobile/src/navigation/AppNavigator.tsx
- [X] T033 [US2] Navigate to MainNavigator after onboarding completion in mobile/src/navigation/AppNavigator.tsx
- [X] T034 [US2] Export OnboardingScreen in mobile/src/screens/Onboarding/index.ts

**Checkpoint**: User Story 2 complete - usuário vê onboarding apenas no primeiro login

---

## Phase 5: User Story 3 - Reenvio de Token (Priority: P3)

**Goal**: Permitir reenvio de token com rate limiting (60s cooldown, máximo 5 por hora)

**Independent Test**: Solicitar reenvio de token e verificar se novo email é recebido; testar rate limiting

### Backend Implementation for US3

- [X] T035 [US3] Add resend endpoint to first-access flow in backend/apps/accounts/views.py
- [X] T036 [US3] Implement 60-second cooldown check in resend endpoint in backend/apps/accounts/views.py
- [X] T037 [US3] Implement max 5 resends per hour check in resend endpoint in backend/apps/accounts/views.py
- [X] T038 [US3] Return wait_seconds in rate limit error response in backend/apps/accounts/views.py
- [X] T039 [US3] Add URL route for first-access/resend/ in backend/apps/accounts/urls.py

### Mobile Implementation for US3

- [X] T040 [US3] Add "Reenviar código" button to FirstAccessScreen in mobile/src/screens/Auth/FirstAccessScreen.tsx
- [X] T041 [US3] Implement countdown timer after resend in mobile/src/screens/Auth/FirstAccessScreen.tsx
- [X] T042 [US3] Handle rate limit error and display wait time in mobile/src/screens/Auth/FirstAccessScreen.tsx
- [X] T043 [US3] Display resend count and max resends info in mobile/src/screens/Auth/FirstAccessScreen.tsx

**Checkpoint**: User Story 3 complete - usuário pode reenviar token com controle de frequência

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T044 [P] Add email sending logs (success/failure) in backend/apps/accounts/utils/email_service.py
- [ ] T045 [P] Add error handling for SMTP failures in send_verification_token() in backend/apps/accounts/utils/email_service.py
- [ ] T046 Set existing users' onboarding_completed=True via data migration in backend/apps/beneficiaries/migrations/
- [ ] T047 [P] Add accessibility labels to OnboardingScreen in mobile/src/screens/Onboarding/OnboardingScreen.tsx
- [ ] T048 [P] Add accessibility labels to token input in FirstAccessScreen in mobile/src/screens/Auth/FirstAccessScreen.tsx
- [ ] T049 Verify credentials not exposed in logs or error messages
- [ ] T050 Run end-to-end test: new user registration → email → token → activation → login → onboarding

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P3)
  - Or in parallel with different developers
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Shares FirstAccessScreen with US1 but independent logic

### Within Each User Story

- Backend before mobile (API must exist before mobile can call it)
- Models before views
- Views before URL routes
- Story complete before moving to next priority

### Parallel Opportunities

**Setup (Phase 1)**:
- T002 and T003 can run in parallel

**Foundational (Phase 2)**:
- T006 + T007 can run in parallel (same file but different sections)
- T010 + T011 can run in parallel (different parts of authSlice)

**User Story 1**:
- Backend tasks (T012-T018) must complete before mobile tasks (T019-T022)
- T012 and T013 can run in parallel (different files)

**User Story 2**:
- Backend tasks (T023-T026) must complete before mobile tasks (T027-T034)
- T027-T031 are all in same file - sequential
- T032-T033 in different file, can start after API is ready

**User Story 3**:
- Backend tasks (T035-T039) must complete before mobile tasks (T040-T043)

---

## Parallel Example: Foundational Phase

```bash
# Launch parallel model updates:
Task: "Add onboarding_completed field to Beneficiary model in backend/apps/beneficiaries/models.py"
Task: "Add onboarding_completed to Beneficiary interface in mobile/src/store/slices/authSlice.ts"

# After both complete:
Task: "Create migration for Beneficiary onboarding fields"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (SMTP configuration)
2. Complete Phase 2: Foundational (models and migrations)
3. Complete Phase 3: User Story 1 (email token flow)
4. **STOP and VALIDATE**: Test email sending and token verification
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test email/token → Deploy (MVP!)
3. Add User Story 2 → Test onboarding → Deploy
4. Add User Story 3 → Test resend → Deploy
5. Each story adds value without breaking previous stories

### Recommended Order

For single developer:
1. Phase 1 → Phase 2 → Phase 3 (MVP)
2. Then Phase 4 → Phase 5 → Phase 6

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Setup | 3 | Environment and SMTP configuration |
| Foundational | 8 | Core models and migrations |
| US1 (P1) | 11 | Email token sending and verification |
| US2 (P2) | 12 | Post-login onboarding screen |
| US3 (P3) | 9 | Token resend with rate limiting |
| Polish | 7 | Logging, accessibility, final tests |
| **Total** | **50** | |

### Tasks per User Story

- **US1**: 11 tasks (MVP - core functionality)
- **US2**: 12 tasks (onboarding experience)
- **US3**: 9 tasks (resend feature)

### MVP Scope

**Minimum viable: Phase 1 + Phase 2 + Phase 3 (22 tasks)**

User can register and receive token via email to complete first access.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify SMTP works before starting US1 implementation
- Run migrations after model changes
- Test on real device for email notifications
