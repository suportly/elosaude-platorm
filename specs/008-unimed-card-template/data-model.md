# Data Model: Template Carteirinha Digital Unimed

**Date**: 2025-12-23
**Feature**: 008-unimed-card-template
**Status**: Complete

## Overview

Esta feature não introduz novos modelos de dados persistentes. Utiliza estruturas de dados existentes da API e define interfaces TypeScript para o componente de template.

## Existing Data Structures (No Changes)

### OracleUnimed (Existing)

Definido em `mobile/src/types/oracle.ts`:

```typescript
export interface OracleUnimed {
  MATRICULA_UNIMED: string;    // Número da carteirinha
  PLANO: string;               // Nome do plano
  ABRANGENCIA: string;         // Abrangência geográfica
  ACOMODACAO: string;          // Tipo de acomodação
  Validade: string;            // Data de validade
  CPF?: number;                // CPF do beneficiário
  NOME?: string;               // Nome do beneficiário
}
```

### Beneficiary (Existing)

Definido em `mobile/src/store/slices/authSlice.ts`:

```typescript
interface Beneficiary {
  id: number;
  registration_number: string;
  cpf: string;
  full_name: string;
  status: string;
  beneficiary_type: string;
  company: string;
  health_plan: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}
```

## New TypeScript Interfaces

### UnimedCardData

Interface para dados processados do template Unimed:

```typescript
/**
 * Dados formatados para exibição no template Unimed
 * Combina OracleUnimed + Beneficiary + valores derivados
 */
export interface UnimedCardData {
  // Header
  contractType: string;          // "COLETIVO EMPRESARIAL"

  // Body - Identificação
  cardNumber: string;            // MATRICULA_UNIMED formatada
  beneficiaryName: string;       // NOME ou beneficiary.full_name

  // Body - Grid Principal
  accommodation: string;         // ACOMODACAO
  validity: string;              // Validade formatada
  planType: string;              // PLANO
  networkCode: string;           // Derivado de PLANO ou constante
  coverage: string;              // ABRANGENCIA
  serviceCode: string;           // Primeiros 4 dígitos de MATRICULA

  // Body - Segmentação
  assistanceSegmentation: string; // "AMBULATORIAL + HOSPITALAR COM OBSTETRÍCIA"

  // Footer - Datas
  birthDate: string;             // Formatada DD/MM/YYYY
  effectiveDate: string;         // Data de início do plano

  // Footer - Cobertura
  partialCoverage: string;       // "NÃO HÁ" (padrão)
  cardEdition: string;           // "Única" (padrão)

  // Footer - Contratante
  contractor: string;            // beneficiary.company

  // Footer - ANS
  ansInfo: string;               // Registro ANS + site
}
```

### UnimedCardTemplateProps

Props do componente principal:

```typescript
export interface UnimedCardTemplateProps {
  /** Dados do cartão Unimed da API */
  cardData: OracleUnimed;

  /** Dados do beneficiário logado */
  beneficiary: Beneficiary;

  /** Callback quando o card é pressionado (opcional) */
  onPress?: () => void;

  /** Mostrar QR Code (opcional) */
  showQRCode?: boolean;

  /** Estilo customizado do container (opcional) */
  style?: ViewStyle;
}
```

### UnimedHeaderProps

```typescript
export interface UnimedHeaderProps {
  /** Tipo de contrato (ex: "COLETIVO EMPRESARIAL") */
  contractType: string;
}
```

### UnimedBodyProps

```typescript
export interface UnimedBodyProps {
  /** Número da carteirinha formatado */
  cardNumber: string;

  /** Nome do beneficiário */
  beneficiaryName: string;

  /** Grid de informações */
  gridData: {
    accommodation: string;
    validity: string;
    planType: string;
    networkCode: string;
    coverage: string;
    serviceCode: string;
  };

  /** Texto de segmentação assistencial */
  assistanceSegmentation: string;
}
```

### UnimedFooterProps

```typescript
export interface UnimedFooterProps {
  /** Datas */
  birthDate: string;
  effectiveDate: string;

  /** Cobertura */
  partialCoverage: string;
  cardEdition: string;

  /** Contratante */
  contractor: string;

  /** Informações ANS */
  ansInfo: string;
}
```

## Data Transformation

### extractUnimedCardData()

Função utilitária para transformar dados brutos em formato de exibição:

```typescript
/**
 * Transforma dados da API em formato para exibição no template
 */
export function extractUnimedCardData(
  oracleData: OracleUnimed,
  beneficiary: Beneficiary
): UnimedCardData {
  return {
    // Header
    contractType: 'COLETIVO EMPRESARIAL',

    // Body - Identificação
    cardNumber: formatCardNumber(oracleData.MATRICULA_UNIMED),
    beneficiaryName: (oracleData.NOME || beneficiary.full_name).toUpperCase(),

    // Body - Grid
    accommodation: oracleData.ACOMODACAO || 'Não informado',
    validity: formatDate(oracleData.Validade),
    planType: oracleData.PLANO || '-',
    networkCode: deriveNetworkCode(oracleData.PLANO),
    coverage: oracleData.ABRANGENCIA || '-',
    serviceCode: oracleData.MATRICULA_UNIMED?.substring(0, 4) || '-',

    // Body - Segmentação
    assistanceSegmentation: 'AMBULATORIAL + HOSPITALAR COM OBSTETRÍCIA',

    // Footer - Datas
    birthDate: formatDate(beneficiary.birth_date),
    effectiveDate: formatDate(beneficiary.effective_date),

    // Footer - Cobertura
    partialCoverage: 'NÃO HÁ',
    cardEdition: 'Única',

    // Footer - Contratante
    contractor: beneficiary.company || '-',

    // Footer - ANS
    ansInfo: 'ANS 000000 | www.unimedsc.com.br',
  };
}
```

### Helper Functions

```typescript
/**
 * Formata número da carteirinha com espaços
 * Ex: "0025076959600008" -> "0 025 076959600000 8"
 */
function formatCardNumber(number: string): string {
  if (!number) return '-';
  // Implementar formatação conforme padrão Unimed
  return number.replace(/(.)(...)(.{12})(.)/, '$1 $2 $3 $4');
}

/**
 * Formata data para DD/MM/YYYY
 */
function formatDate(date: string | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Deriva código de rede do plano
 */
function deriveNetworkCode(plano: string | undefined): string {
  if (!plano) return 'N/A';
  // Mapear códigos conhecidos
  if (plano.includes('BASICO')) return 'NA05 BASICO';
  if (plano.includes('ESPECIAL')) return 'NA01 ESPECIAL';
  return 'N/A';
}
```

## Validation Rules

| Campo | Regra | Fallback |
|-------|-------|----------|
| cardNumber | Não vazio, 16+ caracteres | "-" |
| beneficiaryName | Não vazio | "-" |
| validity | Data válida futura | "-" |
| accommodation | Não vazio | "Não informado" |
| planType | Não vazio | "-" |
| coverage | Não vazio | "-" |
| contractor | Não vazio | "-" |

## State Transitions

Não aplicável - feature é read-only, exibindo dados estáticos da API.

## Entity Relationships

```text
OracleCardsResponse
└── unimed: OracleUnimed[]
    └── each card → UnimedCardData (transformed)
        └── displayed in UnimedCardTemplate
            ├── UnimedHeader
            ├── UnimedBody
            └── UnimedFooter
```
