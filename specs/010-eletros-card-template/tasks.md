# Tasks: Template Carteirinha Digital Eletros-Saude

**Input**: Design documents from `/specs/010-eletros-card-template/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested - no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile**: `mobile/src/` structure
- Components: `mobile/src/components/cards/`
- Templates: `mobile/src/screens/DigitalCard/components/`
- Types: `mobile/src/types/`
- Utils: `mobile/src/utils/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and TypeScript types/constants

- [x] T001 Create Eletros-Saude types and interfaces in mobile/src/types/eletros.ts
- [x] T002 [P] Define ELETROS_COLORS constant in mobile/src/types/eletros.ts
- [x] T003 [P] Define ELETROS_STATIC_INFO constant in mobile/src/types/eletros.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core components that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create ELETROSLogo SVG component with white/colored variants in mobile/src/components/cards/ELETROSLogo.tsx
- [x] T005 [P] Create ELETROSCurvedBackground SVG component for header curve in mobile/src/components/cards/ELETROSCurvedBackground.tsx
- [x] T006 Add isELETROSEligible function in mobile/src/utils/cardUtils.ts
- [x] T007 Add extractELETROSCardData function in mobile/src/utils/cardUtils.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Visualizacao da Carteirinha (Frente) (Priority: P1) 🎯 MVP

**Goal**: Beneficiario visualiza o lado frontal da carteirinha Eletros-Saude com header curvo azul, logo branco, tag ANS, matricula, nome, grid 3 colunas e texto legal.

**Independent Test**: Navegar ate a tela de carteirinha digital com um beneficiario elegivel Eletros-Saude e verificar exibicao do card frontal com header curvo azul, logo, tag ANS, dados de identificacao e grid de informacoes.

### Implementation for User Story 1

- [x] T008 [P] [US1] Create ELETROSHeader component (front variant) with logo and ANS tag in mobile/src/components/cards/ELETROSHeader.tsx
- [x] T009 [US1] Create ELETROSBodyFront component with identification fields and 3-column grid in mobile/src/components/cards/ELETROSBodyFront.tsx
- [x] T010 [US1] Add red border highlight styles for matricula and nome fields in ELETROSBodyFront.tsx
- [x] T011 [US1] Add italic legal text at bottom of ELETROSBodyFront.tsx

**Checkpoint**: User Story 1 front card view is complete and visually testable

---

## Phase 4: User Story 2 - Visualizacao da Carteirinha (Verso) (Priority: P1)

**Goal**: Beneficiario visualiza o verso da carteirinha com logo colorido, linha divisoria verde, lista de dados tecnicos e bloco de contatos.

**Independent Test**: Virar a carteirinha Eletros-Saude e verificar exibicao do verso com logo colorido, linha divisoria verde, lista de dados do plano e bloco de contatos.

### Implementation for User Story 2

- [x] T012 [P] [US2] Add back variant to ELETROSHeader component (colored logo, white background) in mobile/src/components/cards/ELETROSHeader.tsx
- [x] T013 [US2] Create ELETROSBodyBack component with technical data list in mobile/src/components/cards/ELETROSBodyBack.tsx
- [x] T014 [US2] Add green divider line between header and body in ELETROSBodyBack.tsx
- [x] T015 [US2] Add UTI Movel and CPT fields in single row in ELETROSBodyBack.tsx
- [x] T016 [US2] Add contact block (Eletros-Saude, Plantao Emergencial, Disque ANS) in ELETROSBodyBack.tsx
- [x] T017 [US2] Add intransferabilidade note in ELETROSBodyBack.tsx

**Checkpoint**: User Story 2 back card view is complete and visually testable

---

## Phase 5: User Story 4 - Interacao de Flip Card (Priority: P2)

**Goal**: Beneficiario alterna entre frente e verso da carteirinha com animacao 3D fluida.

**Independent Test**: Tocar no botao de flip e verificar animacao suave de rotacao 3D entre frente e verso.

### Implementation for User Story 4

- [x] T018 [US4] Create ELETROSCardTemplate main component with flip state in mobile/src/screens/DigitalCard/components/ELETROSCardTemplate.tsx
- [x] T019 [US4] Implement flip animation using react-native-reanimated (rotateY with interpolate) in ELETROSCardTemplate.tsx
- [x] T020 [US4] Add front card view (ELETROSCurvedBackground + ELETROSHeader + ELETROSBodyFront) in ELETROSCardTemplate.tsx
- [x] T021 [US4] Add back card view (ELETROSHeader back + ELETROSBodyBack) in ELETROSCardTemplate.tsx
- [x] T022 [US4] Add flip button with 48x48dp minimum touch target and accessibility labels in ELETROSCardTemplate.tsx
- [x] T023 [US4] Block interaction during animation (isAnimating state) in ELETROSCardTemplate.tsx

**Checkpoint**: User Story 4 flip card animation is complete and testable

---

## Phase 6: User Story 3 - Renderizacao Condicional para Planos Elegiveis (Priority: P1)

