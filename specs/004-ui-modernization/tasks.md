# Tasks: UI Modernization

**Feature**: 004-ui-modernization
**Generated**: 2025-12-16
**Source**: [plan.md](./plan.md) | [spec.md](./spec.md)

## Task Overview

| Phase | Description | Tasks | Priority |
|-------|-------------|-------|----------|
| 1. Setup | Theme infrastructure | 4 | P1 |
| 2. Foundational | Dark mode + ThemeContext | 3 | P1 |
| 3. US1 | Design System Consistency | 8 | P1 |
| 4. US2 | Accessibility | 5 | P1 |
| 5. US3 | Navigation | 4 | P2 |
| 6. US4 | Feedback & Microinteractions | 5 | P2 |
| 7. US5 | Cards & Lists | 4 | P3 |
| 8. Polish | Verification & docs | 4 | P1 |

**Total Tasks**: 37

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US5)

---

## Phase 1: Setup (Theme Infrastructure)

**Purpose**: Prepare design system infrastructure for modernization

- [x] T001 Audit current theme.ts and document token usage in mobile/src/config/theme.ts
- [x] T002 [P] Create DarkColors constant with dark mode palette in mobile/src/config/theme.ts
- [x] T003 [P] Add exports for all dark mode colors in mobile/src/config/theme.ts
- [x] T004 Create ThemeContext.tsx with useTheme hook in mobile/src/config/ThemeContext.tsx

**Checkpoint**: Dark mode infrastructure ready

---

## Phase 2: Foundational (ThemeProvider Integration)

**Purpose**: Core infrastructure that MUST be complete before screen updates

**⚠️ CRITICAL**: No screen updates can begin until this phase is complete

- [x] T005 Wrap App.tsx with ThemeProvider in mobile/App.tsx
- [x] T006 Export useTheme from config index in mobile/src/config/index.ts
- [x] T007 Create shared useThemeStyles hook in mobile/src/hooks/useThemeStyles.ts

**Checkpoint**: Foundation ready - screen updates can now begin in parallel

---

## Phase 3: User Story 1 - Sistema de Design Consistente (Priority: P1) 🎯 MVP

**Goal**: Ensure consistent visual language across all screens using design tokens

**Independent Test**: Navigate between any 5 screens - colors, typography, spacing should be identical

### Implementation for User Story 1

- [x] T008 [P] [US1] Update LoginScreen to use theme tokens in mobile/src/screens/Auth/LoginScreen.tsx
- [x] T009 [P] [US1] Update FirstAccessScreen to use theme tokens in mobile/src/screens/Auth/FirstAccessScreen.tsx
- [x] T010 [P] [US1] Update ForgotPasswordScreen to use theme tokens in mobile/src/screens/Auth/ForgotPasswordScreen.tsx
- [x] T011 [P] [US1] Update ResetPasswordScreen to use theme tokens in mobile/src/screens/Auth/ResetPasswordScreen.tsx
- [x] T012 [P] [US1] Update HomeScreen to use theme tokens in mobile/src/screens/Home/HomeScreen.tsx
- [x] T013 [P] [US1] Update DigitalCardScreen to use theme tokens in mobile/src/screens/DigitalCard/DigitalCardScreen.tsx
- [x] T014 [US1] Update reusable Button component using theme in mobile/src/components/ui/Button.tsx
- [x] T015 [US1] Update reusable Input component using theme in mobile/src/components/ui/Input.tsx

**Checkpoint**: Core screens (Auth, Home, Card) use consistent design tokens

---

## Phase 4: User Story 2 - Acessibilidade para Público de Saúde (Priority: P1)

**Goal**: Ensure accessibility for 35-65 age demographic (minimum 16pt text, 44x44 touch, WCAG AA contrast)

**Independent Test**: Complete login, view card, and request reimbursement with 150% system font

### Implementation for User Story 2

- [x] T016 [US2] Audit and fix touch targets (min 48x48) in all Auth screens
- [x] T017 [US2] Audit and fix font sizes (min 16pt body) in all screens
- [x] T018 [P] [US2] Add accessibilityLabel and accessibilityHint to all interactive elements in Auth screens
- [x] T019 [P] [US2] Add accessibilityLabel and accessibilityHint to all interactive elements in Home/Card screens
- [x] T020 [US2] Test and fix layouts with 150% system font scaling

**Checkpoint**: Core flows accessible to target demographic

---

## Phase 5: User Story 3 - Navegação Modernizada (Priority: P2)

**Goal**: Intuitive navigation with max 2 taps to main functions

**Independent Test**: Measure taps to reach: Card, Guides, Reimbursements, Network, Profile

### Implementation for User Story 3

- [x] T021 [US3] Review and optimize bottom navigation structure in mobile/src/navigation/
- [x] T022 [P] [US3] Update MoreScreen with clear section organization in mobile/src/screens/More/MoreScreen.tsx
- [x] T023 [P] [US3] Add quick actions to HomeScreen for frequent functions in mobile/src/screens/Home/HomeScreen.tsx
- [x] T024 [US3] Ensure consistent back navigation across all screens

**Checkpoint**: Navigation optimized for frequent functions

---

## Phase 6: User Story 4 - Feedback Visual e Microinterações (Priority: P2)

**Goal**: Clear visual feedback for all user actions (loading, success, error states)

