# Research: Guia Médico por Tipo de Cartão

**Feature**: 012-guia-medico-links
**Date**: 2026-01-05

## Research Questions Resolved

### 1. Como identificar o tipo de cartão do usuário?

**Decision**: Usar a lógica já existente de detecção de tipo de cartão

**Rationale**: O sistema já possui funções de elegibilidade (`isVIVESTEligible`, `isELETROSEligible`, `isFACHESFEligible`) e campos de identificação (`_type`, `PRESTADOR_RECIPROCIDADE`).

**Implementation**:
```typescript
// Mapeamento de tipo para operadora
function getOperatorFromCard(card: CardData): OperatorType | null {
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
```

**Alternatives Considered**:
- Criar nova API para retornar operadoras: Rejeitado (dados já disponíveis)
- Hardcode por beneficiário: Rejeitado (não escalável)

---

### 2. Onde posicionar os links de Guia Médico na UX?

**Decision**: Substituir NetworkScreen existente + Botão contextual na carteirinha

**Rationale**: Conforme clarificação do usuário, a NetworkScreen existente (que faz busca interna de prestadores) será substituída por links externos dos portais de Guia Médico. A busca interna será removida.

**Implementation**:
1. **NetworkScreen substituída**: Remove toda a lógica de busca interna, exibe apenas cards das operadoras do usuário
2. **Botão contextual na carteirinha**: Cada template exibe um botão para acessar o guia daquela operadora

**Alternatives Considered**:
- Integrar no topo da NetworkScreen mantendo busca interna: Rejeitado pelo usuário
- Criar nova tela separada MedicalGuideScreen: Rejeitado pelo usuário
- **Substituir NetworkScreen removendo busca interna**: ACEITO

---

### 3. Como abrir links externos no React Native?

**Decision**: Usar `Linking.openURL()` do React Native

**Rationale**: API nativa e confiável para abrir URLs no navegador padrão do dispositivo.

**Implementation**:
```typescript
import { Linking } from 'react-native';

async function openMedicalGuide(url: string): Promise<void> {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    // Show error toast
  }
}
```

**Alternatives Considered**:
- WebView embutida: Rejeitado (complexidade desnecessária, alguns portais podem ter problemas)
- expo-web-browser: Considerado, mas `Linking` é suficiente

---

### 4. Como obter a lista de operadoras do usuário?

**Decision**: Derivar dos dados de cartões já carregados via `useOracleCards()`

**Rationale**: Os cartões já são carregados via hook existente. Basta extrair operadoras únicas.

**Implementation**:
```typescript
function getUserOperators(cards: CardData[]): OperatorType[] {
  const operators = new Set<OperatorType>();
  cards.forEach(card => {
    const operator = getOperatorFromCard(card);
    if (operator) operators.add(operator);
  });
  return Array.from(operators);
}
```

**Alternatives Considered**:
- Nova API endpoint: Rejeitado (dados já disponíveis no cliente)
- Cache local: Não necessário (dados voláteis)

---

### 5. Tratamento de operadoras sem link configurado

**Decision**: Ocultar operadoras sem URL configurada

**Rationale**: Melhor não mostrar nada do que mostrar um link quebrado.

**Implementation**:
```typescript
const MEDICAL_GUIDE_URLS: Record<OperatorType, string | null> = {
  FACHESF: 'https://s008.fachesf.com.br/ConsultaCredenciadosRedeAtendimento/',
  VIVEST: 'https://medhub.facilinformatica.com.br/provider-search',
  UNIMED: 'https://www.unimed.coop.br/site/web/guest/guia-medico#/',
  ELOSAUDE: 'https://webprod.elosaude.com.br/#/guia-medico',
  ELETROS: 'https://eletrossaude.com.br/rede-credenciada/',
};

// Só exibe se URL existir
if (MEDICAL_GUIDE_URLS[operator]) {
  // render card
}
```

---

### 6. O que acontece com a busca interna de prestadores?

**Decision**: Remover completamente

**Rationale**: Conforme clarificação do usuário, a NetworkScreen será substituída. A busca interna via `useGetProvidersQuery` e todos os filtros serão removidos.

**What will be removed from NetworkScreen**:
- `useGetProvidersQuery` hook
- Search bar (`Searchbar` component)
- Specialty filter chips
- Provider list (`FlatList` with `renderProvider`)
- `ProviderDetailScreen` navigation
- All provider-related state and handlers

**What will be added**:
- `useOracleCards` hook para obter cartões do usuário
- Grid/lista de cards das operadoras
- Empty state para usuário sem cartões
- `Linking.openURL` para abrir portais externos

---

## Technology Best Practices Applied

### React Native Paper Cards

- Usar `Card` component com `Card.Cover` para logo da operadora
- `Card.Title` para nome da operadora
- `Card.Actions` com botão para abrir link
- Cores temáticas por operadora

### Acessibilidade

- `accessibilityLabel` descritivo: "Abrir Guia Médico da {operadora}"
- `accessibilityRole="link"` para indicar navegação externa
- Touch target mínimo de 48x48dp

### Performance

- URLs configurados como constantes (não precisa fetch)
- `Linking.canOpenURL` é rápido (< 100ms)
- Sem loading state complexo necessário

## Conclusion

Todas as questões técnicas foram resolvidas. A implementação deve:
1. Substituir completamente a NetworkScreen
2. Remover busca interna de prestadores
3. Exibir cards das operadoras baseado nos cartões do usuário
4. Adicionar botão contextual nos templates de carteirinha
