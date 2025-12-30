# Quickstart: Template Carteirinha Digital Vivest

**Feature**: 009-vivest-card-template
**Date**: 2025-12-30

## Prerequisites

- Node.js 18+
- Expo CLI instalado (`npm install -g expo-cli`)
- Ambiente mobile configurado (iOS Simulator ou Android Emulator)
- Acesso ao repositorio elosaude-platform

## Setup

```bash
# Clone e navegue para o projeto
cd /home/alairjt/workspace/elosaude-platform

# Checkout da branch
git checkout 009-vivest-card-template

# Instale dependencias do mobile
cd mobile
npm install

# Inicie o Expo
npx expo start
```

## Estrutura de Arquivos a Criar

```
mobile/src/
├── types/
│   └── vivest.ts                        # Tipos e interfaces
├── components/cards/
│   ├── VIVESTHeader.tsx                 # Header (logo + plano box)
│   ├── VIVESTBodyFront.tsx              # Corpo frontal
│   ├── VIVESTBodyBack.tsx               # Corpo verso
│   └── VIVESTDecorativeLines.tsx        # SVG decorativo
├── screens/DigitalCard/components/
│   └── VIVESTCardTemplate.tsx           # Template principal com flip
└── utils/
    └── cardUtils.ts                     # Adicionar funcoes utilitarias
```

## Ordem de Implementacao

### 1. Tipos (vivest.ts)

Criar os tipos conforme [data-model.md](./data-model.md):
- `VIVESTCardData`
- `VIVESTCardTemplateProps`
- `VIVESTHeaderProps`, `VIVESTBodyFrontProps`, `VIVESTBodyBackProps`
- Constantes: `VIVEST_ELIGIBLE_PLANS`, `VIVEST_COLORS`, `VIVEST_STATIC_INFO`

### 2. Funcoes Utilitarias (cardUtils.ts)

Adicionar ao arquivo existente:

```typescript
import { VIVEST_ELIGIBLE_PLANS, VIVESTCardData, VIVEST_STATIC_INFO } from '../types/vivest';

export function isVIVESTEligible(card: OracleReciprocidade): boolean {
  return (
    card.PRESTADOR_RECIPROCIDADE === 'VIVEST' &&
    VIVEST_ELIGIBLE_PLANS.includes(card.PLANO_ELOSAUDE as any)
  );
}

export function extractVIVESTCardData(
  oracleData: OracleReciprocidade,
  beneficiary: { ... }
): VIVESTCardData {
  // Implementar transformacao
}
```

### 3. Componentes Visuais

#### VIVESTDecorativeLines.tsx
```typescript
// SVG com linhas curvas brancas e vermelhas
import Svg, { Path } from 'react-native-svg';
```

#### VIVESTHeader.tsx
```typescript
// Duas variantes: front (logo + plano) e back (titulo + ANS tag)
```

#### VIVESTBodyFront.tsx
```typescript
// Grid de informacoes do beneficiario
// Value em destaque, label abaixo
```

#### VIVESTBodyBack.tsx
```typescript
// Carencias, ANS, CNS e contatos
```

### 4. Template Principal (VIVESTCardTemplate.tsx)

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export function VIVESTCardTemplate({ cardData, beneficiary }: Props) {
  const rotation = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    rotation.value = withTiming(isFlipped ? 0 : 180, { duration: 400 });
    setIsFlipped(!isFlipped);
  };

  // ... render front and back with animated styles
}
```

### 5. Integracao no DigitalCardScreen.tsx

Adicionar condicao de renderizacao:

```typescript
import { VIVESTCardTemplate } from './components/VIVESTCardTemplate';
import { isVIVESTEligible } from '../../utils/cardUtils';

// Na funcao DigitalCard:
if (cardType === 'RECIPROCIDADE' && isVIVESTEligible(item)) {
  return (
    <VIVESTCardTemplate
      cardData={item}
      beneficiary={beneficiary}
    />
  );
}
```

## Testando

### Dados de Teste

Para testar sem backend, crie mock data:

```typescript
const mockVIVESTCard: OracleReciprocidade = {
  CD_MATRICULA_RECIPROCIDADE: '123456789012',
  PRESTADOR_RECIPROCIDADE: 'VIVEST',
  DT_VALIDADE_CARTEIRA: '2025-12-31',
  PLANO_ELOSAUDE: 'ELOSAUDE EXECUTIVE - DIRETORES',
  NOME_BENEFICIARIO: 'MARIA SILVA SANTOS',
  DT_NASCIMENTO: '1975-05-20',
  NR_CPF: 12345678900,
  SN_ATIVO: 'S',
};
```

### Verificacoes

- [ ] Cartao exibe cores corretas (#003366 fundo)
- [ ] Logo Vivest visivel no header
- [ ] Dados do beneficiario corretos
- [ ] Animacao de flip funciona (<400ms)
- [ ] Verso exibe carencias e contatos
- [ ] Botao de flip tem 48x48dp minimo
- [ ] Texto acessivel via VoiceOver/TalkBack

## Recursos

- [Spec](./spec.md) - Especificacao funcional
- [Research](./research.md) - Decisoes tecnicas
- [Data Model](./data-model.md) - Tipos e interfaces
- [Contracts](./contracts/README.md) - APIs utilizadas

## Troubleshooting

### Animacao de flip com jank
- Verificar se `react-native-reanimated` esta no plugin babel
- Usar `runOnJS` apenas quando necessario

### SVG nao renderiza
- Verificar import do `react-native-svg`
- Confirmar que viewBox esta correto

### Cartao Vivest nao aparece
- Verificar se `PRESTADOR_RECIPROCIDADE` e exatamente 'VIVEST'
- Confirmar que `PLANO_ELOSAUDE` esta na lista de elegiveis
