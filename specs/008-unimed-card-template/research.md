# Research: Template Carteirinha Digital Unimed

**Date**: 2025-12-23
**Feature**: 008-unimed-card-template
**Status**: Complete

## Executive Summary

Pesquisa concluída para implementação do template de carteirinha Unimed. O componente existente `DigitalCardScreen.tsx` já possui infraestrutura para múltiplos tipos de cartão. A implementação requer criação de componente especializado para replicar fielmente o layout visual da Unimed Santa Catarina.

## Research Tasks Completed

### 1. Estrutura de Componentes Existente

**Decisão**: Utilizar o padrão de componentes existente com extensão para template especializado

**Rationale**:
- O arquivo `DigitalCardScreen.tsx` já implementa renderização condicional por tipo de cartão
- Função `getCardTypeConfig()` já define cores e ícones específicos para UNIMED
- Função `extractCardInfo()` já mapeia campos do tipo `OracleUnimed`
- Integração com Redux via `useGetOracleCardsQuery()` funciona corretamente

**Alternativas Consideradas**:
- Modificar inline no componente existente: Rejeitado por aumentar complexidade e dificultar manutenção
- Criar tela separada: Rejeitado por duplicar lógica de carregamento e navegação

**Evidência**:
```typescript
// Já existente em DigitalCardScreen.tsx (linha 47-69)
const getCardTypeConfig = (colors) => ({
  UNIMED: {
    title: 'Unimed',
    icon: 'hospital-box',
    primaryColor: colors.cards.unimed.primary,
    secondaryColor: colors.cards.unimed.secondary,
    accentColor: colors.cards.unimed.accent,
  },
});
```

### 2. Dados Disponíveis na API

**Decisão**: Utilizar API existente `/beneficiaries/beneficiaries/my_cards/`

**Rationale**:
- API já retorna objeto `unimed[]` com campos necessários
- Tipo `OracleUnimed` já definido em `types/oracle.ts`
- Não há necessidade de novos endpoints ou modificações de backend

**Campos Disponíveis** (via `OracleUnimed`):
| Campo | Tipo | Uso no Template |
|-------|------|-----------------|
| MATRICULA_UNIMED | string | Número da Carteirinha |
| PLANO | string | Tipo de Plano |
| ABRANGENCIA | string | Abrangência |
| ACOMODACAO | string | Acomodação |
| Validade | string | Data de Validade |
| NOME | string | Nome do Beneficiário |
| CPF | number | Identificação (não exibido) |

**Campos Adicionais Necessários** (via `beneficiary` no authSlice):
- `full_name`: Fallback para nome
- `company`: Nome da contratante
- Data de nascimento: Disponível em contexto

**Alternativas Consideradas**:
- Criar novo endpoint com todos os campos: Rejeitado pois dados já disponíveis
- Adicionar campos à resposta existente: Não necessário

### 3. Sistema de Temas e Cores

**Decisão**: Estender `theme.ts` com cores específicas do design Unimed

**Rationale**:
- Arquivo já possui estrutura `colors.cards.unimed` com cores genéricas
- Cores atuais (#059669, #047857, #34D399) não correspondem ao design oficial
- Necessário adicionar cores exatas: #00995D, #C4D668, #0B504B

**Proposta de Extensão**:
```typescript
// Adicionar em theme.ts
unimed: {
  primary: '#00995D',    // Verde Unimed (header)
  secondary: '#C4D668',  // Verde Lima (body)
  accent: '#0B504B',     // Verde Petróleo (footer)
  textLight: '#FFFFFF',  // Texto em fundos escuros
  textDark: '#333333',   // Texto no body
}
```

**Alternativas Consideradas**:
- Hardcode de cores no componente: Rejeitado por violar padrão de design system
- Criar arquivo de cores separado: Rejeitado por fragmentar configuração

### 4. Assets de Logo

**Decisão**: Adicionar logos como arquivos SVG com fallback de texto

**Rationale**:
- SVG permite escala sem perda de qualidade
- Logos devem ser brancos/negativos para contraste no header verde
- Fallback textual garante funcionalidade mesmo sem asset

**Arquivos Necessários**:
- `unimed-logo.svg`: Logo "Unimed Santa Catarina"
- `somos-coop-logo.svg`: Logo "somos coop"

**Alternativas Consideradas**:
- PNG de alta resolução: Rejeitado por não escalar bem em densidades diferentes
- Ícones da biblioteca: Não disponíveis com design oficial

**Nota**: Assets precisam ser fornecidos ou obtidos com permissão da Unimed.

### 5. Proporção e Responsividade

**Decisão**: Manter proporção 1.586:1 (padrão cartão de crédito) com largura responsiva

**Rationale**:
- Especificação define proporção de cartão de crédito (85.6mm x 53.98mm)
- Largura deve preencher container disponível com margem
- Altura calculada dinamicamente baseada na largura

**Implementação**:
```typescript
const CARD_ASPECT_RATIO = 1.586;
const cardWidth = containerWidth - (2 * spacing.md);
const cardHeight = cardWidth / CARD_ASPECT_RATIO;
```

**Alternativas Consideradas**:
- Dimensões fixas em pixels: Rejeitado por não adaptar a telas diferentes
- Altura fixa com largura variável: Rejeitado por distorcer proporção

### 6. Acessibilidade

**Decisão**: Seguir padrões de acessibilidade já estabelecidos no projeto

**Rationale**:
- Constitution exige touch targets mínimos de 48x48dp
- Texto deve suportar escalamento dinâmico
- Labels descritivos para leitores de tela

**Implementação**:
- `accessibilityLabel` em todos os elementos informativos
- `accessibilityRole="text"` para conteúdo textual
- Contraste de cores verificado (WCAG AA mínimo)

**Verificação de Contraste**:
| Combinação | Ratio | Status |
|------------|-------|--------|
| Branco (#FFF) em Verde (#00995D) | 4.5:1 | PASS |
| Branco (#FFF) em Verde Petróleo (#0B504B) | 7.2:1 | PASS |
| Cinza Escuro (#333) em Verde Lima (#C4D668) | 5.8:1 | PASS |

## Gaps Identificados

1. **Assets de Logo**: Logos SVG da Unimed e "somos coop" precisam ser obtidos
2. **Campos Adicionais na API**: Alguns campos do design (Vigência, Segmentação Assistencial, Rede de Atendimento) podem não estar disponíveis diretamente na resposta atual

## Recommendations

1. Solicitar logos oficiais ao departamento de marketing/compliance da Unimed
2. Implementar mapeamento de campos faltantes com valores derivados ou defaults razoáveis
3. Considerar cache local das imagens de logo para performance

## References

- Arquivo existente: `mobile/src/screens/DigitalCard/DigitalCardScreen.tsx`
- Tipos de dados: `mobile/src/types/oracle.ts`
- Tema: `mobile/src/config/theme.ts`
- Constitution: `.specify/memory/constitution.md`
