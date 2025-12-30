# Tasks: Template Carteirinha Digital Vivest

**Input**: Design documents from `/specs/009-vivest-card-template/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Not requested in specification - test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Mobile project structure per plan.md:
- Types: `mobile/src/types/`
- Components: `mobile/src/components/cards/`
- Screens: `mobile/src/screens/DigitalCard/components/`
- Utils: `mobile/src/utils/`
- Assets: `mobile/src/assets/images/`

---

## Phase 1: Setup (Types & Constants)

**Purpose**: Define all TypeScript types, interfaces, and constants needed by the feature

- [x] T001 Create vivest.ts types file with all interfaces (VIVESTCardData, VIVESTContactInfo, VIVESTCardTemplateProps, VIVESTHeaderProps, VIVESTBodyFrontProps, VIVESTBodyBackProps, VIVESTDecorativeLinesProps) in mobile/src/types/vivest.ts
- [x] T002 Add VIVEST_ELIGIBLE_PLANS constant array with all 8 eligible plan names in mobile/src/types/vivest.ts
- [x] T003 [P] Add VIVEST_COLORS constant with primary (#003366), primaryLight (#004080), accent (#CC0000), text (#FFFFFF), textMuted, tagBackground colors in mobile/src/types/vivest.ts
- [x] T004 [P] Add VIVEST_STATIC_INFO constant with ANS numbers and contact information in mobile/src/types/vivest.ts
- [x] T005 Export vivest types from mobile/src/types/index.ts

---

## Phase 2: Foundational (Utility Functions & Shared Components)

**Purpose**: Core utilities and shared components that MUST be complete before user story implementation

**⚠️ CRITICAL**: All user stories depend on these foundational elements

- [x] T006 Implement isVIVESTEligible function checking PRESTADOR_RECIPROCIDADE='VIVEST' AND PLANO_ELOSAUDE in eligible list in mobile/src/utils/cardUtils.ts
- [x] T007 Implement extractVIVESTCardData function transforming OracleReciprocidade to VIVESTCardData in mobile/src/utils/cardUtils.ts
- [x] T008 [P] Create VIVESTDecorativeLines.tsx SVG component with curved white and red lines using react-native-svg Path elements in mobile/src/components/cards/VIVESTDecorativeLines.tsx
- [x] T009 [P] Create VIVESTHeader.tsx component with variant prop ('front' shows logo+plan box, 'back' shows title+ANS tag) in mobile/src/components/cards/VIVESTHeader.tsx
- [x] T010 [P] Add Vivest logo SVG asset (placeholder if not available) in mobile/src/assets/images/vivest-logo.svg

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Visualizacao da Carteirinha Vivest (Frente) (Priority: P1) 🎯 MVP

**Goal**: Beneficiario visualiza o lado frontal da carteirinha Vivest com todas as informacoes do plano

**Independent Test**: Navegar ate a tela de carteirinha com beneficiario elegivel Vivest e verificar exibicao do card frontal com fundo azul (#003366), logo, e dados do beneficiario

### Implementation for User Story 1

- [x] T011 [US1] Create VIVESTBodyFront.tsx component with registration number display (large, spaced format) in mobile/src/components/cards/VIVESTBodyFront.tsx
- [x] T012 [US1] Add beneficiary name section with value in bold uppercase and "Nome do Beneficiario" label below in mobile/src/components/cards/VIVESTBodyFront.tsx
- [x] T013 [US1] Implement 3-column grid for birthDate/effectiveDate/planRegistry with value-first, label-below pattern in mobile/src/components/cards/VIVESTBodyFront.tsx
- [x] T014 [US1] Implement 3-column grid for accommodation/coverage/contractor in mobile/src/components/cards/VIVESTBodyFront.tsx
- [x] T015 [US1] Add footer section with segmentation (left) and partialCoverage (right) in mobile/src/components/cards/VIVESTBodyFront.tsx
- [x] T016 [US1] Apply VIVEST_COLORS styling (primary background, white text, muted labels) and border-radius 12-16px in mobile/src/components/cards/VIVESTBodyFront.tsx
- [x] T017 [US1] Add accessibility labels for all data fields (accessibilityLabel, accessibilityRole) in mobile/src/components/cards/VIVESTBodyFront.tsx

**Checkpoint**: Front card visual complete - can be rendered standalone for validation

---

## Phase 4: User Story 2 - Visualizacao da Carteirinha Vivest (Verso) (Priority: P1)

**Goal**: Beneficiario visualiza o verso da carteirinha com carencias, ANS, CNS e contatos

**Independent Test**: Verificar exibicao do verso com titulo "Carencias", tags ANS, numero CNS e grid de contatos

### Implementation for User Story 2

- [x] T018 [US2] Create VIVESTBodyBack.tsx component with "Carencias" title section and gracePeriodText display in mobile/src/components/cards/VIVESTBodyBack.tsx
- [x] T019 [US2] Add operator ANS section with "OPERADORA CONTRATADA" label and "ANS-nº 417297" black tag in mobile/src/components/cards/VIVESTBodyBack.tsx
- [x] T020 [US2] Add CNS section with "Plano Regulamentado" label and CNS number value in mobile/src/components/cards/VIVESTBodyBack.tsx
- [x] T021 [US2] Implement contact grid with phone/globe icons for password release, Disque-Vivest, ANS hotline, and websites in mobile/src/components/cards/VIVESTBodyBack.tsx
- [x] T022 [US2] Apply VIVEST_COLORS styling and consistent typography with front card in mobile/src/components/cards/VIVESTBodyBack.tsx
- [x] T023 [US2] Add accessibility labels for all contact information and regulatory data in mobile/src/components/cards/VIVESTBodyBack.tsx

**Checkpoint**: Back card visual complete - can be rendered standalone for validation

---

## Phase 5: User Story 3 - Renderizacao Condicional para Planos Elegiveis (Priority: P1)

**Goal**: Sistema renderiza template Vivest apenas quando PRESTADOR_RECIPROCIDADE='VIVEST' E plano elegivel

**Independent Test**: Testar com diferentes combinacoes de prestador/plano e verificar template correto renderizado

### Implementation for User Story 3

- [x] T024 [US3] Import isVIVESTEligible from cardUtils and VIVESTCardTemplate in mobile/src/screens/DigitalCard/DigitalCardScreen.tsx
- [x] T025 [US3] Add conditional check in DigitalCard component: if cardType === 'RECIPROCIDADE' && isVIVESTEligible(item) render VIVESTCardTemplate in mobile/src/screens/DigitalCard/DigitalCardScreen.tsx
- [x] T026 [US3] Pass cardData and beneficiary props to VIVESTCardTemplate matching existing Unimed pattern in mobile/src/screens/DigitalCard/DigitalCardScreen.tsx
- [x] T027 [US3] Ensure non-eligible RECIPROCIDADE cards continue rendering with generic template in mobile/src/screens/DigitalCard/DigitalCardScreen.tsx

**Checkpoint**: Conditional rendering works - Vivest cards show Vivest template, others show generic

---

## Phase 6: User Story 4 - Interacao de Flip Card (Priority: P2)

**Goal**: Beneficiario pode alternar entre frente e verso com animacao 3D fluida (<400ms)

**Independent Test**: Tocar botao de flip e verificar animacao suave de rotacao 3D entre frente e verso

### Implementation for User Story 4

- [x] T028 [US4] Create VIVESTCardTemplate.tsx container component with useState for isFlipped state in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T029 [US4] Import useSharedValue and useAnimatedStyle from react-native-reanimated in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T030 [US4] Implement rotation shared value (0-180 degrees) with withTiming animation (400ms duration) in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T031 [US4] Create frontAnimatedStyle with rotateY transform and backfaceVisibility:'hidden' in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T032 [US4] Create backAnimatedStyle with rotateY +180deg offset and backfaceVisibility:'hidden' in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T033 [US4] Render Animated.View containers for front (VIVESTHeader front + VIVESTBodyFront + VIVESTDecorativeLines) and back (VIVESTHeader back + VIVESTBodyBack + VIVESTDecorativeLines) in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T034 [US4] Add flip button/touchable with minimum 48x48dp touch target in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T035 [US4] Implement handleFlip function toggling rotation value and isFlipped state in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T036 [US4] Add accessibility for flip button: accessibilityRole="button", accessibilityLabel dynamic based on isFlipped state, accessibilityHint in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T037 [US4] Maintain credit card aspect ratio (1.586:1) using Dimensions and calculated height in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T038 [US4] Apply shadow styling consistent with other card templates (Shadows.lg) in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T039 [US4] Export VIVESTCardTemplate from mobile/src/screens/DigitalCard/components/index.ts (create if not exists)

**Checkpoint**: Full flip card functionality complete with smooth animation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, edge cases, and code quality

- [x] T040 Handle empty/null field values with "-" fallback in extractVIVESTCardData in mobile/src/utils/cardUtils.ts
- [x] T041 Implement text truncation with ellipsis for long beneficiary names in VIVESTBodyFront in mobile/src/components/cards/VIVESTBodyFront.tsx
- [x] T042 [P] Ensure responsive text wrapping for segmentation field on smaller screens in mobile/src/components/cards/VIVESTBodyFront.tsx
- [x] T043 [P] Prevent double-tap during flip animation by disabling button while animation runs in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [x] T044 [P] Add TypeScript strict type checking - run npx tsc --noEmit to verify no type errors (pre-existing errors unrelated to Vivest feature)
- [x] T045 Validate complete flow: launch app, navigate to DigitalCard, verify Vivest card renders with flip functionality

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ─── BLOCKS ALL USER STORIES
    │
    ├──────────────────────────────┐
    ▼                              ▼
Phase 3 (US1-Front)         Phase 4 (US2-Back)
    │                              │
    └──────────┬───────────────────┘
               ▼
        Phase 5 (US3-Conditional)
               │
               ▼
        Phase 6 (US4-Flip)
               │
               ▼
        Phase 7 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Front) | Phase 2 complete | US2 (different files) |
| US2 (Back) | Phase 2 complete | US1 (different files) |
| US3 (Conditional) | US1, US2 components exist | - |
| US4 (Flip) | US1, US2, US3 complete | - |

### Within Each User Story

- Components before integration
- Core implementation before styling
- Styling before accessibility
- All story tasks before checkpoint

### Parallel Opportunities

**Phase 1**: T003, T004 can run in parallel (different constants)
**Phase 2**: T008, T009, T010 can run in parallel (different files)
**Phase 3-4**: US1 and US2 can run in parallel (different component files)
**Phase 7**: T042, T043, T044 can run in parallel (different concerns)

---

## Parallel Example: US1 and US2 Together

```bash
# After Phase 2 completes, launch both stories in parallel:

