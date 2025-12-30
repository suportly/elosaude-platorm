# Research: Template Carteirinha Digital Eletros-Saude

**Feature**: 010-eletros-card-template
**Date**: 2025-12-30
**Status**: Complete

## Research Topics

### 1. Implementacao de Header Curvo com SVG

**Decision**: Usar `react-native-svg` com `Path` para criar curva suave no header

**Rationale**:
- `clip-path` CSS nao e bem suportado em React Native
- SVG Path permite controle preciso da curva bezier
- `react-native-svg` ja esta instalado no projeto (via Expo)
- Permite customizacao de cores e gradientes

**Alternatives Considered**:
- `border-bottom-left-radius` / `border-bottom-right-radius`: Nao cria curva suave como no design
- `overflow: hidden` com View posicionada: Menos controle, problemas de rendering
- Imagem PNG com curva: Menos flexivel, problemas de escala

**Implementation Pattern**:
```tsx
// ELETROSCurvedBackground.tsx
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export function ELETROSCurvedBackground({ width, height }: Props) {
  // Curva ocupando ~35% da altura
  const curveHeight = height * 0.35;
  const curveY = curveHeight * 0.85; // Ponto onde a curva termina

  return (
    <Svg width={width} height={curveHeight} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="headerGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#2E7D87" />
          <Stop offset="1" stopColor="#4DA8B3" />
        </LinearGradient>
      </Defs>
      <Path
        d={`M0,0 L${width},0 L${width},${curveY} Q${width*0.5},${curveHeight} 0,${curveY} Z`}
        fill="url(#headerGradient)"
      />
    </Svg>
  );
}
```

---

### 2. Logo Eletros-Saude em SVG

**Decision**: Criar componente SVG com duas variantes (branca e colorida)

**Rationale**:
- Logo consiste em icone de cruz medica + texto "Eletros-Saude"
- Versao branca para header azul (frente)
- Versao colorida (verde/cinza) para header branco (verso)
- SVG inline permite troca de cores via props

**Alternatives Considered**:
- PNG em duas versoes: Multiplos arquivos, problemas de escala
- Fonte icon: Nao aplicavel para logo completo
- WebView SVG: Overhead desnecessario

**Implementation Pattern**:
```tsx
// ELETROSLogo.tsx
interface ELETROSLogoProps {
  variant: 'white' | 'colored';
  width?: number;
  height?: number;
}

export function ELETROSLogo({ variant, width = 150, height = 40 }: ELETROSLogoProps) {
  const iconColor = variant === 'white' ? '#FFFFFF' : '#2E7D87';
  const textColor = variant === 'white' ? '#FFFFFF' : '#4A4A4A';
  const saudeColor = variant === 'white' ? '#FFFFFF' : '#4CAF50';

  return (
    <Svg width={width} height={height} viewBox="0 0 150 40">
      {/* Cruz medica */}
      <G fill={iconColor}>
        <Rect x="8" y="4" width="8" height="24" rx="2" />
        <Rect x="0" y="10" width="24" height="8" rx="2" />
      </G>
      {/* Texto "Eletros" */}
      <SvgText x="32" y="22" fill={textColor} fontSize="16" fontWeight="bold">
        Eletros-
      </SvgText>
      {/* Texto "Saude" */}
      <SvgText x="95" y="22" fill={saudeColor} fontSize="16" fontWeight="bold">
        Saude
      </SvgText>
    </Svg>
  );
}
```

---

### 3. Animacao Flip Card (Reutilizacao Vivest)

**Decision**: Reutilizar padrao de animacao flip do VIVESTCardTemplate

**Rationale**:
- Mesmo padrao ja implementado e testado no projeto
- Consistencia de UX entre templates
- `react-native-reanimated` ja configurado
- Performance comprovada (60fps)

**Implementation Reference**: Ver `VIVESTCardTemplate.tsx`

