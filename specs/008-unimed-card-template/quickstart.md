# Quickstart: Template Carteirinha Digital Unimed

**Date**: 2025-12-23
**Feature**: 008-unimed-card-template
**Estimated Effort**: ~4-6 horas de desenvolvimento

## Prerequisites

- Node.js 18+
- Expo CLI instalado
- Acesso ao repositório elosaude-platform
- Mobile app rodando localmente

## Quick Setup

```bash
# 1. Checkout da branch
git checkout 008-unimed-card-template

# 2. Instalar dependências (se necessário)
cd mobile && npm install

# 3. Iniciar o app
npx expo start
```

## Implementation Overview

### Arquivos a Criar

| Arquivo | Descrição | Prioridade |
|---------|-----------|------------|
| `UnimedCardTemplate.tsx` | Componente principal | P1 |
| `UnimedHeader.tsx` | Seção header verde | P1 |
| `UnimedBody.tsx` | Seção corpo verde-lima | P1 |
| `UnimedFooter.tsx` | Seção rodapé verde-petróleo | P1 |
| `unimed-logo.svg` | Logo Unimed SC | P1 |
| `somos-coop-logo.svg` | Logo Somos Coop | P1 |

### Arquivos a Modificar

| Arquivo | Modificação | Prioridade |
|---------|-------------|------------|
| `DigitalCardScreen.tsx` | Importar e renderizar UnimedCardTemplate | P1 |
| `theme.ts` | Adicionar cores Unimed oficiais | P1 |

## Step-by-Step Implementation

### Step 1: Adicionar Cores no Theme

Em `mobile/src/config/theme.ts`, atualizar cores do Unimed:

```typescript
cards: {
  unimed: {
    primary: '#00995D',    // Verde Unimed (header)
    secondary: '#C4D668',  // Verde Lima (body)
    accent: '#0B504B',     // Verde Petróleo (footer)
    textLight: '#FFFFFF',
    textDark: '#333333',
  },
}
```

### Step 2: Criar Estrutura de Pastas

```bash
mkdir -p mobile/src/screens/DigitalCard/components
mkdir -p mobile/src/components/cards
mkdir -p mobile/src/assets/images
```

### Step 3: Implementar UnimedHeader

```typescript
// mobile/src/components/cards/UnimedHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useColors } from '../../config/ThemeContext';

interface UnimedHeaderProps {
  contractType: string;
}

export function UnimedHeader({ contractType }: UnimedHeaderProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.cards.unimed.primary }]}>
      <View style={styles.logoRow}>
        {/* Logo Unimed à esquerda */}
        <Text style={styles.logoText}>Unimed</Text>
        {/* Logo Somos Coop à direita */}
        <Text style={styles.logoText}>somos coop</Text>
      </View>
      <Text style={styles.contractType}>{contractType}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contractType: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
```

### Step 4: Implementar UnimedBody

```typescript
// mobile/src/components/cards/UnimedBody.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../config/ThemeContext';

interface UnimedBodyProps {
  cardNumber: string;
  beneficiaryName: string;
  gridData: {
    accommodation: string;
    validity: string;
    planType: string;
    networkCode: string;
    coverage: string;
    serviceCode: string;
  };
  assistanceSegmentation: string;
}

export function UnimedBody({ cardNumber, beneficiaryName, gridData, assistanceSegmentation }: UnimedBodyProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.cards.unimed.secondary }]}>
      {/* Número da Carteirinha */}
      <Text style={styles.cardNumber}>{cardNumber}</Text>

      {/* Nome do Beneficiário */}
      <Text style={styles.beneficiaryName}>{beneficiaryName}</Text>
      <Text style={styles.label}>Nome do Beneficiário</Text>

      {/* Grid de Informações */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <InfoItem label="Acomodação" value={gridData.accommodation} />
          <InfoItem label="Validade" value={gridData.validity} />
        </View>
        <View style={styles.gridRow}>
          <InfoItem label="Plano" value={gridData.planType} />
          <InfoItem label="Rede de Atendimento" value={gridData.networkCode} />
        </View>
        <View style={styles.gridRow}>
          <InfoItem label="Abrangência" value={gridData.coverage} />
          <InfoItem label="Atend." value={gridData.serviceCode} />
        </View>
      </View>

      {/* Segmentação */}
      <Text style={styles.segmentation}>{assistanceSegmentation}</Text>
      <Text style={styles.segmentationLabel}>Segmentação Assistencial do Plano</Text>
    </View>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  cardNumber: { fontSize: 18, fontWeight: 'bold', color: '#333', letterSpacing: 2 },
  beneficiaryName: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 8 },
  label: { fontSize: 10, color: '#666' },
  grid: { marginTop: 12 },
  gridRow: { flexDirection: 'row', marginBottom: 8 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 10, color: '#666' },
  infoValue: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  segmentation: { fontSize: 11, fontWeight: 'bold', color: '#333', marginTop: 12 },
  segmentationLabel: { fontSize: 9, color: '#666' },
});
```