**Independent Test**: Submit form, load list, trigger error - verify visual feedback

### Implementation for User Story 4

- [x] T025 [P] [US4] Create LoadingSpinner component in mobile/src/components/ui/LoadingState.tsx
- [x] T026 [P] [US4] Create SuccessToast component in mobile/src/components/ui/Toast.tsx
- [x] T027 [P] [US4] Create ErrorToast component in mobile/src/components/ui/Toast.tsx
- [x] T028 [US4] Add loading states to all API calls in screens
- [x] T029 [US4] Add press feedback (scale animation) to all buttons

**Checkpoint**: All actions have appropriate visual feedback

---

## Phase 7: User Story 5 - Cards e Listas Modernos (Priority: P3)

**Goal**: Modern, scannable card and list presentation with clear hierarchy

**Independent Test**: View provider list, guide list, reimbursement list - information hierarchy should be clear

### Implementation for User Story 5

- [x] T030 [P] [US5] Create modern Card component in mobile/src/components/ui/Card.tsx
- [x] T031 [P] [US5] Create ListItem component with hierarchy in mobile/src/components/ui/ListItem.tsx
- [x] T032 [US5] Update GuidesScreen to use new Card/ListItem in mobile/src/screens/Guides/GuidesScreen.tsx
- [x] T033 [US5] Update NetworkScreen to use new Card/ListItem in mobile/src/screens/Network/NetworkScreen.tsx

**Checkpoint**: Lists and cards follow modern visual patterns

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation

- [x] T034 Run accessibility audit on all screens (contrast, touch targets, font sizes)
- [x] T035 Test dark mode toggle across all updated screens
- [x] T036 Test on multiple device sizes (iPhone SE, iPhone 15, iPad)
- [x] T037 Update requirements checklist in specs/004-ui-modernization/checklists/requirements.md

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ─── BLOCKS ALL ───┐
    │                                     │
    ▼                                     ▼
┌─────────────┐                    ┌─────────────┐
│ Phase 3     │                    │ Phase 4     │
│ US1 (P1)    │                    │ US2 (P1)    │
│ Design      │                    │ Accessibility│
└─────┬───────┘                    └─────┬───────┘
      │                                   │
      └───────────────┬───────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    ┌──────────┐            ┌──────────┐
    │ Phase 5  │            │ Phase 6  │
    │ US3 (P2) │            │ US4 (P2) │
    │ Nav      │            │ Feedback │
    └────┬─────┘            └────┬─────┘
         │                       │
         └───────────┬───────────┘
                     ▼
               ┌──────────┐
               │ Phase 7  │
               │ US5 (P3) │
               │ Cards    │
               └────┬─────┘
                    │
                    ▼
               ┌──────────┐
               │ Phase 8  │
               │ Polish   │
               └──────────┘
```

### Parallel Opportunities

**Phase 1 - Setup**:
- T002 and T003 can run in parallel

**Phase 3 - US1 (Design Consistency)**:
- T008-T013 can ALL run in parallel (different screen files)

**Phase 4 - US2 (Accessibility)**:
- T018 and T019 can run in parallel

**Phase 5 - US3 (Navigation)**:
- T022 and T023 can run in parallel

**Phase 6 - US4 (Feedback)**:
- T025, T026, T027 can ALL run in parallel (different component files)

**Phase 7 - US5 (Cards/Lists)**:
- T030 and T031 can run in parallel

---

## Parallel Example: User Story 1 Screens

```bash
# Launch all screen updates for User Story 1 together:
Task: "Update LoginScreen to use theme tokens in mobile/src/screens/Auth/LoginScreen.tsx"
Task: "Update FirstAccessScreen to use theme tokens in mobile/src/screens/Auth/FirstAccessScreen.tsx"
Task: "Update ForgotPasswordScreen to use theme tokens in mobile/src/screens/Auth/ForgotPasswordScreen.tsx"
Task: "Update ResetPasswordScreen to use theme tokens in mobile/src/screens/Auth/ResetPasswordScreen.tsx"
Task: "Update HomeScreen to use theme tokens in mobile/src/screens/Home/HomeScreen.tsx"
Task: "Update DigitalCardScreen to use theme tokens in mobile/src/screens/DigitalCard/DigitalCardScreen.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (4 tasks)
2. Complete Phase 2: Foundational (3 tasks) ← CRITICAL
3. Complete Phase 3: User Story 1 (8 tasks)
4. **STOP and VALIDATE**: Test design consistency across Auth/Home/Card
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Theme infrastructure ready
2. Add US1 → Design consistency (MVP!)
3. Add US2 → Accessibility verified
4. Add US3 + US4 → Navigation + Feedback
5. Add US5 → Cards/Lists modernized
6. Polish → Final verification

### Screen Update Pattern

For each screen update task:

1. Import `{ useTheme }` from config
2. Replace hardcoded colors with `colors.*`
3. Replace hardcoded font sizes with `Typography.sizes.*`
4. Replace hardcoded spacing with `Spacing.*`
5. Verify touch targets are 48x48 minimum
6. Test with light and dark mode

---

## Notes

- [P] tasks = different files, no dependencies
- [US#] label maps task to specific user story
- Existing theme.ts already has comprehensive tokens - focus is applying consistently
- Dark mode is FR-011 requirement but can be partial for MVP
- Constitution V requires 48x48 touch targets - verify all interactive elements