```typescript
const rotation = useSharedValue(0);
const frontAnimatedStyle = useAnimatedStyle(() => ({
  transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` }],
  backfaceVisibility: 'hidden',
}));
const backAnimatedStyle = useAnimatedStyle(() => ({
  transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
  backfaceVisibility: 'hidden',
}));
```

---

### 4. Logica de Renderizacao Condicional

**Decision**: Criar funcao utilitaria `isELETROSEligible` em cardUtils.ts

**Rationale**:
- Centraliza logica de elegibilidade
- Segue padrao existente (isVIVESTEligible, isUnimedEligible)
- Facilita testes unitarios
- Condicao simples: apenas `PRESTADOR_RECIPROCIDADE = 'ELETROS'`

**Implementation Pattern**:
```typescript
export function isELETROSEligible(card: OracleReciprocidade): boolean {
  return card.PRESTADOR_RECIPROCIDADE === 'ELETROS';
}
```

---

### 5. Campos com Destaque Vermelho

**Decision**: Usar View com `borderColor` vermelho e `borderWidth` para campos destacados

**Rationale**:
- Design mostra campos de matricula, nome e datas com borda vermelha
- Solucao simples com StyleSheet nativo
- Nao requer SVG adicional

**Implementation Pattern**:
```tsx
const styles = StyleSheet.create({
  highlightedField: {
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 4,
    padding: Spacing.sm,
    backgroundColor: 'transparent',
  },
  highlightedValue: {
    color: '#E53935',
    fontWeight: 'bold',
  },
});
```

---

### 6. Tag ANS com Caixa Preta

**Decision**: View com background preto, borda branca, texto branco

**Rationale**:
- Design consistente com imagem de referencia
- Componente reutilizavel para frente e verso
- Texto fixo: "ANS - No 42.207-0"

**Implementation Pattern**:
```tsx
function ANSTag() {
  return (
    <View style={styles.ansTag}>
      <Text style={styles.ansTagText}>ANS - No 42.207-0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ansTag: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ansTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});
```

---

### 7. Linha Divisoria Verde (Verso)

**Decision**: View com `height: 2` e `backgroundColor: #4CAF50`

**Rationale**:
- Simples implementacao nativa
- Nao requer SVG
- Cor verde consistente com logo colorido

**Implementation Pattern**:
```tsx
<View style={styles.greenDivider} />

const styles = StyleSheet.create({
  greenDivider: {
    height: 2,
    backgroundColor: '#4CAF50',
    width: '100%',
  },
});
```

---

### 8. Cores e Design Tokens

**Decision**: Definir constantes de cor no arquivo de tipos `eletros.ts`

**Color Palette** (baseada na imagem de referencia):
```typescript
export const ELETROS_COLORS = {
  // Header (Frente)
  headerGradientStart: '#2E7D87',  // Azul/verde escuro
  headerGradientEnd: '#4DA8B3',    // Azul/verde claro

  // Textos
  textWhite: '#FFFFFF',
  textDark: '#333333',
  textGray: '#666666',

  // Destaques
  highlightRed: '#E53935',         // Vermelho para campos destacados
  dividerGreen: '#4CAF50',         // Verde para divisor e logo

  // Tags
  ansTagBackground: '#000000',
  ansTagBorder: '#FFFFFF',

  // Backgrounds
  cardBackground: '#FFFFFF',
} as const;
```

---

### 9. Estrutura de Componentes

**Decision**: Seguir padrao estabelecido (Header/Body/Background) adaptado para design Eletros

**Component Hierarchy**:
```
ELETROSCardTemplate (flip container + state)
├── ELETROSCardFront
│   ├── ELETROSCurvedBackground (SVG header curvo)
│   ├── ELETROSHeader variant="front" (logo branco + ANS tag)
│   └── ELETROSBodyFront (identificacao, grid 3 colunas, texto legal)
└── ELETROSCardBack
    ├── ELETROSHeader variant="back" (logo colorido + ANS tag)
    ├── GreenDivider
    └── ELETROSBodyBack (segmentacao, contatos, nota intransferibilidade)
```

---

### 10. Acessibilidade

**Decision**: Implementar accessibilityLabel e accessibilityHint em todos os elementos interativos

**Rationale**:
- Constitution V exige acessibilidade para usuarios 35-65+
- Botao de flip deve ser anunciado pelo VoiceOver/TalkBack
- Contraste branco/azul no header e preto/branco no corpo e adequado

**Implementation**:
```tsx
<TouchableOpacity
  onPress={handleFlip}
  accessibilityRole="button"
  accessibilityLabel={isFlipped ? "Ver frente da carteirinha" : "Ver verso da carteirinha"}
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
| Como implementar header curvo? | SVG Path com curva bezier quadratica |
| Como criar logo Eletros-Saude? | Componente SVG com duas variantes (white/colored) |
| Condicao de elegibilidade? | `PRESTADOR_RECIPROCIDADE === 'ELETROS'` |
| Como destacar campos? | borderColor vermelho (#E53935) |
| Estrutura de componentes? | Seguir padrao Vivest com adaptacoes para design Eletros |
