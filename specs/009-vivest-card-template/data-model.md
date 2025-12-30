# Data Model: Template Carteirinha Digital Vivest

**Feature**: 009-vivest-card-template
**Date**: 2025-12-30
**Status**: Complete

## Overview

Este documento define os tipos TypeScript e estruturas de dados para o template de carteirinha Vivest. Os dados sao derivados da interface existente `OracleReciprocidade` combinados com dados do beneficiario logado.

## Source Data (Existing)

### OracleReciprocidade (oracle.ts)

```typescript
// Dados vindos da API - NAO MODIFICAR
interface OracleReciprocidade {
  CD_MATRICULA_RECIPROCIDADE: string;  // Matricula na Vivest
  PRESTADOR_RECIPROCIDADE: string;      // 'VIVEST' para elegibilidade
  DT_VALIDADE_CARTEIRA: string;         // Data ISO
  PLANO_ELOSAUDE: string;               // Nome do plano EloSaude
  NR_CPF?: number;
  NOME_BENEFICIARIO?: string;
  DT_NASCIMENTO?: string;
  SN_ATIVO?: string;
}
```

## New Types (vivest.ts)

### VIVESTCardData

Dados formatados para exibicao no template. Combina dados da API com valores derivados/estaticos.

```typescript
/**
 * Dados formatados para exibicao no template Vivest
 */
export interface VIVESTCardData {
  // === FRENTE ===

  // Header
  planName: string;           // Nome do plano (ex: "DIGNA-AMH-CONVENIADO")

  // Body - Identificacao
  registrationNumber: string; // Matricula reciprocidade formatada
  beneficiaryName: string;    // Nome completo em MAIUSCULAS

  // Body - Grid Principal (3 colunas x 2 linhas)
  birthDate: string;          // DD/MM/YYYY
  effectiveDate: string;      // DD/MM/YYYY (inicio vigencia)
  planRegistry: string;       // Registro do plano (ex: "0")
  accommodation: string;      // Ex: "APARTAMENTO"
  coverage: string;           // Ex: "ESTADUAL"
  contractor: string;         // Ex: "ELOS"

  // Body - Footer
  segmentation: string;       // Ex: "AMBULAT. + HOSP. C/ OBSTETRÍCIA"
  partialCoverage: string;    // Ex: "NÃO HÁ"

  // === VERSO ===

  // Header
  gracePeriodTitle: string;   // "Carências"
  planAnsNumber: string;      // "ANS Nº 31547-8"

  // Body
  gracePeriodText: string;    // "Sem carências" ou lista

  // Footer - ANS Operadora
  operatorLabel: string;      // "OPERADORA CONTRATADA"
  operatorAnsNumber: string;  // "ANS-nº 417297"

  // Footer - CNS
  regulatedPlanLabel: string; // "Plano Regulamentado"
  cnsNumber: string;          // CNS do beneficiario

  // Footer - Contatos
  contacts: VIVESTContactInfo;
}

/**
 * Informacoes de contato para o verso do cartao
 */
export interface VIVESTContactInfo {
  passwordRelease: {
    label: string;    // "Liberação de senha"
    phones: string[]; // ["(11) 3333-4444", "(11) 3333-5555"]
  };
  disqueVivest: {
    label: string;    // "Disque-Vivest"
    phones: string[]; // ["0800 012 3456"]
  };
  ans: {
    label: string;    // "ANS"
    phone: string;    // "0800 701 9656"
  };
  websites: {
    vivest: string;   // "vivest.com.br"
    ans: string;      // "ans.gov.br"
  };
}
```

### VIVESTCardTemplateProps

Props do componente principal.

```typescript
import type { ViewStyle } from 'react-native';
import type { OracleReciprocidade } from './oracle';

/**
 * Props do componente VIVESTCardTemplate
 */
export interface VIVESTCardTemplateProps {
  /** Dados do cartao de reciprocidade da API */
  cardData: OracleReciprocidade;

  /** Dados do beneficiario logado */
  beneficiary: {
    full_name: string;
    company?: string;
    birth_date?: string;
    effective_date?: string;
    cns?: string;
  };

  /** Callback quando o card e pressionado (opcional) */
  onPress?: () => void;

  /** Estilo customizado do container (opcional) */
  style?: ViewStyle;

  /** Estado inicial do flip - true = verso visivel (opcional) */
  initialFlipped?: boolean;
}
```

### Component Props