### Step 5: Implementar UnimedFooter

```typescript
// mobile/src/components/cards/UnimedFooter.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../config/ThemeContext';

interface UnimedFooterProps {
  birthDate: string;
  effectiveDate: string;
  partialCoverage: string;
  cardEdition: string;
  contractor: string;
  ansInfo: string;
}

export function UnimedFooter(props: UnimedFooterProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.cards.unimed.accent }]}>
      {/* Grid de Datas */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <InfoItem label="Nascimento" value={props.birthDate} />
          <InfoItem label="Vigência" value={props.effectiveDate} />
        </View>
        <View style={styles.gridRow}>
          <InfoItem label="Cob. Parcial Temp." value={props.partialCoverage} />
          <InfoItem label="Via" value={props.cardEdition} />
        </View>
      </View>

      {/* Contratante */}
      <Text style={styles.contractor}>Contratante: {props.contractor}</Text>

      {/* Barra ANS */}
      <Text style={styles.ansInfo}>{props.ansInfo}</Text>
    </View>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  grid: { marginBottom: 8 },
  gridRow: { flexDirection: 'row', marginBottom: 4 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 9, color: 'rgba(255,255,255,0.7)' },
  infoValue: { fontSize: 11, fontWeight: 'bold', color: '#FFFFFF' },
  contractor: { fontSize: 10, color: '#FFFFFF', marginTop: 8 },
  ansInfo: { fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 8, textAlign: 'right' },
});
```

### Step 6: Criar UnimedCardTemplate

```typescript
// mobile/src/screens/DigitalCard/components/UnimedCardTemplate.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { UnimedHeader } from '../../../components/cards/UnimedHeader';
import { UnimedBody } from '../../../components/cards/UnimedBody';
import { UnimedFooter } from '../../../components/cards/UnimedFooter';
import { extractUnimedCardData } from '../../../utils/cardUtils';
import type { OracleUnimed } from '../../../types/oracle';
import type { Beneficiary } from '../../../store/slices/authSlice';

const CARD_ASPECT_RATIO = 1.586;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UnimedCardTemplateProps {
  cardData: OracleUnimed;
  beneficiary: Beneficiary;
}

export function UnimedCardTemplate({ cardData, beneficiary }: UnimedCardTemplateProps) {
  const data = extractUnimedCardData(cardData, beneficiary);
  const cardWidth = SCREEN_WIDTH - 32;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  return (
    <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
      <UnimedHeader contractType={data.contractType} />
      <UnimedBody
        cardNumber={data.cardNumber}
        beneficiaryName={data.beneficiaryName}
        gridData={{
          accommodation: data.accommodation,
          validity: data.validity,
          planType: data.planType,
          networkCode: data.networkCode,
          coverage: data.coverage,
          serviceCode: data.serviceCode,
        }}
        assistanceSegmentation={data.assistanceSegmentation}
      />
      <UnimedFooter
        birthDate={data.birthDate}
        effectiveDate={data.effectiveDate}
        partialCoverage={data.partialCoverage}
        cardEdition={data.cardEdition}
        contractor={data.contractor}
        ansInfo={data.ansInfo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
```

### Step 7: Integrar no DigitalCardScreen

Em `mobile/src/screens/DigitalCard/DigitalCardScreen.tsx`, modificar a função `renderCard`:

```typescript
import { UnimedCardTemplate } from './components/UnimedCardTemplate';

// Na função renderCard, adicionar condição:
const renderCard = ({ item, index }) => {
  const cardType = item.type;

  // Template especial para Unimed
  if (cardType === 'UNIMED') {
    return (
      <UnimedCardTemplate
        cardData={item.data}
        beneficiary={beneficiary}
      />
    );
  }

  // Template genérico para outros tipos
  return (
    // ... código existente
  );
};
```

## Testing

```bash
# Executar testes
cd mobile && npm test

# Verificar tipos
npx tsc --noEmit
```

## Validation Checklist

- [ ] Cores correspondem à especificação (#00995D, #C4D668, #0B504B)
- [ ] Proporção do cartão é 1.586:1
- [ ] Border-radius apenas no topo e base
- [ ] Todos os campos exibidos corretamente
- [ ] Fallbacks funcionam para campos vazios
- [ ] Template renderiza apenas para cartões UNIMED
- [ ] Acessibilidade: touch targets 48dp, labels descritivos
- [ ] Performance: renderização < 100ms

## Common Issues

### Logos não aparecem
- Verificar se arquivos SVG estão em `assets/images/`
- Confirmar import correto com `react-native-svg`

### Cores incorretas
- Verificar se `theme.ts` foi atualizado
- Confirmar uso de `useColors()` hook

### Proporção distorcida
- Verificar cálculo de `cardHeight = cardWidth / CARD_ASPECT_RATIO`
- Confirmar que container pai não força altura fixa
