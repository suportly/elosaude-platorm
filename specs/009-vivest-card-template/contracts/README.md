# API Contracts: Template Carteirinha Digital Vivest

**Feature**: 009-vivest-card-template
**Date**: 2025-12-30

## Status: No New APIs Required

Esta feature nao requer novas APIs. Utiliza a API existente de cartoes Oracle.

## Existing API Used

### GET /api/oracle-cards/my_oracle_cards/

Retorna todos os cartoes do beneficiario logado, incluindo cartoes de reciprocidade.

**Response (existing)**:
```json
{
  "carteirinha": [...],
  "unimed": [...],
  "reciprocidade": [
    {
      "CD_MATRICULA_RECIPROCIDADE": "123456789",
      "PRESTADOR_RECIPROCIDADE": "VIVEST",
      "DT_VALIDADE_CARTEIRA": "2025-12-31",
      "PLANO_ELOSAUDE": "ELOSAUDE EXECUTIVE - DIRETORES",
      "NR_CPF": 12345678900,
      "NOME_BENEFICIARIO": "JOAO DA SILVA",
      "DT_NASCIMENTO": "1980-01-15",
      "SN_ATIVO": "S"
    }
  ],
  "total_cards": 3
}
```

## Rendering Logic (Frontend Only)

A logica de renderizacao do template Vivest e puramente frontend:

```typescript
// Em DigitalCardScreen.tsx
if (cardType === 'RECIPROCIDADE' && isVIVESTEligible(item)) {
  return <VIVESTCardTemplate cardData={item} beneficiary={beneficiary} />;
}
```

## Future Considerations

Se no futuro for necessario buscar informacoes adicionais da Vivest (ex: carencias dinamicas, contatos atualizados), pode-se criar:

- `GET /api/vivest/card-info/{matricula}/` - Informacoes complementares
- `GET /api/vivest/contacts/` - Contatos atualizados

Por enquanto, informacoes de carencias e contatos sao estaticas conforme especificacao.
