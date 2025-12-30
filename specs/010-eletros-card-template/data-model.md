# Data Model: Template Carteirinha Digital Eletros-Saude

**Feature**: 010-eletros-card-template
**Date**: 2025-12-30
**Status**: Complete

## Overview

Este documento define os tipos TypeScript e estruturas de dados para o template de carteirinha Eletros-Saude. Os dados sao derivados da interface existente `OracleReciprocidade` combinados com dados do beneficiario logado.

## Source Data (Existing)

### OracleReciprocidade (oracle.ts)

```typescript
// Dados vindos da API - NAO MODIFICAR
interface OracleReciprocidade {
  CD_MATRICULA_RECIPROCIDADE: string;  // Matricula na Eletros-Saude
  PRESTADOR_RECIPROCIDADE: string;      // 'ELETROS' para elegibilidade
  DT_VALIDADE_CARTEIRA: string;         // Data ISO
  PLANO_ELOSAUDE: string;               // Nome do plano EloSaude
  NR_CPF?: number;
  NOME_BENEFICIARIO?: string;
  DT_NASCIMENTO?: string;
  SN_ATIVO?: string;
  // Campos adicionais do Oracle para verso
  SEGMENTACAO_PLANO?: string;           // Ex: "AMBULATORIAL MAIS HOSPITALAR COM OBSTETRICIA"
  ACOMODACAO?: string;                  // Ex: "APARTAMENTO STANDARD"
  ABRANGENCIA?: string;                 // Ex: "ESTADUAL"
  TIPO_CONTRATACAO?: string;            // Ex: "OUTROS"
  UTI_MOVEL?: string;                   // "S" ou "N"
  CPT?: string;                         // Ex: "NAO HA"
}
```

## New Types (eletros.ts)

### ELETROSCardData

Dados formatados para exibicao no template. Combina dados da API com valores derivados/estaticos.

```typescript
/**
 * Dados formatados para exibicao no template Eletros-Saude
 */
export interface ELETROSCardData {
  // === FRENTE ===

  // Header
  ansNumber: string;            // "ANS - No 42.207-0"

  // Body - Identificacao
  registrationNumber: string;   // Matricula reciprocidade formatada
  beneficiaryName: string;      // Nome completo em MAIUSCULAS

  // Body - Grid Principal (3 colunas)
  birthDate: string;            // DD/MM/YYYY
  validityDate: string;         // DD/MM/YYYY
  planName: string;             // Ex: "RECIPROCIDADE ES ELOSAUDE"

  // Body - Footer
  legalText: string;            // Texto de apresentacao obrigatoria

  // === VERSO ===

  // Body - Dados Tecnicos
  segmentation: string;         // Ex: "AMBULATORIAL MAIS HOSPITALAR COM OBSTETRICIA"
  accommodation: string;        // Ex: "APARTAMENTO STANDARD"
  coverage: string;             // Ex: "ESTADUAL"
  contractType: string;         // Ex: "OUTROS"
  utiMobile: string;            // Ex: "N"
  cpt: string;                  // Ex: "NAO HA"

  // Body - Contatos
  contacts: ELETROSContactInfo;

  // Body - Nota
  transferabilityNote: string;  // "Este cartao e pessoal e intransferivel..."
}

/**
 * Informacoes de contato para o verso do cartao
 */
export interface ELETROSContactInfo {
  eletrosSaude: {
    label: string;              // "Eletros-Saude:"
    phone: string;              // "(21) 3900-3132 (8h as 17h)"
    website: string;            // "www.eletrossaude.com.br"
  };
  emergencyService: {
    label: string;              // "Plantao Emergencial:"
    phones: string[];           // ["(21) 99681-8015", "(21) 99681-7223"]
    hours: string;              // "Das 17h as 8h e 24h por dia aos sabados, domingos e feriados"
  };
  ans: {
    label: string;              // "Disque ANS:"
    phone: string;              // "0800 7019656"
    website: string;            // "www.ans.gov.br"
  };
}
```

### ELETROSCardTemplateProps

Props do componente principal.

```typescript
import type { ViewStyle } from 'react-native';
import type { OracleReciprocidade } from './oracle';

/**
 * Props do componente ELETROSCardTemplate
 */
export interface ELETROSCardTemplateProps {
  /** Dados do cartao de reciprocidade da API */
  cardData: OracleReciprocidade;

  /** Dados do beneficiario logado */
  beneficiary: {
    full_name: string;
    birth_date?: string;
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
 * Props do componente ELETROSHeader
 */
export interface ELETROSHeaderProps {
  /** Variante: frente (logo branco sobre curva) ou verso (logo colorido) */
  variant: 'front' | 'back';
}

/**
 * Props do componente ELETROSLogo
 */
export interface ELETROSLogoProps {
  /** Variante de cor: branco para header azul, colorido para header branco */
  variant: 'white' | 'colored';
  /** Largura do logo */
  width?: number;
  /** Altura do logo */
  height?: number;
}

/**
 * Props do componente ELETROSCurvedBackground
 */
export interface ELETROSCurvedBackgroundProps {
  /** Largura do container pai */
  width: number;
  /** Altura total do card */
  height: number;
}

/**
 * Props do componente ELETROSBodyFront
 */
export interface ELETROSBodyFrontProps {
  registrationNumber: string;
  beneficiaryName: string;
  gridData: {
    birthDate: string;
    validityDate: string;
    planName: string;
  };
  legalText: string;
}

/**
 * Props do componente ELETROSBodyBack
 */
export interface ELETROSBodyBackProps {
  technicalData: {
    segmentation: string;
    accommodation: string;
    coverage: string;
    contractType: string;
    utiMobile: string;
    cpt: string;
  };
  contacts: ELETROSContactInfo;
  transferabilityNote: string;
}
```

