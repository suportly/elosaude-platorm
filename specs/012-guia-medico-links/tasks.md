# Tasks: Guia Médico por Tipo de Cartão

**Input**: Design documents from `/specs/012-guia-medico-links/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Não solicitados na especificação - apenas validação manual.

**Organization**: Tasks agrupadas por user story para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: Qual user story esta task pertence (US1, US2, US3)
- Inclui caminhos exatos de arquivos nas descrições

## Path Conventions

- **Mobile**: `mobile/src/` para código fonte
- Paths baseados na estrutura do plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Criação de tipos e configurações base

- [ ] T001 [P] Create OperatorType and MedicalGuideConfig types in mobile/src/types/medicalGuide.ts
- [ ] T002 [P] Create MEDICAL_GUIDE_CONFIGS mapping with all 5 operators in mobile/src/config/medicalGuides.ts
- [ ] T003 Add getOperatorFromCard helper function in mobile/src/utils/cardUtils.ts
- [ ] T004 Add getMedicalGuideConfig helper function in mobile/src/config/medicalGuides.ts
- [ ] T005 Export new types from mobile/src/types/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Componente base reutilizável para todas as user stories

**⚠️ CRITICAL**: As user stories dependem deste componente base

- [ ] T006 Create MedicalGuideButton component in mobile/src/screens/DigitalCard/components/MedicalGuideButton.tsx
- [ ] T007 Export MedicalGuideButton from mobile/src/screens/DigitalCard/components/index.ts
- [ ] T008 Add getUserOperators utility function in mobile/src/utils/cardUtils.ts

**Checkpoint**: Infraestrutura base pronta - implementação das user stories pode começar

---

## Phase 3: User Story 1 - Acesso ao Guia Médico do Plano Único (Priority: P1) 🎯 MVP

**Goal**: Usuário com um cartão acessa o guia médico diretamente

**Independent Test**: Login com usuário que possui apenas 1 tipo de cartão, acessar Guia Médico, verificar que link correto aparece e abre portal externo

### Implementation for User Story 1

- [ ] T009 [US1] Create MedicalGuideScreen component in mobile/src/screens/MedicalGuide/MedicalGuideScreen.tsx
- [ ] T010 [US1] Create MedicalGuideScreen index export in mobile/src/screens/MedicalGuide/index.ts
- [ ] T011 [US1] Add MedicalGuide route to MainNavigator in mobile/src/navigation/MainNavigator.tsx
- [ ] T012 [US1] Add "Guia Médico" menu item in MoreScreen in mobile/src/screens/More/MoreScreen.tsx
- [ ] T013 [US1] Implement empty state message when no active cards in mobile/src/screens/MedicalGuide/MedicalGuideScreen.tsx
- [ ] T014 [US1] Add single operator card display for users with one plan in mobile/src/screens/MedicalGuide/MedicalGuideScreen.tsx

**Checkpoint**: User Story 1 completa - usuário com 1 cartão pode acessar guia médico

---

## Phase 4: User Story 2 - Acesso com Múltiplos Planos (Priority: P2)

**Goal**: Usuário com múltiplos cartões visualiza lista organizada de guias

**Independent Test**: Login com usuário que possui 2+ tipos de cartões, verificar que todos os guias relevantes aparecem em lista/grid

### Implementation for User Story 2

- [ ] T015 [US2] Implement multi-operator list/grid layout in mobile/src/screens/MedicalGuide/MedicalGuideScreen.tsx
- [ ] T016 [US2] Add operator logo/icon display for each guide card in mobile/src/screens/MedicalGuide/MedicalGuideScreen.tsx
- [ ] T017 [US2] Add operator color theming to guide cards in mobile/src/screens/MedicalGuide/MedicalGuideScreen.tsx
- [ ] T018 [US2] Ensure Linking.openURL opens in external browser in mobile/src/screens/MedicalGuide/MedicalGuideScreen.tsx

**Checkpoint**: User Story 2 completa - usuários com múltiplos planos podem acessar todos os guias

---

## Phase 5: User Story 3 - Integração na Carteirinha Digital (Priority: P3)

**Goal**: Botão de guia médico contextual em cada template de carteirinha

**Independent Test**: Visualizar carteirinha digital, verificar que botão "Guia Médico" aparece e abre portal correto

### Implementation for User Story 3

- [ ] T019 [P] [US3] Add MedicalGuideButton to FACHESFCardTemplate in mobile/src/screens/DigitalCard/components/FACHESFCardTemplate.tsx
- [ ] T020 [P] [US3] Add MedicalGuideButton to VIVESTCardTemplate in mobile/src/screens/DigitalCard/components/VIVESTCardTemplate.tsx
- [ ] T021 [P] [US3] Add MedicalGuideButton to ELETROSCardTemplate in mobile/src/screens/DigitalCard/components/ELETROSCardTemplate.tsx
- [ ] T022 [P] [US3] Add MedicalGuideButton to UnimedCardTemplate in mobile/src/screens/DigitalCard/components/UnimedCardTemplate.tsx
- [ ] T023 [P] [US3] Add MedicalGuideButton to ElosaúdeCardTemplate in mobile/src/screens/DigitalCard/components/ElosaúdeCardTemplate.tsx
- [ ] T024 [US3] Style MedicalGuideButton positioning below card in DigitalCardScreen in mobile/src/screens/DigitalCard/DigitalCardScreen.tsx

**Checkpoint**: User Story 3 completa - todas as carteirinhas têm acesso contextual ao guia

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Melhorias e validação final

- [ ] T025 [P] Run TypeScript check with npx tsc --noEmit
- [ ] T026 [P] Validate accessibility (touch targets 48x48dp, labels)
- [ ] T027 Run quickstart.md validation with test accounts
- [ ] T028 Visual testing on iOS and Android simulators

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências - pode começar imediatamente
- **Foundational (Phase 2)**: Depende de Phase 1
- **User Stories (Phase 3-5)**: Dependem de Phase 2
- **Polish (Phase 6)**: Depende de todas as user stories desejadas

### User Story Dependencies

- **User Story 1 (P1)**: Após Phase 2 - MVP independente
- **User Story 2 (P2)**: Após Phase 2 - Extensão de US1 mas testável independentemente
- **User Story 3 (P3)**: Após Phase 2 - Completamente independente de US1/US2

### Within Each User Story

- Configuração antes de componentes
- Componentes antes de integração
- Core antes de polish

### Parallel Opportunities

- T001, T002 podem rodar em paralelo (arquivos diferentes)
- T019, T020, T021, T022, T023 podem rodar em paralelo (templates diferentes)
- T025, T026 podem rodar em paralelo

---

## Parallel Example: User Story 3

```bash
# Launch all card template modifications together:
Task: "Add MedicalGuideButton to FACHESFCardTemplate"
Task: "Add MedicalGuideButton to VIVESTCardTemplate"
Task: "Add MedicalGuideButton to ELETROSCardTemplate"
Task: "Add MedicalGuideButton to UnimedCardTemplate"
Task: "Add MedicalGuideButton to ElosaúdeCardTemplate"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T008)
3. Complete Phase 3: User Story 1 (T009-T014)
4. **STOP and VALIDATE**: Testar US1 independentemente
5. Deploy/demo se pronto

### Incremental Delivery

1. Setup + Foundational → Base pronta
2. Add User Story 1 → Testar → Deploy (MVP!)
3. Add User Story 2 → Testar → Deploy
4. Add User Story 3 → Testar → Deploy
5. Cada story adiciona valor sem quebrar anteriores

---

## Task Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1: Setup | 5 | Tipos e configurações |
| Phase 2: Foundational | 3 | Componente base |
| Phase 3: US1 (P1) | 6 | Tela de Guia Médico |
| Phase 4: US2 (P2) | 4 | Lista múltiplos planos |
| Phase 5: US3 (P3) | 6 | Integração carteirinhas |
| Phase 6: Polish | 4 | Validação final |
| **Total** | **28** | |

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências
- [Story] label mapeia task para user story específica
- Cada user story deve ser independentemente completável e testável
- Commit após cada task ou grupo lógico
- Pare em qualquer checkpoint para validar story independentemente
