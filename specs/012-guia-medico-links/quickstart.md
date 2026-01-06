# Quickstart: Guia Médico por Tipo de Cartão

**Feature**: 012-guia-medico-links
**Branch**: `012-guia-medico-links`

## Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator ou Android Emulator
- Acesso à API Oracle (beneficiário com cartões ativos)

## Setup

```bash
# 1. Checkout da branch
git checkout 012-guia-medico-links

# 2. Instalar dependências
cd mobile
npm install

# 3. Iniciar Expo
npx expo start
```

## Files to Create/Modify

### 1. NEW: `mobile/src/types/medicalGuide.ts`

```typescript
export type OperatorType =
  | 'FACHESF'
  | 'VIVEST'
  | 'UNIMED'
  | 'ELOSAUDE'
  | 'ELETROS';

export interface MedicalGuideConfig {
  operator: OperatorType;
  name: string;
  url: string;
  icon: string;
  color: string;
}
```

### 2. NEW: `mobile/src/config/medicalGuides.ts`

```typescript
import type { OperatorType, MedicalGuideConfig } from '../types/medicalGuide';

export const MEDICAL_GUIDE_CONFIGS: Record<OperatorType, MedicalGuideConfig> = {
  FACHESF: {
    operator: 'FACHESF',
    name: 'Fachesf',
    url: 'https://s008.fachesf.com.br/ConsultaCredenciadosRedeAtendimento/',
    icon: 'hospital-building',
    color: '#00B894',
  },
  VIVEST: {
    operator: 'VIVEST',
    name: 'Vivest',
    url: 'https://medhub.facilinformatica.com.br/provider-search',
    icon: 'hospital-building',
    color: '#0066CC',
  },
  UNIMED: {
    operator: 'UNIMED',
    name: 'Unimed',
    url: 'https://www.unimed.coop.br/site/web/guest/guia-medico#/',
    icon: 'hospital-building',
    color: '#00A651',
  },
  ELOSAUDE: {
    operator: 'ELOSAUDE',
    name: 'Elosaúde',
    url: 'https://webprod.elosaude.com.br/#/guia-medico',
    icon: 'hospital-building',
    color: '#1A73E8',
  },
  ELETROS: {
    operator: 'ELETROS',
    name: 'Eletrossaúde',
    url: 'https://eletrossaude.com.br/rede-credenciada/',
    icon: 'hospital-building',
    color: '#FF6B00',
  },
};

export function getMedicalGuideConfig(operator: OperatorType): MedicalGuideConfig | null {
  return MEDICAL_GUIDE_CONFIGS[operator] || null;
}
```

### 3. MODIFY: `mobile/src/utils/cardUtils.ts`

Add these helper functions:

```typescript
import type { OperatorType } from '../types/medicalGuide';

export function getOperatorFromCard(card: {
  _type: string;
  PRESTADOR_RECIPROCIDADE?: string;
}): OperatorType | null {
  if (card._type === 'CARTEIRINHA') return 'ELOSAUDE';
  if (card._type === 'UNIMED') return 'UNIMED';
  if (card._type === 'RECIPROCIDADE') {
    const prestador = card.PRESTADOR_RECIPROCIDADE?.toUpperCase();
    if (prestador === 'FACHESF') return 'FACHESF';
    if (prestador === 'VIVEST') return 'VIVEST';
    if (prestador === 'ELETROS') return 'ELETROS';
  }
  return null;
}

export function getUserOperators(cards: Array<{ _type: string; PRESTADOR_RECIPROCIDADE?: string }>): OperatorType[] {
  const operators = new Set<OperatorType>();
  cards.forEach(card => {
    const operator = getOperatorFromCard(card);
    if (operator) operators.add(operator);
  });
  return Array.from(operators);
}
```

### 4. REPLACE: `mobile/src/screens/Network/NetworkScreen.tsx`

Complete rewrite - remove internal provider search, show operator cards:

```typescript
import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Card, Title, Text, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useOracleCards } from '../../hooks/useOracleCards';
import { getUserOperators } from '../../utils/cardUtils';
import { MEDICAL_GUIDE_CONFIGS } from '../../config/medicalGuides';
import type { OperatorType } from '../../types/medicalGuide';

const NetworkScreen = () => {
  const { data: oracleCards, isLoading } = useOracleCards();

  // Get all cards and extract unique operators
  const allCards = oracleCards ? [
    ...oracleCards.carteirinha.map(c => ({ ...c, _type: 'CARTEIRINHA' })),
    ...oracleCards.unimed.map(c => ({ ...c, _type: 'UNIMED' })),
    ...oracleCards.reciprocidade.map(c => ({ ...c, _type: 'RECIPROCIDADE' })),
  ] : [];

  const userOperators = getUserOperators(allCards);

  const handleOpenGuide = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#20a490" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (userOperators.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="hospital-building" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Nenhum cartão ativo</Text>
        <Text style={styles.emptySubtext}>
          Você não possui cartões ativos para acessar guias médicos
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Guia Médico</Text>
      <Text style={styles.subheader}>
        Acesse a rede credenciada do seu plano
      </Text>

      {userOperators.map((operator: OperatorType) => {
        const config = MEDICAL_GUIDE_CONFIGS[operator];
        return (
          <Card
            key={operator}
            style={[styles.card, { borderLeftColor: config.color }]}
            onPress={() => handleOpenGuide(config.url)}
            accessibilityLabel={`Abrir Guia Médico ${config.name}`}
            accessibilityRole="link"
          >
            <Card.Content style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                <Icon name={config.icon} size={32} color={config.color} />
              </View>
              <View style={styles.textContainer}>
                <Title style={styles.cardTitle}>{config.name}</Title>
                <Text style={styles.cardSubtitle}>Rede Credenciada</Text>
              </View>
              <Icon name="open-in-new" size={24} color="#666" />
            </Card.Content>
          </Card>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subheader: { fontSize: 14, color: '#666', marginBottom: 24 },
  card: { marginBottom: 16, borderLeftWidth: 4 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 18, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#666' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  emptyText: { marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#999' },
  emptySubtext: { marginTop: 8, fontSize: 14, color: '#999', textAlign: 'center' },
});

export default NetworkScreen;
```

## Testing

### Manual Test Cases

1. **Usuário com 1 cartão**:
   - Login com CPF que possui apenas cartão Fachesf
   - Acessar aba "Rede"
   - Verificar que apenas card Fachesf aparece
   - Clicar no card deve abrir o portal externo

2. **Usuário com múltiplos cartões**:
   - Login com CPF que possui cartões de várias operadoras
   - Acessar aba "Rede"
   - Verificar que todos os cards relevantes aparecem
   - Cada card abre o portal correto

3. **Usuário sem cartões**:
   - Login com CPF sem cartões ativos
   - Acessar aba "Rede"
   - Verificar mensagem "Nenhum cartão ativo"

### Test Accounts

| CPF | Operadoras |
|-----|------------|
| 82111111791 | FACHESF |
| 98337874953 | VIVEST, ELOSAUDE |
| 11511605634 | ELETROS |

## Validation Checklist

- [ ] URLs abrem corretamente no navegador
- [ ] Apenas operadoras do usuário são exibidas
- [ ] Cards têm tamanho mínimo de 48x48dp para touch
- [ ] Mensagem apropriada quando sem cartões
- [ ] Busca interna de prestadores foi removida
- [ ] Funciona em iOS e Android
