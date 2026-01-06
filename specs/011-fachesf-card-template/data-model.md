# Data Model: Template Carteirinha Digital Fachesf

**Feature**: 011-fachesf-card-template
**Date**: 2025-12-30

## Entities

### FACHESFCardData

Dados formatados para exibicao no template Fachesf.

```typescript
interface FACHESFCardData {
  // Header
  planType: string;           // Tipo do plano (ex: "ESPECIAL")

  // Beneficiario
  beneficiaryName: string;    // Nome completo

  // Grid Linha 1
  registrationCode: string;   // Matricula/Codigo
  validityDate: string;       // Validade (formato DD/MM/YYYY)
  cnsNumber: string;          // CNS (ou "-" se nao disponivel)

  // Grid Linha 2
  accommodation: string;      // Tipo de acomodacao (ex: "Apartamento")
  coverage: string;           // Cobertura (ex: "Ambulatorial + Hospitalar c/obstetricia")

  // Footer
  contacts: FACHESFContacts;  // Telefones de contato
  ansNumber: string;          // Registro ANS (31723-3)

  // Legal
  legalText: string;          // Texto de aviso legal
}
```

### FACHESFContacts

Informacoes de contato para o rodape.

```typescript
interface FACHESFContacts {
  credenciado: {
    label: string;            // "CREDENCIADO"
    phone: string;            // Telefone para credenciados
  };
  beneficiario: {
    label: string;            // "BENEFICIÁRIO"
    phone: string;            // Telefone para beneficiarios
  };
}
```

### FACHESF_COLORS

Paleta de cores do template.

```typescript
const FACHESF_COLORS = {
  // Background
  cardBackground: '#FFFFFF',

  // Badge/Accent
  accent: '#2BB673',
  accentDark: '#00A88F',

  // Textos
  textValue: '#333333',
  textLabel: '#999999',
  textDark: '#000000',
  textWhite: '#FFFFFF',

  // Divisores
  divider: '#E0E0E0',
} as const;
```

### FACHESF_STATIC_INFO

Informacoes estaticas da operadora.

```typescript
const FACHESF_STATIC_INFO = {
  ansNumber: '31723-3',
  legalText: 'Esta carteira so e valida mediante apresentacao de documento de identificacao do portador.',
  contacts: {
    credenciado: {
      label: 'CREDENCIADO',
      phone: '(XX) XXXX-XXXX',  // A ser definido
    },
    beneficiario: {
      label: 'BENEFICIARIO',
      phone: '(XX) XXXX-XXXX',  // A ser definido
    },
  },
} as const;
```

## Source Data Mapping

Mapeamento de `OracleReciprocidade` para `FACHESFCardData`:

| FACHESFCardData Field | OracleReciprocidade Field | Transform |
|-----------------------|---------------------------|-----------|
| planType | TIPO_PLANO ou constante | uppercase, default "ESPECIAL" |
| beneficiaryName | NOME_BENEFICIARIO | uppercase |
| registrationCode | MATRICULA_BENEFICIARIO | string |
| validityDate | VALIDADE_CARTAO | formatDate(DD/MM/YYYY) |
| cnsNumber | CNS_BENEFICIARIO | default "-" |
| accommodation | TIPO_ACOMODACAO | capitalize |
| coverage | COBERTURA | string |
| contacts | - | FACHESF_STATIC_INFO.contacts |
| ansNumber | - | FACHESF_STATIC_INFO.ansNumber |
| legalText | - | FACHESF_STATIC_INFO.legalText |

## Eligibility Function

```typescript
function isFACHESFEligible(card: OracleReciprocidade): boolean {
  return card.PRESTADOR_RECIPROCIDADE?.toUpperCase() === 'FACHESF';
}
```

## Component Props

### FACHESFCardTemplateProps

```typescript
interface FACHESFCardTemplateProps {
  cardData: OracleReciprocidade;
  beneficiary: {
    full_name: string;
    birth_date?: string;
  };
  onPress?: () => void;
  style?: ViewStyle;
}
```

### FACHESFHeaderProps

```typescript
interface FACHESFHeaderProps {
  beneficiaryName: string;
  planType: string;  // Para o badge
}
```

### FACHESFBodyProps

```typescript
interface FACHESFBodyProps {
  registrationCode: string;
  validityDate: string;
  cnsNumber: string;
  accommodation: string;
  coverage: string;
}
```

### FACHESFFooterProps

```typescript
interface FACHESFFooterProps {
  contacts: FACHESFContacts;
  ansNumber: string;
  legalText: string;
}
```
