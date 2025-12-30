# Research: Template Carteirinha Digital Vivest

**Feature**: 009-vivest-card-template
**Date**: 2025-12-30
**Status**: Complete

## Research Topics

### 1. Animacao Flip Card em React Native

**Decision**: Usar `react-native-reanimated` com `rotateY` transform

**Rationale**:
- `react-native-reanimated` ja esta instalado no projeto (dependencia do Expo)
- Executa animacoes na UI thread, garantindo 60fps
- API declarativa com `useSharedValue` e `useAnimatedStyle`
- Melhor performance que Animated API nativa para transformacoes 3D

**Alternatives Considered**:
- `Animated` API nativa: Mais simples, mas roda na JS thread, pode causar jank
- `react-native-flip-card` package: Depreciado, sem manutencao ativa
- CSS 3D transforms via web: Nao aplicavel em React Native puro

**Implementation Pattern**:
```typescript
const rotation = useSharedValue(0);
const frontAnimatedStyle = useAnimatedStyle(() => ({
  transform: [{ rotateY: `${rotation.value}deg` }],
  backfaceVisibility: 'hidden',
}));
const backAnimatedStyle = useAnimatedStyle(() => ({
  transform: [{ rotateY: `${rotation.value + 180}deg` }],
  backfaceVisibility: 'hidden',
}));
```

---

### 2. Implementacao de Elementos Decorativos SVG

**Decision**: Usar `react-native-svg` com componente SVG inline

**Rationale**:
- `react-native-svg` ja disponivel via Expo
- SVG inline permite customizacao de cores via props
- Melhor escalabilidade que PNG para diferentes densidades de tela
- Permite animacao futura se necessario

**Alternatives Considered**:
- PNG/WebP images: Menos flexivel, multiplos arquivos para densidades
- CSS gradients: Limitado em React Native, nao suporta curvas complexas
- Canvas drawing: Overkill para graficos estaticos

**Implementation Pattern**:
```tsx
// VIVESTDecorativeLines.tsx
<Svg width={width} height={height}>
  <Path d="M..." fill="#FFFFFF" opacity={0.3} />
  <Path d="M..." fill="#CC0000" opacity={0.5} />
</Svg>
```

---

### 3. Logica de Renderizacao Condicional

**Decision**: Criar funcao utilitaria `isVIVESTEligible` em cardUtils.ts

**Rationale**:
- Centraliza logica de elegibilidade
- Facilita testes unitarios
- Reutilizavel em diferentes contextos
- Segue padrao existente (extractUnimedCardData, extractElosaúdeCardData)

**Alternatives Considered**:
- Inline condition no componente: Duplicacao, dificil manutencao
- Constante de planos no componente: Menos testavel
- Backend filter: Desnecessario, dados ja vem filtrados por beneficiario

**Eligible Plans List**:
```typescript
const VIVEST_ELIGIBLE_PLANS = [
  'ELOSAUDE EXECUTIVE - DIRETORES',
  'ELOSAUDE EXECUTIVE - GERENTES',
  'ELOSAUDE EXECUTIVE - DIRETORES - DIAMANTE',
  'ELOSAUDE EXECUTIVE - GERENTES - DIAMANTE',
  'ELOSAUDE EXECUTIVE - DIRETORES - PAMPA',
  'ELOSAUDE EXECUTIVE - GERENTES - PAMPA',
  'SAUDE MAIS',
  'SAUDE MAIS II',
];

export function isVIVESTEligible(card: OracleReciprocidade): boolean {
  return (
    card.PRESTADOR_RECIPROCIDADE === 'VIVEST' &&
    VIVEST_ELIGIBLE_PLANS.includes(card.PLANO_ELOSAUDE)
  );
}
```

---

### 4. Estrutura de Componentes

**Decision**: Seguir padrao existente (Header/Body/Footer) com adicao de FlipContainer

**Rationale**:
- Consistencia com UnimedCardTemplate e ElosaúdeCardTemplate
- Separacao de responsabilidades
- Facilita manutencao e testes
- Componentes reutilizaveis

**Component Hierarchy**:
```
VIVESTCardTemplate (flip container + state)
├── VIVESTCardFront
│   ├── VIVESTHeader (logo + plano box)
│   ├── VIVESTBodyFront (dados beneficiario)
│   └── VIVESTDecorativeLines (SVG overlay)
└── VIVESTCardBack
    ├── VIVESTHeader (titulo carencias + ANS tag)
    ├── VIVESTBodyBack (carencias + ANS + contatos)
    └── VIVESTDecorativeLines (SVG overlay)
```

---

### 5. Cores e Design Tokens

**Decision**: Definir constantes de cor no arquivo de tipos/componente

**Rationale**:
- Cores especificas do Vivest, nao reutilizaveis em outros templates
- Facilita ajustes de design
- Documentacao inline

**Color Palette**:
```typescript
export const VIVEST_COLORS = {
  primary: '#003366',      // Azul marinho profundo (fundo)
  primaryLight: '#004080', // Azul mais claro (box plano)
  accent: '#CC0000',       // Vermelho (linhas decorativas)
  text: '#FFFFFF',         // Branco (texto principal)
  textMuted: 'rgba(255, 255, 255, 0.7)', // Branco translucido (labels)
  tagBackground: '#1A1A1A', // Preto (tags ANS)
};
```

---

### 6. Acessibilidade

**Decision**: Implementar accessibilityLabel e accessibilityHint em todos os elementos interativos

**Rationale**:
- Constitution V exige acessibilidade para usuarios 35-65+
- Botao de flip deve ser anunciado pelo VoiceOver/TalkBack
- Estados frente/verso devem ser comunicados

**Implementation**:
```tsx
<TouchableOpacity
  onPress={handleFlip}
  accessibilityRole="button"
  accessibilityLabel={isFlipped ? "Voltar para frente" : "Ver verso"}
  accessibilityHint="Toque duas vezes para virar a carteirinha"
  style={styles.flipButton}
>
```

---

## Dependencies to Install

Nenhuma nova dependencia necessaria. Todas ja estao disponiveis:
- `react-native-reanimated`: ^3.x (via Expo)
- `react-native-svg`: ^13.x (via Expo)
- `react-native-gesture-handler`: ^2.x (via Expo)

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Qual biblioteca para animacao flip? | react-native-reanimated |
| Como implementar linhas decorativas? | SVG inline via react-native-svg |
| Onde colocar logica de elegibilidade? | cardUtils.ts com funcao isVIVESTEligible |
| Estrutura de componentes? | Header/Body(Front/Back)/DecorativeLines dentro de FlipContainer |
