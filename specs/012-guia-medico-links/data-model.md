# Data Model: Guia Médico por Tipo de Cartão

**Feature**: 012-guia-medico-links
**Date**: 2026-01-05

## Overview

Esta feature não requer alterações no banco de dados. Os dados são derivados de entidades já existentes (cartões do usuário via Oracle API) e configuração estática de URLs.

## Entities

### OperatorType (Enum)

Representa os tipos de operadoras suportadas.

```typescript
type OperatorType =
  | 'FACHESF'
  | 'VIVEST'
  | 'UNIMED'
  | 'ELOSAUDE'
  | 'ELETROS';
```

### MedicalGuideConfig

Configuração estática de um guia médico por operadora.

| Field | Type | Description |
|-------|------|-------------|
| operator | OperatorType | Identificador da operadora |
| name | string | Nome de exibição da operadora |
| url | string | URL do portal de guia médico |
| icon | string | Nome do ícone (MaterialCommunityIcons) |
| color | string | Cor primária da operadora (hex) |

```typescript
interface MedicalGuideConfig {
  operator: OperatorType;
  name: string;
  url: string;
  icon: string;
  color: string;
}
```

### UserMedicalGuide

Guia médico disponível para um usuário específico (derivado em runtime).

| Field | Type | Description |
|-------|------|-------------|
| config | MedicalGuideConfig | Configuração do guia |
| cardCount | number | Quantidade de cartões dessa operadora |

```typescript
interface UserMedicalGuide {
  config: MedicalGuideConfig;
  cardCount: number;
}
```

## Static Configuration

### MEDICAL_GUIDE_CONFIGS

```typescript
const MEDICAL_GUIDE_CONFIGS: MedicalGuideConfig[] = [
  {
    operator: 'FACHESF',
    name: 'Fachesf',
    url: 'https://s008.fachesf.com.br/ConsultaCredenciadosRedeAtendimento/',
    icon: 'hospital-building',
    color: '#00B894',
  },
  {
    operator: 'VIVEST',
    name: 'Vivest',
    url: 'https://medhub.facilinformatica.com.br/provider-search',
    icon: 'hospital-building',
    color: '#0066CC',
  },
  {
    operator: 'UNIMED',
    name: 'Unimed',
    url: 'https://www.unimed.coop.br/site/web/guest/guia-medico#/',
    icon: 'hospital-building',
    color: '#00A651',
  },
  {
    operator: 'ELOSAUDE',
    name: 'Elosaúde',
    url: 'https://webprod.elosaude.com.br/#/guia-medico',
    icon: 'hospital-building',
    color: '#1A73E8',
  },
  {
    operator: 'ELETROS',
    name: 'Eletrossaúde',
    url: 'https://eletrossaude.com.br/rede-credenciada/',
    icon: 'hospital-building',
    color: '#FF6B00',
  },
];
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Data Flow                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Oracle API                                                     │
│      │                                                          │
│      ▼                                                          │
│  ┌────────────────┐                                            │
│  │ OracleCards    │  (carteirinha[], unimed[], reciprocidade[])│
│  └────────────────┘                                            │
│      │                                                          │
│      ▼                                                          │
│  ┌────────────────┐     ┌─────────────────────┐                │
│  │ Card Detection │ ──► │ getOperatorFromCard │                │
│  └────────────────┘     └─────────────────────┘                │
│      │                            │                             │
│      │                            ▼                             │
│      │                  ┌─────────────────────┐                │
│      │                  │ MEDICAL_GUIDE_CONFIGS│ (static)      │
│      │                  └─────────────────────┘                │
│      │                            │                             │
│      ▼                            ▼                             │
│  ┌────────────────────────────────────────────┐                │
│  │ UserMedicalGuide[] (computed at runtime)   │                │
│  └────────────────────────────────────────────┘                │
│      │                                                          │
│      ├──────────────────┬───────────────────┐                  │
│      ▼                  ▼                   ▼                  │
│  ┌──────────┐    ┌────────────┐    ┌──────────────┐           │
│  │ Card     │    │ Medical    │    │ Linking      │           │
│  │ Template │    │ Guide      │    │ .openURL()   │           │
│  │ Button   │    │ Screen     │    │              │           │
│  └──────────┘    └────────────┘    └──────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Existing Entities Used

### OracleReciprocidade (from oracle.ts)

Campos relevantes:
- `PRESTADOR_RECIPROCIDADE`: string - Identifica a operadora (FACHESF, VIVEST, ELETROS)
- `PLANO_ELOSAUDE`: string - Plano do beneficiário

### CardData (aggregated in DigitalCardScreen)

Campos relevantes:
- `_type`: 'CARTEIRINHA' | 'UNIMED' | 'RECIPROCIDADE' - Tipo do cartão
- `...OracleReciprocidade` - Dados de reciprocidade quando aplicável

## Validation Rules

1. **URL Format**: Todas as URLs devem começar com `https://`
2. **Operator Uniqueness**: Cada operadora aparece no máximo uma vez na lista de guias
3. **Card Association**: Guia só é exibido se usuário possui pelo menos 1 cartão ativo da operadora

## No Database Changes Required

Esta feature:
- ✅ Usa dados já disponíveis da API Oracle
- ✅ Configuração de URLs é estática no código
- ✅ Não persiste preferências do usuário
- ✅ Não requer migrations