```typescript
/**
 * Props do componente VIVESTHeader
 */
export interface VIVESTHeaderProps {
  /** Nome do plano para exibir no box */
  planName: string;
  /** Variante: frente mostra logo+plano, verso mostra titulo+ANS */
  variant: 'front' | 'back';
  /** Numero ANS (apenas para variant='back') */
  ansNumber?: string;
}

/**
 * Props do componente VIVESTBodyFront
 */
export interface VIVESTBodyFrontProps {
  registrationNumber: string;
  beneficiaryName: string;
  gridData: {
    birthDate: string;
    effectiveDate: string;
    planRegistry: string;
    accommodation: string;
    coverage: string;
    contractor: string;
  };
  segmentation: string;
  partialCoverage: string;
}

/**
 * Props do componente VIVESTBodyBack
 */
export interface VIVESTBodyBackProps {
  gracePeriodText: string;
  operatorAnsNumber: string;
  cnsNumber: string;
  contacts: VIVESTContactInfo;
}

/**
 * Props do componente VIVESTDecorativeLines
 */
export interface VIVESTDecorativeLinesProps {
  /** Posicao: superior-direito ou inferior-direito */
  position: 'top-right' | 'bottom-right';
  /** Largura do container pai */
  width: number;
  /** Altura do container pai */
  height: number;
}
```

## Constants

### Planos Elegiveis

```typescript
/**
 * Lista de planos EloSaude elegiveis para template Vivest
 */
export const VIVEST_ELIGIBLE_PLANS = [
  'ELOSAUDE EXECUTIVE - DIRETORES',
  'ELOSAUDE EXECUTIVE - GERENTES',
  'ELOSAUDE EXECUTIVE - DIRETORES - DIAMANTE',
  'ELOSAUDE EXECUTIVE - GERENTES - DIAMANTE',
  'ELOSAUDE EXECUTIVE - DIRETORES - PAMPA',
  'ELOSAUDE EXECUTIVE - GERENTES - PAMPA',
  'SAUDE MAIS',
  'SAUDE MAIS II',
] as const;

export type VIVESTEligiblePlan = typeof VIVEST_ELIGIBLE_PLANS[number];
```

### Cores

```typescript
/**
 * Paleta de cores do template Vivest
 */
export const VIVEST_COLORS = {
  primary: '#003366',
  primaryLight: '#004080',
  accent: '#CC0000',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  tagBackground: '#1A1A1A',
} as const;
```

### Informacoes Estaticas

```typescript
/**
 * Informacoes estaticas da Vivest
 */
export const VIVEST_STATIC_INFO = {
  planAnsNumber: 'ANS Nº 31547-8',
  operatorAnsNumber: 'ANS-nº 417297',
  contacts: {
    passwordRelease: {
      label: 'Liberação de senha',
      phones: ['(11) 3329-3701'],
    },
    disqueVivest: {
      label: 'Disque-Vivest',
      phones: ['0800 016 6633'],
    },
    ans: {
      label: 'ANS',
      phone: '0800 701 9656',
    },
    websites: {
      vivest: 'vivest.com.br',
      ans: 'ans.gov.br',
    },
  },
} as const;
```

## Utility Functions

### extractVIVESTCardData

```typescript
/**
 * Transforma dados da API em formato para exibicao no template Vivest
 */
export function extractVIVESTCardData(
  oracleData: OracleReciprocidade,
  beneficiary: {
    full_name: string;
    company?: string;
    birth_date?: string;
    effective_date?: string;
    cns?: string;
  }
): VIVESTCardData;
```

### isVIVESTEligible

```typescript
/**
 * Verifica se um cartao de reciprocidade e elegivel para template Vivest
 */
export function isVIVESTEligible(card: OracleReciprocidade): boolean;
```

## Data Flow

```
OracleReciprocidade (API)
        │
        ▼
isVIVESTEligible() ──► false ──► Renderiza template generico
        │
        ▼ true
extractVIVESTCardData()
        │
        ▼
VIVESTCardData
        │
        ▼
VIVESTCardTemplate ──► VIVESTCardFront
                   └─► VIVESTCardBack
```

## Validation Rules

| Field | Rule | Fallback |
|-------|------|----------|
| registrationNumber | Obrigatorio | "-" |
| beneficiaryName | Obrigatorio, uppercase | "-" |
| birthDate | DD/MM/YYYY format | "-" |
| effectiveDate | DD/MM/YYYY format | "-" |
| planRegistry | Numerico | "0" |
| accommodation | String | "Não informado" |
| coverage | String | "Não informado" |
| contractor | String | beneficiary.company ou "-" |
| cnsNumber | 15 digitos | "-" |