## Constants

### Cores

```typescript
/**
 * Paleta de cores do template Eletros-Saude
 */
export const ELETROS_COLORS = {
  // Header (Frente) - Gradiente azul/verde
  headerGradientStart: '#2E7D87',
  headerGradientEnd: '#4DA8B3',

  // Textos
  textWhite: '#FFFFFF',
  textDark: '#333333',
  textGray: '#666666',

  // Destaques
  highlightRed: '#E53935',
  dividerGreen: '#4CAF50',

  // Logo colorido
  logoIconColor: '#2E7D87',
  logoTextGray: '#4A4A4A',
  logoTextGreen: '#4CAF50',

  // Tags e backgrounds
  ansTagBackground: '#000000',
  ansTagBorder: '#FFFFFF',
  cardBackground: '#FFFFFF',
} as const;
```

### Informacoes Estaticas

```typescript
/**
 * Informacoes estaticas da Eletros-Saude
 */
export const ELETROS_STATIC_INFO = {
  ansNumber: 'ANS - No 42.207-0',
  legalText: 'Apresentacao obrigatoria na utilizacao dos servicos, acompanhada do documento oficial de identidade.',
  transferabilityNote: 'Este cartao e pessoal e intransferivel, sendo vedado o uso por terceiros.',
  contacts: {
    eletrosSaude: {
      label: 'Eletros-Saude:',
      phone: '(21) 3900-3132 (8h as 17h)',
      website: 'www.eletrossaude.com.br',
    },
    emergencyService: {
      label: 'Plantao Emergencial:',
      phones: ['(21) 99681-8015', '(21) 99681-7223'],
      hours: 'Das 17h as 8h e 24h por dia aos sabados, domingos e feriados.',
    },
    ans: {
      label: 'Disque ANS:',
      phone: '0800 7019656',
      website: 'www.ans.gov.br',
    },
  },
} as const;
```

## Utility Functions

### extractELETROSCardData

```typescript
/**
 * Transforma dados da API em formato para exibicao no template Eletros-Saude
 */
export function extractELETROSCardData(
  oracleData: OracleReciprocidade,
  beneficiary: {
    full_name: string;
    birth_date?: string;
  }
): ELETROSCardData {
  return {
    // Frente
    ansNumber: ELETROS_STATIC_INFO.ansNumber,
    registrationNumber: oracleData.CD_MATRICULA_RECIPROCIDADE || '-',
    beneficiaryName: (oracleData.NOME_BENEFICIARIO || beneficiary.full_name || '-').toUpperCase(),
    birthDate: formatDate(oracleData.DT_NASCIMENTO || beneficiary.birth_date),
    validityDate: formatDate(oracleData.DT_VALIDADE_CARTEIRA),
    planName: oracleData.PLANO_ELOSAUDE || 'RECIPROCIDADE ES ELOSAUDE',
    legalText: ELETROS_STATIC_INFO.legalText,

    // Verso
    segmentation: oracleData.SEGMENTACAO_PLANO || 'AMBULATORIAL MAIS HOSPITALAR COM OBSTETRICIA',
    accommodation: oracleData.ACOMODACAO || 'APARTAMENTO STANDARD',
    coverage: oracleData.ABRANGENCIA || 'ESTADUAL',
    contractType: oracleData.TIPO_CONTRATACAO || 'OUTROS',
    utiMobile: oracleData.UTI_MOVEL || 'N',
    cpt: oracleData.CPT || 'NAO HA',
    contacts: ELETROS_STATIC_INFO.contacts,
    transferabilityNote: ELETROS_STATIC_INFO.transferabilityNote,
  };
}
```

### isELETROSEligible

```typescript
/**
 * Verifica se um cartao de reciprocidade e elegivel para template Eletros-Saude
 */
export function isELETROSEligible(card: OracleReciprocidade): boolean {
  return card.PRESTADOR_RECIPROCIDADE === 'ELETROS';
}
```

## Data Flow

```
OracleReciprocidade (API)
        │
        ▼
isELETROSEligible() ──► false ──► Renderiza template generico ou outro
        │
        ▼ true
extractELETROSCardData()
        │
        ▼
ELETROSCardData
        │
        ▼
ELETROSCardTemplate ──► ELETROSCardFront (header curvo, identificacao, grid)
                    └─► ELETROSCardBack (dados tecnicos, contatos)
```

## Validation Rules

| Field | Rule | Fallback |
|-------|------|----------|
| registrationNumber | Obrigatorio | "-" |
| beneficiaryName | Obrigatorio, uppercase | "-" |
| birthDate | DD/MM/YYYY format | "-" |
| validityDate | DD/MM/YYYY format | "-" |
| planName | String | "RECIPROCIDADE ES ELOSAUDE" |
| segmentation | String | "AMBULATORIAL MAIS HOSPITALAR COM OBSTETRICIA" |
| accommodation | String | "APARTAMENTO STANDARD" |
| coverage | String | "ESTADUAL" |
| contractType | String | "OUTROS" |
| utiMobile | "S" ou "N" | "N" |
| cpt | String | "NAO HA" |