# Developer A: User Story 1
Task: "Create VIVESTBodyFront.tsx component..."

# Developer B: User Story 2
Task: "Create VIVESTBodyBack.tsx component..."
```

---

## Implementation Strategy

### MVP First (Stories 1-3 Only)

1. Complete Phase 1: Setup (Types)
2. Complete Phase 2: Foundational (Utils + Shared Components)
3. Complete Phase 3: User Story 1 (Front Card)
4. Complete Phase 4: User Story 2 (Back Card)
5. Complete Phase 5: User Story 3 (Conditional Rendering)
6. **STOP and VALIDATE**: Test with real Vivest beneficiary data
7. Deploy if ready (flip animation is P2 enhancement)

### Full Feature Delivery

1. Complete MVP (Phases 1-5)
2. Complete Phase 6: User Story 4 (Flip Animation)
3. Complete Phase 7: Polish
4. Final validation per quickstart.md

### Incremental Delivery

| Milestone | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1+US2+US3 | Static Vivest card displays for eligible beneficiaries |
| Enhanced | +US4 | Interactive flip between front/back |
| Polished | +Phase 7 | Production-ready with edge cases handled |

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 45 |
| Phase 1 (Setup) | 5 tasks |
| Phase 2 (Foundational) | 5 tasks |
| Phase 3 (US1-Front) | 7 tasks |
| Phase 4 (US2-Back) | 6 tasks |
| Phase 5 (US3-Conditional) | 4 tasks |
| Phase 6 (US4-Flip) | 12 tasks |
| Phase 7 (Polish) | 6 tasks |
| Parallel Opportunities | 10 tasks marked [P] |
| MVP Scope | Phases 1-5 (27 tasks) |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story
- Each checkpoint allows independent validation
- Commit after each task or logical group
- Logo asset may need designer input - use placeholder SVG initially
- All tasks include exact file paths for direct implementation
