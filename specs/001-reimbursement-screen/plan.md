# Implementation Plan: Tela de Reembolso

**Branch**: `001-reimbursement-screen` | **Date**: 2025-12-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-reimbursement-screen/spec.md`

## Summary

Completar e aprimorar as telas de reembolso do aplicativo móvel Elosaúde. A funcionalidade base já existe (listagem, detalhes, criação, download de comprovante). A principal lacuna identificada é a funcionalidade de "Enviar Documentos Adicionais" que atualmente apenas loga no console. Este plano foca em completar essa funcionalidade e garantir conformidade com a constituição do projeto.

## Technical Context

**Language/Version**: TypeScript 5+ (Mobile), Python 3.11 (Backend)
**Primary Dependencies**:
- Mobile: React Native 0.73+, Expo, React Native Paper 5+, Redux Toolkit + RTK Query
- Backend: Django 4.2+, Django REST Framework, PostgreSQL 14+
**Storage**: PostgreSQL (backend), AsyncStorage (mobile cache)
**Testing**: Jest (mobile), pytest (backend - já configurado)
**Target Platform**: Android 8+ / iOS 15+
**Project Type**: Mobile + API
**Performance Goals**: Carregamento de lista < 3s em 3G, upload com progresso visual
**Constraints**: LGPD compliance, máximo 10MB por arquivo, formatos PDF/JPG/PNG
**Scale/Scope**: ~10k beneficiários, telas já existentes precisam de completamento

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence/Action |
|-----------|--------|-----------------|
| **I. LGPD & Privacy First** | ✅ PASS | Dados de reembolso são do próprio beneficiário autenticado; documentos armazenados no backend com acesso restrito; JWT com refresh token implementado |
| **II. API-First Design** | ✅ PASS | Endpoints REST já existem e estão documentados em Swagger; RTK Query hooks implementados |
| **III. Healthcare Standards Compliance** | ✅ PASS | Reembolsos seguem estrutura ANS; tipos de despesa mapeados para categorias TISS; retenção de documentos configurada |
| **IV. Security by Design** | ⚠️ REVIEW | Upload de arquivos valida tipo e tamanho; necessário verificar validação de CNPJ/CPF no backend |
| **V. Mobile-Accessible UX** | ✅ PASS | Telas usam React Native Paper (Material Design 3); botões com tamanho adequado; feedback visual em ações |

**Gate Result**: PASS - Pode prosseguir com pequena revisão de validação de documentos.

## Project Structure

### Documentation (this feature)

```text
specs/001-reimbursement-screen/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── apps/
│   └── reimbursements/
│       ├── models.py         # ReimbursementRequest, ReimbursementDocument
│       ├── serializers.py    # Serializers para CRUD
│       ├── views.py          # ViewSets com actions customizadas
│       ├── urls.py           # Router configuration
│       └── admin.py          # Admin panel
└── tests/
    └── reimbursements/       # Integration tests (a criar se necessário)

mobile/
├── src/
│   ├── screens/
│   │   └── Reimbursement/
│   │       ├── ReimbursementScreen.tsx        # Lista com resumo e filtros
│   │       ├── ReimbursementDetailScreen.tsx  # Detalhes + download
│   │       ├── CreateReimbursementScreen.tsx  # Formulário de criação
│   │       └── AddDocumentsModal.tsx          # A CRIAR: Modal para docs adicionais
│   ├── store/
│   │   └── services/
│   │       └── api.ts         # RTK Query endpoints
│   ├── components/
│   │   └── DocumentUploader.tsx  # Componente reutilizável
│   └── utils/
│       ├── fileUploader.ts    # Upload utilities
│       └── validationSchemas.ts  # Yup schemas
└── __tests__/                 # Jest tests (a criar se necessário)
```

**Structure Decision**: Mobile + API (Option 3). O projeto segue arquitetura com backend Django REST e mobile React Native. Todas as telas de reembolso já existem exceto o modal de documentos adicionais.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Nenhuma | N/A | N/A |

## Implementation Status

### Existing Implementation Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend API** | ✅ Complete | ViewSet com CRUD, my_reimbursements, summary, receipt-pdf |
| **ReimbursementScreen** | ✅ Complete | Lista com resumo, filtros, cards |
| **ReimbursementDetailScreen** | ✅ Complete | Detalhes, download de comprovante |
| **CreateReimbursementScreen** | ✅ Complete | Formulário com upload de documentos |
| **AddDocumentsModal** | ❌ Missing | Botão existe mas função não implementada |
| **addDocuments endpoint** | ❌ Missing | Backend não tem action para adicionar docs |

### Gap Analysis

1. **FR-014 (Enviar documentos adicionais)**: Botão "Enviar docs" na lista apenas loga `console.log('Enviar docs', item.id)` - não há implementação real
2. **Backend action**: Não existe endpoint dedicado para adicionar documentos a um reembolso existente
3. **Mobile modal**: Não existe componente AddDocumentsModal

## Next Steps

Após este plano, executar `/speckit.tasks` para gerar lista de tarefas detalhada focando em:

1. Criar endpoint backend `@action add_documents` no ReimbursementRequestViewSet
2. Criar componente AddDocumentsModal.tsx
3. Integrar modal na ReimbursementScreen
4. Adicionar mutation no RTK Query
5. Testes de integração