**Goal**: Sistema renderiza o template Eletros-Saude apenas quando PRESTADOR_RECIPROCIDADE='ELETROS'.

**Independent Test**: Testar com diferentes combinacoes de prestador/plano e verificar que apenas cartoes elegiveis Eletros-Saude exibem o template especifico.

### Implementation for User Story 3

- [x] T024 [US3] Import ELETROSCardTemplate in mobile/src/screens/DigitalCard/DigitalCardScreen.tsx
- [x] T025 [US3] Import isELETROSEligible from cardUtils in DigitalCardScreen.tsx
- [x] T026 [US3] Add conditional rendering for ELETROS reciprocidade cards in DigitalCard component (DigitalCardScreen.tsx)
- [x] T027 [US3] Pass cardData and beneficiary props to ELETROSCardTemplate in DigitalCardScreen.tsx

**Checkpoint**: User Story 3 conditional rendering is complete - Eletros cards now appear for eligible beneficiaries

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T028 [P] Add export for ELETROSCardTemplate in mobile/src/screens/DigitalCard/components/index.ts (if exists)
- [x] T029 [P] Add exports for ELETROS components in mobile/src/components/cards/index.ts (if exists)
- [x] T030 Verify edge cases: empty fields show "-", long names truncate with ellipsis
- [x] T031 Verify responsiveness on minimum 320px width screens
- [x] T032 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel after Foundational
  - US4 depends on US1 and US2 components being complete
  - US3 depends on US4 (needs the template to exist)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (Logo, CurvedBackground, Utils)
    ↓
    ├──→ Phase 3: US1 (Front) ──┐
    │                            ├──→ Phase 5: US4 (Flip Template) ──→ Phase 6: US3 (Integration)
    └──→ Phase 4: US2 (Back) ───┘
                                                                            ↓
                                                                    Phase 7: Polish
```

### Within Each User Story

- Foundational components before user story implementation
- Header before Body (provides layout context)
- Visual components before integration
- Story complete before moving to dependent stories

### Parallel Opportunities

**Phase 1 (all parallel)**:
- T001, T002, T003 can run in parallel (same file but independent sections)

**Phase 2 (partial parallel)**:
- T004 and T005 can run in parallel (different files)
- T006 and T007 run after types are ready

**Phase 3 & 4 (parallel between stories)**:
- US1 (T008-T011) and US2 (T012-T017) can run in parallel by different developers

**Phase 7 (all parallel)**:
- T028, T029 can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch logo and curved background in parallel:
Task: "Create ELETROSLogo SVG component in mobile/src/components/cards/ELETROSLogo.tsx"
Task: "Create ELETROSCurvedBackground SVG component in mobile/src/components/cards/ELETROSCurvedBackground.tsx"
```

## Parallel Example: US1 and US2

```bash
# Developer A: User Story 1 (Front)
Task: "Create ELETROSHeader component (front variant) in mobile/src/components/cards/ELETROSHeader.tsx"
Task: "Create ELETROSBodyFront component in mobile/src/components/cards/ELETROSBodyFront.tsx"

# Developer B: User Story 2 (Back) - can start after T008 creates base header
Task: "Add back variant to ELETROSHeader in mobile/src/components/cards/ELETROSHeader.tsx"
Task: "Create ELETROSBodyBack component in mobile/src/components/cards/ELETROSBodyBack.tsx"
```

---

## Implementation Strategy

### MVP First (Setup + Foundational + US1 + US4 + US3)

1. Complete Phase 1: Setup (types and constants)
2. Complete Phase 2: Foundational (logo, background, utils)
3. Complete Phase 3: User Story 1 (front view)
4. Complete Phase 5: User Story 4 (flip template - front only initially)
5. Complete Phase 6: User Story 3 (integration)
6. **STOP and VALIDATE**: Test front card with flip button (shows front on both sides initially)
7. Deploy/demo if ready for front-only view

### Full Feature Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Front) → Visual test
3. Add User Story 2 (Back) → Visual test
4. Add User Story 4 (Flip) → Test flip animation
5. Add User Story 3 (Integration) → Test in app with real data
6. Polish phase → Final validation

### Single Developer Strategy

Execute in this order:
1. T001 → T002 → T003 (Setup)
2. T004 → T005 → T006 → T007 (Foundational)
3. T008 → T009 → T010 → T011 (US1)
4. T012 → T013 → T014 → T015 → T016 → T017 (US2)
5. T018 → T019 → T020 → T021 → T022 → T023 (US4)
6. T024 → T025 → T026 → T027 (US3)
7. T028 → T029 → T030 → T031 → T032 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- User Stories 1 and 2 can be developed in parallel
- User Story 4 (Flip) must wait for visual components from US1 and US2
- User Story 3 (Integration) must wait for template from US4
- Follow VIVESTCardTemplate.tsx as reference implementation
- Verify all accessibility labels for flip button and card views
- Test on minimum 320px width for responsiveness
