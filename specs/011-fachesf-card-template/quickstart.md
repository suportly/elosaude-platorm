# Quickstart: Template Carteirinha Digital Fachesf

**Feature**: 011-fachesf-card-template
**Date**: 2025-12-30

## Prerequisites

- Node.js 18+
- Yarn ou npm
- Expo CLI
- Logo Fachesf Saude (PNG)

## Setup

1. **Checkout da branch**:
   ```bash
   git checkout 011-fachesf-card-template
   ```

2. **Instalar dependencias** (se necessario):
   ```bash
   cd mobile
   yarn install
   ```

3. **Adicionar logo**:
   - Copiar `LogoFachesf.png` para `mobile/src/assets/images/`

## Arquivos a Criar

### 1. Tipos e Constantes

**Arquivo**: `mobile/src/types/fachesf.ts`

```typescript
import type { ViewStyle } from 'react-native';
import type { OracleReciprocidade } from './oracle';

export const FACHESF_COLORS = {
  cardBackground: '#FFFFFF',
  accent: '#2BB673',
  textValue: '#333333',
  textLabel: '#999999',
  divider: '#E0E0E0',
} as const;

export const FACHESF_STATIC_INFO = {
  ansNumber: '31723-3',
  legalText: 'Esta carteira so e valida mediante apresentacao de documento de identificacao do portador.',
  contacts: {
    credenciado: { label: 'CREDENCIADO', phone: '(XX) XXXX-XXXX' },
    beneficiario: { label: 'BENEFICIARIO', phone: '(XX) XXXX-XXXX' },
  },
} as const;

// ... interfaces (ver data-model.md)
```

### 2. Funcoes Utilitarias

**Arquivo**: `mobile/src/utils/cardUtils.ts` (adicionar)

```typescript
export function isFACHESFEligible(card: OracleReciprocidade): boolean {
  return card.PRESTADOR_RECIPROCIDADE?.toUpperCase() === 'FACHESF';
}

export function extractFACHESFCardData(
  oracleData: OracleReciprocidade,
  beneficiary: { full_name: string }
): FACHESFCardData {
  // ... implementacao (ver data-model.md)
}
```

### 3. Componentes

Criar na pasta `mobile/src/components/cards/`:

- `FACHESFHeader.tsx` - Header com nome e badge
- `FACHESFBody.tsx` - Grid de informacoes
- `FACHESFFooter.tsx` - Rodape com contatos
- `FACHESFLogo.tsx` - Logo da operadora

### 4. Template Principal

**Arquivo**: `mobile/src/screens/DigitalCard/components/FACHESFCardTemplate.tsx`

```typescript
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { FACHESFHeader } from '../../../components/cards/FACHESFHeader';
import { FACHESFBody } from '../../../components/cards/FACHESFBody';
import { FACHESFFooter } from '../../../components/cards/FACHESFFooter';
// ...
```

## Testar

1. **Iniciar o app**:
   ```bash
   cd mobile
   npx expo start
   ```

2. **Verificar elegibilidade**:
   - Usar um beneficiario com `PRESTADOR_RECIPROCIDADE = 'Fachesf'`
   - Acessar tela de carteirinha digital

3. **Checklist visual**:
   - [ ] Fundo branco
   - [ ] Badge verde "ESPECIAL" no canto superior direito
   - [ ] Nome do beneficiario no topo esquerdo
   - [ ] Grid de informacoes com valor acima do label
   - [ ] Linha divisoria cinza
   - [ ] Texto legal em italico
   - [ ] Rodape com contatos
   - [ ] Logo Fachesf a direita
   - [ ] ANS vertical na lateral direita

## Comandos Uteis

```bash
# TypeScript check
npx tsc --noEmit

# Rodar no iOS
npx expo run:ios

# Rodar no Android
npx expo run:android
```

## Referencias

- [spec.md](./spec.md) - Especificacao completa
- [data-model.md](./data-model.md) - Modelo de dados
- [research.md](./research.md) - Pesquisa e decisoes
- Templates existentes em `mobile/src/screens/DigitalCard/components/`
