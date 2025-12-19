# Tasks: Tela de Reembolso

**Input**: Design documents from `/specs/001-reimbursement-screen/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Status**: A maioria das funcionalidades já está implementada. Este task list foca em completar a funcionalidade faltante (US5 - Enviar Documentos Adicionais) e validar as implementações existentes.

**Organization**: Tasks organizadas por user story para permitir implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: User story relacionada (US1, US2, US3, US4, US5)
- Caminhos exatos incluídos nas descrições

## Path Conventions

- **Backend**: `backend/apps/reimbursements/`
- **Mobile**: `mobile/src/screens/Reimbursement/`, `mobile/src/store/services/`

---

## Phase 1: Verification (Validar Implementação Existente)

**Purpose**: Confirmar que US1-US4 já implementadas funcionam corretamente antes de adicionar US5

- [x] T001 Verificar que ReimbursementScreen carrega lista e resumo em mobile/src/screens/Reimbursement/ReimbursementScreen.tsx
- [x] T002 [P] Verificar que CreateReimbursementScreen permite criar solicitação em mobile/src/screens/Reimbursement/CreateReimbursementScreen.tsx
- [x] T003 [P] Verificar que ReimbursementDetailScreen exibe detalhes em mobile/src/screens/Reimbursement/ReimbursementDetailScreen.tsx
- [x] T004 [P] Verificar que endpoint receipt-pdf gera PDF em backend/apps/reimbursements/views.py
- [x] T005 Verificar que RTK Query endpoints funcionam em mobile/src/store/services/api.ts

**Checkpoint**: Funcionalidades existentes (US1-US4) validadas e funcionando

---

## Phase 2: User Story 5 - Enviar Documentos Adicionais (Priority: P3) 🎯 MAIN GAP

**Goal**: Permitir que beneficiários enviem documentos adicionais para reembolsos em análise

**Independent Test**: Acessar um reembolso "Em Análise", tocar em "Enviar docs", selecionar documentos e confirmar envio

### Backend Implementation for US5

- [x] T006 [US5] Criar action add_documents no ReimbursementRequestViewSet em backend/apps/reimbursements/views.py
- [x] T007 [US5] Adicionar validação de status IN_ANALYSIS antes de permitir adição de documentos em backend/apps/reimbursements/views.py
- [x] T008 [US5] Atualizar Swagger documentation para novo endpoint em backend/apps/reimbursements/views.py

### Mobile Implementation for US5

- [x] T009 [P] [US5] Adicionar interface ReimbursementDocument em mobile/src/store/services/api.ts
- [x] T010 [P] [US5] Adicionar mutation addReimbursementDocuments no RTK Query em mobile/src/store/services/api.ts
- [x] T011 [US5] Criar componente AddDocumentsModal em mobile/src/screens/Reimbursement/AddDocumentsModal.tsx
- [x] T012 [US5] Implementar seleção de documentos usando DocumentUploader existente em mobile/src/screens/Reimbursement/AddDocumentsModal.tsx
- [x] T013 [US5] Implementar upload com progresso visual em mobile/src/screens/Reimbursement/AddDocumentsModal.tsx
- [x] T014 [US5] Implementar feedback de sucesso/erro em mobile/src/screens/Reimbursement/AddDocumentsModal.tsx

### Integration for US5

- [x] T015 [US5] Integrar AddDocumentsModal na ReimbursementScreen em mobile/src/screens/Reimbursement/ReimbursementScreen.tsx
- [x] T016 [US5] Substituir console.log por abertura do modal no botão "Enviar docs" em mobile/src/screens/Reimbursement/ReimbursementScreen.tsx
- [x] T017 [US5] Adicionar estado para controlar visibilidade do modal em mobile/src/screens/Reimbursement/ReimbursementScreen.tsx
- [x] T018 [US5] Invalidar cache de reembolsos após envio bem-sucedido via RTK Query tags

**Checkpoint**: US5 completa - beneficiários podem enviar documentos adicionais para reembolsos em análise

---

## Phase 3: Polish & Validation

**Purpose**: Melhorias que afetam múltiplas user stories e validação final

- [x] T019 [P] Verificar que botão "Enviar docs" só aparece para status IN_ANALYSIS em mobile/src/screens/Reimbursement/ReimbursementScreen.tsx
- [x] T020 [P] Adicionar feedback haptico ao enviar documentos em mobile/src/screens/Reimbursement/AddDocumentsModal.tsx
- [x] T021 Testar fluxo completo: criar reembolso → visualizar lista → enviar docs adicionais → visualizar detalhes
- [x] T022 [P] Verificar TypeScript sem erros com npx tsc --noEmit no diretório mobile/
- [x] T023 [P] Verificar Python linting com ruff check no diretório backend/
- [x] T024 Validar quickstart.md com fluxo de teste manual

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Verification)**: Sem dependências - iniciar imediatamente
- **Phase 2 (US5)**: Pode iniciar após T001-T005 confirmarem funcionamento
- **Phase 3 (Polish)**: Depende de Phase 2 completa

### User Story Dependencies

| User Story | Status | Dependência |
|------------|--------|-------------|
| US1 - Solicitar Novo Reembolso | ✅ Implementado | Nenhuma |
| US2 - Visualizar Lista | ✅ Implementado | Nenhuma |
| US3 - Visualizar Detalhes | ✅ Implementado | Depende de US2 para navegação |
| US4 - Baixar Comprovante | ✅ Implementado | Depende de US3 para navegação |
| **US5 - Enviar Docs Adicionais** | ✅ Implementado | Depende de US2 (botão na lista) |

### Within US5 (Phase 2)

1. Backend primeiro (T006-T008) - API deve existir antes do mobile
2. Mobile types e mutation (T009-T010) - podem rodar em paralelo
3. Modal component (T011-T014) - depende de T009-T010
4. Integration (T015-T018) - depende de modal pronto

### Parallel Opportunities

```text
# Fase 1 - Verificações em paralelo:
T002, T003, T004 podem rodar simultaneamente

# Fase 2 - Backend e Mobile types em paralelo:
T006-T008 (backend) || T009-T010 (mobile types)

# Fase 3 - Validações em paralelo:
T019, T020, T022, T023 podem rodar simultaneamente
```

---

## Parallel Example: US5 Implementation

```bash
# Step 1: Backend (sequencial)
T006 → T007 → T008

# Step 2: Mobile types (paralelo após backend)
T009 || T010

# Step 3: Modal component (sequencial, depende de Step 2)
T011 → T012 → T013 → T014

# Step 4: Integration (sequencial, depende de Step 3)
T015 → T016 → T017 → T018
```

---

## Implementation Strategy

### MVP Approach (Recommended)

1. **Verificação** (T001-T005): Confirmar que tudo existente funciona
2. **Backend US5** (T006-T008): Criar endpoint add-documents
3. **Mobile US5** (T009-T018): Implementar modal e integração
4. **Validação** (T019-T024): Testar fluxo completo

### Estimated Effort

| Phase | Tasks | Esforço Estimado |
|-------|-------|------------------|
| Verification | 5 | ~30 min |
| US5 Backend | 3 | ~1 hora |
| US5 Mobile | 10 | ~3 horas |
| Polish | 6 | ~1 hora |
| **Total** | **24** | **~5.5 horas** |

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências entre si
- [US5] = pertence à User Story 5 (única pendente)
- Commit após cada task ou grupo lógico
- US1-US4 já implementadas - apenas verificar funcionamento
- Foco principal: completar US5 (Enviar Documentos Adicionais)
- DocumentUploader já existe e deve ser reutilizado
- fileUploader.ts já tem uploadFiles() com progresso
