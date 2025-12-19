# Research: Tela de Reembolso

**Feature**: 001-reimbursement-screen
**Date**: 2025-12-15
**Status**: Complete

## Executive Summary

A funcionalidade de reembolso já está 90% implementada. A pesquisa focou em identificar lacunas e definir a melhor abordagem para completar a funcionalidade de "Enviar Documentos Adicionais" (FR-014).

## Research Items

### 1. Existing Implementation Analysis

**Decision**: Reutilizar componentes e padrões existentes

**Rationale**:
- O projeto já possui `DocumentUploader` component funcional
- `fileUploader.ts` já implementa upload com progresso
- RTK Query já tem estrutura de mutations para reembolsos
- Padrão de modais já estabelecido em outras telas

**Alternatives Considered**:
- Criar nova tela dedicada (rejeitado: modal é mais fluido para UX)
- Usar biblioteca externa de upload (rejeitado: já temos solução funcional)

### 2. Backend Endpoint for Additional Documents

**Decision**: Criar `@action add_documents` no ReimbursementRequestViewSet

**Rationale**:
- Segue padrão DRF já usado em `my_reimbursements`, `summary`, `receipt-pdf`
- Permite validação de status (só IN_ANALYSIS)
- Mantém consistência com arquitetura existente

**Alternatives Considered**:
- Usar DocumentViewSet diretamente (rejeitado: não valida status do reembolso)
- Criar endpoint separado fora do ViewSet (rejeitado: quebra padrão REST)

**Implementation Pattern**:
```python
@action(detail=True, methods=['post'], url_path='add-documents')
def add_documents(self, request, pk=None):
    reimbursement = self.get_object()
    if reimbursement.status != 'IN_ANALYSIS':
        return Response({'error': 'Documentos só podem ser adicionados a reembolsos em análise'},
                       status=status.HTTP_400_BAD_REQUEST)
    # Process uploaded documents
```

### 3. Mobile Modal Component Pattern

**Decision**: Criar `AddDocumentsModal.tsx` usando React Native Paper Modal

**Rationale**:
- Consistente com UI do projeto (Material Design 3)
- Reutiliza `DocumentUploader` existente
- Modal permite ação rápida sem perder contexto da lista

**Alternatives Considered**:
- Bottom Sheet (rejeitado: mais complexo, pouco ganho de UX)
- Nova tela com navegação (rejeitado: interrompe fluxo do usuário)

### 4. RTK Query Integration

**Decision**: Adicionar mutation `addReimbursementDocuments` no api.ts

**Rationale**:
- Segue padrão estabelecido com `createReimbursement`
- Invalida cache automaticamente com `invalidatesTags: ['Reimbursements']`
- Permite loading state e error handling padronizados

**Implementation Pattern**:
```typescript
addReimbursementDocuments: builder.mutation<void, { reimbursementId: number; documents: number[] }>({
  query: ({ reimbursementId, documents }) => ({
    url: `/reimbursements/requests/${reimbursementId}/add-documents/`,
    method: 'POST',
    body: { documents },
  }),
  invalidatesTags: ['Reimbursements'],
}),
```

### 5. File Upload Flow

**Decision**: Two-step upload (same as CreateReimbursementScreen)

**Rationale**:
- Padrão já implementado e testado
- Permite progresso visual por arquivo
- Separa upload de associação ao reembolso

**Flow**:
1. User selects files via DocumentUploader
2. Files uploaded via `uploadFiles()` → returns document IDs
3. Document IDs sent to `add-documents` endpoint
4. Backend associates documents to reimbursement

### 6. Validation Requirements

**Decision**: Manter validações existentes

**Rationale**:
- `validateFiles()` já verifica tipo (PDF, JPG, PNG) e tamanho (10MB)
- Backend já valida no ReimbursementDocumentSerializer
- Não precisa criar novas validações

**Validation Points**:
| Layer | Validation | Implementation |
|-------|------------|----------------|
| Mobile | File type | `validateFiles()` in fileUploader.ts |
| Mobile | File size | `validateFiles()` - max 10MB |
| Mobile | Min files | Modal requires at least 1 file |
| Backend | Status | `add_documents` action checks IN_ANALYSIS |
| Backend | Ownership | ViewSet filters by authenticated user |

## Technology Stack Confirmation

| Component | Technology | Version | Status |
|-----------|------------|---------|--------|
| Mobile Framework | React Native | 0.73+ | ✅ In use |
| Mobile UI | React Native Paper | 5+ | ✅ In use |
| State Management | Redux Toolkit + RTK Query | Latest | ✅ In use |
| Forms | React Hook Form + Yup | Latest | ✅ In use |
| Backend | Django + DRF | 4.2+ | ✅ In use |
| Database | PostgreSQL | 14+ | ✅ In use |
| File Storage | Django FileField | Local/S3 | ✅ Configured |

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Unauthorized access | JWT authentication required; ViewSet filters by user |
| File type injection | Backend validates file extensions and MIME types |
| File size DoS | 10MB limit enforced on mobile and backend |
| Status manipulation | Backend validates IN_ANALYSIS status |
| LGPD compliance | Documents stored per user; audit trail via timestamps |

## Performance Considerations

| Metric | Target | Approach |
|--------|--------|----------|
| Upload progress | Real-time | `onProgress` callback in uploadFiles() |
| Modal open time | < 300ms | Lazy load modal content |
| API response | < 2s | Backend already optimized with select_related |

## Resolved Clarifications

All technical decisions resolved. No NEEDS CLARIFICATION items remain.
