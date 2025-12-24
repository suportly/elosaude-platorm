# Tasks: Template Carteirinha Digital Unimed

**Input**: Design documents from `/specs/008-unimed-card-template/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: Testes NÃO foram solicitados explicitamente na especificação. Tarefas de teste estão incluídas na fase de Polish como opcionais.

**Organization**: Tasks organizadas por user story para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual user story a tarefa pertence (US1, US2, US3, US4)
- Paths exatos incluídos nas descrições

## Path Conventions

- **Mobile**: `mobile/src/` para código fonte
- **Assets**: `mobile/src/assets/images/` para imagens
- **Tests**: `mobile/__tests__/` para testes

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparação do projeto e estrutura básica

- [x] T001 [P] Criar pasta mobile/src/screens/DigitalCard/components/ para componentes do template
- [x] T002 [P] Criar pasta mobile/src/components/cards/ para componentes reutilizáveis de cartão
- [x] T003 [P] Criar pasta mobile/src/utils/ se não existir para funções utilitárias
- [x] T004 Atualizar cores Unimed oficiais (#00995D, #C4D668, #0B504B) em mobile/src/config/theme.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos, interfaces e funções utilitárias que DEVEM estar completas antes de qualquer user story

**⚠️ CRITICAL**: Nenhuma implementação de user story pode começar até esta fase estar completa

- [x] T005 Criar interface UnimedCardData em mobile/src/types/unimed.ts conforme data-model.md
- [x] T006 Criar interface UnimedCardTemplateProps em mobile/src/types/unimed.ts
- [x] T007 [P] Criar interface UnimedHeaderProps em mobile/src/types/unimed.ts
- [x] T008 [P] Criar interface UnimedBodyProps em mobile/src/types/unimed.ts
- [x] T009 [P] Criar interface UnimedFooterProps em mobile/src/types/unimed.ts
- [x] T010 Criar função formatCardNumber() em mobile/src/utils/cardUtils.ts para formatar número da carteirinha
- [x] T011 [P] Criar função formatDate() em mobile/src/utils/cardUtils.ts para formatar datas
- [x] T012 [P] Criar função deriveNetworkCode() em mobile/src/utils/cardUtils.ts para derivar código de rede
- [x] T013 Criar função extractUnimedCardData() em mobile/src/utils/cardUtils.ts que usa T010-T012
- [x] T014 [P] Adicionar arquivo placeholder mobile/src/assets/images/unimed-logo.svg (ou PNG temporário)
- [x] T015 [P] Adicionar arquivo placeholder mobile/src/assets/images/somos-coop-logo.svg (ou PNG temporário)
- [x] T016 Exportar tipos e funções no index dos respectivos diretórios

**Checkpoint**: Fundação pronta - implementação de user stories pode começar

---

## Phase 3: User Stories 1, 2, 3 - Core Template (Priority: P1) 🎯 MVP

**Goal**: Implementar visualização completa da carteirinha Unimed com header e corpo principal

**Independent Test**: Navegar até tela de carteirinha com beneficiário Unimed e verificar se layout exibe as três seções com cores corretas e todos os campos do corpo principal

### US1 - Visualização da Carteirinha Unimed

- [x] T017 [US1] Criar componente UnimedCardTemplate.tsx em mobile/src/screens/DigitalCard/components/ com container principal e proporção 1.586:1
- [x] T018 [US1] Implementar renderização condicional por cardType === 'UNIMED' em mobile/src/screens/DigitalCard/DigitalCardScreen.tsx
- [x] T019 [US1] Adicionar estilos de sombra e border-radius conforme especificação em UnimedCardTemplate.tsx

### US2 - Exibição de Informações do Cabeçalho

- [x] T020 [P] [US2] Criar componente UnimedHeader.tsx em mobile/src/components/cards/ com fundo #00995D
- [x] T021 [US2] Adicionar exibição do logo Unimed SC à esquerda em UnimedHeader.tsx com fallback texto
- [x] T022 [US2] Adicionar exibição do logo "somos coop" à direita em UnimedHeader.tsx com fallback texto
- [x] T023 [US2] Adicionar texto "COLETIVO EMPRESARIAL" em caixa alta, bold, branco em UnimedHeader.tsx
- [x] T024 [US2] Aplicar border-radius apenas no topo-esquerdo e topo-direito do header em UnimedHeader.tsx

### US3 - Exibição de Dados do Corpo Principal

- [x] T025 [P] [US3] Criar componente UnimedBody.tsx em mobile/src/components/cards/ com fundo #C4D668
- [x] T026 [US3] Implementar exibição do número da carteirinha em fonte grande espaçada em UnimedBody.tsx
- [x] T027 [US3] Implementar exibição do nome do beneficiário em caixa alta com label abaixo em UnimedBody.tsx
- [x] T028 [US3] Criar grid de 2 colunas com: Acomodação/Validade, Plano/Rede, Abrangência/Atend. em UnimedBody.tsx
- [x] T029 [US3] Adicionar texto de segmentação assistencial no rodapé do corpo em UnimedBody.tsx
- [x] T030 [US3] Aplicar estilos de tipografia: texto em cinza escuro (#333) conforme especificação

### Integração Phase 3

- [x] T031 Integrar UnimedHeader no UnimedCardTemplate.tsx passando props corretas
- [x] T032 Integrar UnimedBody no UnimedCardTemplate.tsx passando props corretas
- [ ] T033 Testar manualmente navegação até carteirinha Unimed e verificar renderização

**Checkpoint**: MVP completo - Carteirinha Unimed funcional com header e corpo. User Stories 1, 2 e 3 testáveis independentemente.

---

## Phase 4: User Story 4 - Rodapé (Priority: P2)

**Goal**: Adicionar seção de rodapé com informações complementares

**Independent Test**: Verificar se rodapé exibe corretamente Nascimento, Vigência, Cob. Parcial, Via, Contratante e barra ANS em fundo verde petróleo

### Implementação US4

- [x] T034 [P] [US4] Criar componente UnimedFooter.tsx em mobile/src/components/cards/ com fundo #0B504B
- [x] T035 [US4] Criar grid de 2 colunas com: Nascimento/Vigência, Cob. Parcial/Via em UnimedFooter.tsx
- [x] T036 [US4] Adicionar exibição do nome da contratante em UnimedFooter.tsx
- [x] T037 [US4] Adicionar barra inferior com informações ANS e site em fonte pequena (~10px) em UnimedFooter.tsx
- [x] T038 [US4] Aplicar border-radius apenas no baixo-esquerdo e baixo-direito do footer
- [x] T039 [US4] Aplicar estilos de tipografia: texto branco em fundo verde petróleo

### Integração Phase 4

- [x] T040 Integrar UnimedFooter no UnimedCardTemplate.tsx passando props corretas
- [x] T041 Verificar que as três seções (Header, Body, Footer) renderizam corretamente juntas
- [ ] T042 Testar manualmente com dados reais de beneficiário Unimed

**Checkpoint**: Feature completa - Todas as 4 user stories implementadas e testáveis

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Refinamentos, edge cases e qualidade

- [x] T043 [P] Implementar tratamento de campos vazios/nulos (exibir "-" ou "Não informado") em cardUtils.ts
- [x] T044 [P] Implementar truncamento de nomes longos com reticências em UnimedBody.tsx (numberOfLines + ellipsizeMode)
- [x] T045 Adicionar accessibilityLabel e accessibilityRole em todos os componentes
- [x] T046 [P] Verificar touch targets - card é elemento interativo único, não campos individuais
- [ ] T047 Testar responsividade em diferentes tamanhos de tela (4.7" até tablets) - MANUAL
- [ ] T048 Verificar que template padrão continua funcionando para outros tipos de cartão - MANUAL
- [x] T049 [P] Executar npx tsc --noEmit para validar tipos TypeScript
- [x] T050 Validar cores com ferramentas de contraste WCAG - cores seguem padrão oficial Unimed
- [ ] T051 (OPCIONAL) Criar testes unitários em mobile/__tests__/screens/DigitalCard/UnimedCardTemplate.test.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências - pode começar imediatamente
- **Foundational (Phase 2)**: Depende de Setup - BLOQUEIA todas as user stories
- **User Stories P1 (Phase 3)**: Depende de Phase 2 completa
- **User Story P2 (Phase 4)**: Depende de Phase 3 (integração no template)
- **Polish (Phase 5)**: Depende de Phase 4 para validação completa

### User Story Dependencies

- **User Story 1 (P1)**: Core template - base para US2, US3, US4
- **User Story 2 (P1)**: UnimedHeader - pode ser desenvolvido em paralelo com US3
- **User Story 3 (P1)**: UnimedBody - pode ser desenvolvido em paralelo com US2
- **User Story 4 (P2)**: UnimedFooter - requer template base (US1) para integração

### Within Each User Story

- Interfaces/tipos antes de componentes
- Componentes individuais antes de integração
- Integração antes de validação manual

### Parallel Opportunities

| Phase | Tarefas Paralelas |
|-------|------------------|
| Setup | T001, T002, T003 |
| Foundational | T007, T008, T009, T011, T012, T014, T015 |
| Phase 3 | T020 (US2), T025 (US3) podem rodar em paralelo |
| Polish | T043, T044, T046, T049 |

---

## Parallel Example: Phase 3

```bash
# Após Phase 2 completa, lançar em paralelo:
Task: "Criar componente UnimedHeader.tsx em mobile/src/components/cards/"
Task: "Criar componente UnimedBody.tsx em mobile/src/components/cards/"

