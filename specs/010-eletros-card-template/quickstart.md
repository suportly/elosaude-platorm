# Quickstart: Template Carteirinha Digital Eletros-Saude

**Feature**: 010-eletros-card-template
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
git checkout 010-eletros-card-template

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
│   └── eletros.ts                        # Tipos e interfaces
├── components/cards/
│   ├── ELETROSHeader.tsx                 # Header (logo + ANS tag)
│   ├── ELETROSBodyFront.tsx              # Corpo frontal (identificacao, grid)
│   ├── ELETROSBodyBack.tsx               # Corpo verso (dados tecnicos, contatos)
│   ├── ELETROSCurvedBackground.tsx       # SVG header curvo azul
│   └── ELETROSLogo.tsx                   # Logo SVG (versao branca e colorida)
├── screens/DigitalCard/components/
│   └── ELETROSCardTemplate.tsx           # Template principal com flip
└── utils/
    └── cardUtils.ts                      # Adicionar funcoes utilitarias
```

## Ordem de Implementacao

### 1. Tipos (eletros.ts)

Criar os tipos conforme [data-model.md](./data-model.md):
- `ELETROSCardData`
- `ELETROSCardTemplateProps`
- `ELETROSHeaderProps`, `ELETROSBodyFrontProps`, `ELETROSBodyBackProps`
- Constantes: `ELETROS_COLORS`, `ELETROS_STATIC_INFO`

### 2. Funcoes Utilitarias (cardUtils.ts)

Adicionar ao arquivo existente:

```typescript
import { ELETROSCardData, ELETROS_STATIC_INFO } from '../types/eletros';

export function isELETROSEligible(card: OracleReciprocidade): boolean {
  return card.PRESTADOR_RECIPROCIDADE === 'ELETROS';
}

export function extractELETROSCardData(
  oracleData: OracleReciprocidade,
  beneficiary: { full_name: string; birth_date?: string }
): ELETROSCardData {
  // Implementar transformacao conforme data-model.md
}
```

### 3. Componentes Visuais

#### ELETROSLogo.tsx
```typescript
// Logo SVG com duas variantes (white e colored)
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';

export function ELETROSLogo({ variant, width = 150, height = 40 }: Props) {
  const iconColor = variant === 'white' ? '#FFFFFF' : '#2E7D87';
  // ... implementar SVG
}
```

#### ELETROSCurvedBackground.tsx
```typescript
// SVG com path curvo para header da frente
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export function ELETROSCurvedBackground({ width, height }: Props) {
  const curveHeight = height * 0.35;
  // ... implementar curva bezier
}
```

#### ELETROSHeader.tsx
```typescript
// Duas variantes: front (sobre curva azul) e back (fundo branco)
// Inclui logo + ANS tag em caixa preta
```

#### ELETROSBodyFront.tsx
```typescript
// Identificacao do usuario
// - Label "Identificacao do usuario"
// - Matricula Reciprocidade (box vermelho)
// - Nome Completo (box vermelho)
// Grid 3 colunas: Nascimento | Validade | Plano
// Texto legal em italico
```

#### ELETROSBodyBack.tsx
```typescript
// Lista de dados tecnicos (bold label + valor)
// - Segmentacao Assistencial do Plano
// - Padrao de Acomodacao
// - Area de Abrangencia Geografia
// - Tipo de Contratacao
// - Vida UTI Movel | CPT
// Bloco de contatos
// Nota de intransferibilidade
```

### 4. Template Principal (ELETROSCardTemplate.tsx)

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

export function ELETROSCardTemplate({ cardData, beneficiary }: Props) {
  const rotation = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    rotation.value = withTiming(isFlipped ? 0 : 180, { duration: 400 });
    setIsFlipped(!isFlipped);
  };

  // ... render front and back with animated styles
  // Seguir padrao do VIVESTCardTemplate
}
```

### 5. Integracao no DigitalCardScreen.tsx

Adicionar condicao de renderizacao:

```typescript
import { ELETROSCardTemplate } from './components/ELETROSCardTemplate';
import { isELETROSEligible } from '../../utils/cardUtils';

// Na funcao de renderizacao:
if (cardType === 'RECIPROCIDADE' && isELETROSEligible(item)) {
  return (
    <ELETROSCardTemplate
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
const mockELETROSCard: OracleReciprocidade = {
  CD_MATRICULA_RECIPROCIDADE: '123456789012',
  PRESTADOR_RECIPROCIDADE: 'ELETROS',
  DT_VALIDADE_CARTEIRA: '2025-12-31',
  PLANO_ELOSAUDE: 'RECIPROCIDADE ES ELOSAUDE',
  NOME_BENEFICIARIO: 'MARIA SILVA SANTOS',
  DT_NASCIMENTO: '1975-05-20',
  NR_CPF: 12345678900,
  SN_ATIVO: 'S',
  SEGMENTACAO_PLANO: 'AMBULATORIAL MAIS HOSPITALAR COM OBSTETRICIA',
  ACOMODACAO: 'APARTAMENTO STANDARD',
  ABRANGENCIA: 'ESTADUAL',
  TIPO_CONTRATACAO: 'OUTROS',
  UTI_MOVEL: 'N',
  CPT: 'NAO HA',
};
```

### Verificacoes

- [ ] Header curvo azul renderiza corretamente (~35% altura)
- [ ] Logo Eletros-Saude visivel (branco na frente, colorido no verso)
- [ ] Tag ANS em caixa preta com borda branca
- [ ] Campos de identificacao com borda vermelha
- [ ] Grid 3 colunas alinhado corretamente
- [ ] Texto legal em italico no rodape frontal
- [ ] Linha divisoria verde no verso
- [ ] Lista de dados tecnicos com labels bold
- [ ] Bloco de contatos legivel
- [ ] Nota de intransferibilidade presente
- [ ] Animacao de flip funciona (<500ms)
- [ ] Botao de flip tem 48x48dp minimo
- [ ] Texto acessivel via VoiceOver/TalkBack

## Recursos

- [Spec](./spec.md) - Especificacao funcional
- [Research](./research.md) - Decisoes tecnicas
- [Data Model](./data-model.md) - Tipos e interfaces
- [Plan](./plan.md) - Plano de implementacao

## Troubleshooting

### Header curvo nao aparece
- Verificar se `react-native-svg` esta importado corretamente
- Confirmar que viewBox e dimensoes estao corretas
- Testar Path SVG isoladamente

### Animacao de flip com jank
- Verificar se `react-native-reanimated` esta no plugin babel
- Usar `runOnJS` apenas quando necessario
- Confirmar perspectiva de 1000

### Logo SVG nao renderiza
- Verificar imports de `react-native-svg` (Svg, G, Rect, Text)
- Para Text, usar `Text as SvgText` para evitar conflito

### Cartao Eletros-Saude nao aparece
- Verificar se `PRESTADOR_RECIPROCIDADE` e exatamente 'ELETROS'
- Confirmar que funcao `isELETROSEligible` esta sendo chamada

### Bordas vermelhas nao aparecem
- Verificar `borderColor` e `borderWidth` no StyleSheet
- Confirmar que View do campo tem as propriedades de borda
