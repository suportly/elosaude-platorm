# Tasks: Template Carteirinha Digital Fachesf

**Input**: Design documents from `/specs/011-fachesf-card-template/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No tests requested in spec - implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type definitions

- [x] T001 Create types and constants file at `mobile/src/types/fachesf.ts` with FACHESF_COLORS, FACHESF_STATIC_INFO, and interfaces (FACHESFCardData, FACHESFContacts, FACHESFCardTemplateProps)
- [x] T002 [P] Add `isFACHESFEligible()` function to `mobile/src/utils/cardUtils.ts`
- [x] T003 [P] Add `extractFACHESFCardData()` function to `mobile/src/utils/cardUtils.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base components and assets that all user stories depend on

**Critical**: No user story work can begin until this phase is complete

- [ ] T004 Add Fachesf logo asset to `mobile/src/assets/images/LogoFachesf.png` (pending - using placeholder)
- [x] T005 [P] Create `FACHESFLogo.tsx` component in `mobile/src/components/cards/` (renders logo with configurable size)
- [x] T006 Update `mobile/src/components/cards/index.ts` to export FACHESF components

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Visualizar Carteirinha Fachesf (Priority: P1)

**Goal**: Beneficiario visualiza carteirinha com template Fachesf (fundo branco, badge ESPECIAL, hierarquia invertida)

**Independent Test**: Criar beneficiario com plano Fachesf e verificar se a carteirinha renderiza com layout correto

### Implementation for User Story 1

- [x] T007 [US1] Create `FACHESFHeader.tsx` in `mobile/src/components/cards/` - Header com nome do beneficiario e badge "ESPECIAL" verde no canto superior direito
- [x] T008 [US1] Create `FACHESFBody.tsx` in `mobile/src/components/cards/` - Grid de informacoes com hierarquia invertida (valor acima do label):
  - Linha 1: Matricula/CODIGO, Validade/VALIDADE, CNS/CNS
  - Linha 2: Acomodacao/ACOMODACAO, Cobertura/COBERTURA
- [x] T009 [US1] Create `FACHESFCardTemplate.tsx` in `mobile/src/screens/DigitalCard/components/` - Template principal que compoe Header + Body + Footer
- [x] T010 [US1] Update `mobile/src/screens/DigitalCard/components/index.ts` to export FACHESFCardTemplate
- [x] T011 [US1] Update `mobile/src/screens/DigitalCard/DigitalCardScreen.tsx` to render FACHESFCardTemplate when beneficiary is FACHESF eligible

**Checkpoint**: User Story 1 complete - beneficiarios Fachesf visualizam carteirinha com design correto

---

## Phase 4: User Story 2 - Exibir Informacoes de Contato (Priority: P2)

**Goal**: Exibir telefones de contato da Fachesf no rodape da carteirinha

**Independent Test**: Verificar se secao de contatos aparece corretamente no rodape

### Implementation for User Story 2

- [x] T012 [US2] Create `FACHESFFooter.tsx` in `mobile/src/components/cards/` - Rodape com:
  - Titulo "Telefones para Contato"
  - Numeros para CREDENCIADO e BENEFICIARIO
  - Logo Fachesf posicionado a direita
  - Linha divisoria cinza acima (#E0E0E0)
- [x] T013 [US2] Add texto legal ao footer: "Esta carteira so e valida mediante apresentacao de documento de identificacao do portador." (italico)
- [x] T014 [US2] Update `FACHESFCardTemplate.tsx` to include FACHESFFooter component

**Checkpoint**: User Story 2 complete - contatos e logo exibidos no rodape

---

## Phase 5: User Story 3 - Exibir Registro ANS (Priority: P3)

**Goal**: Exibir numero ANS em texto vertical na lateral direita

**Independent Test**: Verificar se "ANS 31723-3" aparece na lateral direita em texto vertical

### Implementation for User Story 3

- [x] T015 [US3] Add ANS vertical text to `FACHESFCardTemplate.tsx` using `transform: [{ rotate: '-90deg' }]` with `position: 'absolute'` on right edge

**Checkpoint**: User Story 3 complete - registro ANS visivel na lateral direita

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final adjustments and validation

- [x] T016 [P] Run TypeScript check: `npx tsc --noEmit` in mobile directory (FACHESF files pass)
- [ ] T017 [P] Visual validation using quickstart.md checklist:
  - [ ] Fundo branco
  - [ ] Badge verde "ESPECIAL" no canto superior direito
  - [ ] Nome do beneficiario no topo esquerdo
  - [ ] Grid de informacoes com valor acima do label
  - [ ] Linha divisoria cinza
  - [ ] Texto legal em italico
  - [ ] Rodape com contatos
  - [ ] Logo Fachesf a direita
  - [ ] ANS vertical na lateral direita
- [ ] T018 Update CLAUDE.md with 011-fachesf-card-template entry (if needed)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T001 (types) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories should proceed sequentially (P1 -> P2 -> P3) as components build on each other
- **Polish (Phase 6)**: Depends on all user stories being complete

### Task Dependencies Within Phases

**Phase 1:**
- T001 must complete first (types needed by T002, T003)
- T002 and T003 can run in parallel [P]

**Phase 2:**
- T004, T005 can run in parallel [P]
- T006 depends on T005

**Phase 3:**
- T007, T008 can run in parallel [P] (different components)
- T009 depends on T007, T008 (composes them)
- T010 depends on T009
- T011 depends on T009, T010

**Phase 4:**
- T012 depends on Phase 3 (needs template structure)
- T013 is part of T012 (same file)
- T014 depends on T012

**Phase 5:**
- T015 depends on T009 (modifies template)

**Phase 6:**
- All tasks can run in parallel [P]

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + utils)
2. Complete Phase 2: Foundational (logo + base exports)
3. Complete Phase 3: User Story 1 (header + body + template)
4. **STOP and VALIDATE**: Test carteirinha with Fachesf beneficiary
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test card rendering -> MVP ready
3. Add User Story 2 -> Test footer contacts -> Enhanced
4. Add User Story 3 -> Test ANS display -> Complete
5. Polish and validate

---

## Notes

- Follow existing template patterns (ELETROS, VIVEST) for consistency
- Use `OracleReciprocidade` as data source (same as other templates)
- Template does NOT have flip animation (single-sided card)
- Hierarchia invertida: valor maior/escuro ACIMA, label menor/cinza/uppercase ABAIXO
- Badge "ESPECIAL" uses position absolute with top: 0, borderBottomLeftRadius: 20
- ANS text uses transform: [{ rotate: '-90deg' }] for vertical display
- Commit after each task or logical group