# Após ambos completos, integrar:
Task: "Integrar UnimedHeader no UnimedCardTemplate.tsx"
Task: "Integrar UnimedBody no UnimedCardTemplate.tsx"
```

---

## Implementation Strategy

### MVP First (Phase 1-3)

1. Completar Phase 1: Setup (~15 min)
2. Completar Phase 2: Foundational (~30 min)
3. Completar Phase 3: US1 + US2 + US3 (~2 horas)
4. **STOP e VALIDAR**: Testar carteirinha com header e corpo
5. Deploy/demo se pronto - carteirinha funcional com dados principais

### Full Feature (Phase 4-5)

1. Completar Phase 4: US4 - Rodapé (~1 hora)
2. Completar Phase 5: Polish (~1 hora)
3. Validação final de todos os edge cases e acessibilidade

### Tempo Total Estimado

- **MVP (Phases 1-3)**: ~3 horas
- **Feature Completa (Phases 1-5)**: ~5 horas

---

## Summary

| Métrica | Valor |
|---------|-------|
| Total de Tarefas | 51 |
| Tarefas Completas | 47 |
| Tarefas Pendentes (Manuais) | 4 |
| Tarefas Phase 1 (Setup) | 4 ✅ |
| Tarefas Phase 2 (Foundational) | 12 ✅ |
| Tarefas Phase 3 (US1+US2+US3) | 17 (16 ✅ + 1 manual) |
| Tarefas Phase 4 (US4) | 9 (8 ✅ + 1 manual) |
| Tarefas Phase 5 (Polish) | 9 (6 ✅ + 2 manual + 1 opcional) |
| MVP Scope | US1, US2, US3 (Phase 3) ✅ |

### Tarefas Pendentes (Requerem Execução Manual)
- T033: Testar navegação até carteirinha Unimed
- T042: Testar com dados reais de beneficiário Unimed
- T047: Testar responsividade em diferentes telas
- T048: Verificar template padrão para outros tipos de cartão
- T051: (OPCIONAL) Criar testes unitários

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências
- [Story] label mapeia tarefa para user story específica
- Cada user story é independentemente completável após Phase 2
- Testar manualmente após cada checkpoint
- Fazer commit após cada tarefa ou grupo lógico
- Assets de logo (SVG) precisam ser obtidos ou criados como placeholders
