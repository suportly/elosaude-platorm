# Research: Template Carteirinha Digital Fachesf

**Feature**: 011-fachesf-card-template
**Date**: 2025-12-30

## Research Tasks

### 1. Padroes de Templates Existentes

**Task**: Analisar estrutura dos templates de carteirinha existentes para manter consistencia.

**Findings**:
- Templates existentes: ELETROS, VIVEST, Unimed, Elosaude
- Todos usam `OracleReciprocidade` como fonte de dados
- Padrao de arquivos: `types/{nome}.ts`, `components/cards/{Nome}*.tsx`, `screens/DigitalCard/components/{Nome}CardTemplate.tsx`
- Funcoes de elegibilidade em `utils/cardUtils.ts`: `is{NOME}Eligible()`
- Funcoes de extracao: `extract{NOME}CardData()`

**Decision**: Seguir exatamente o mesmo padrao para consistencia.
**Rationale**: Facilita manutencao e onboarding de novos desenvolvedores.

### 2. Hierarquia de Texto Invertida

**Task**: Pesquisar como implementar hierarquia valor-acima-label em React Native.

**Findings**:
- Padrao comum em cartoes modernos (ex: cartoes de banco, credenciais)
- Implementacao via `flexDirection: 'column'` com valor primeiro
- Estilos tipograficos distintos: valor maior/escuro, label menor/cinza/uppercase

**Decision**: Criar componente `LabeledField` com props `value` e `label` renderizados nessa ordem.
**Rationale**: Reutilizavel em todos os campos do template.

### 3. Texto Vertical (ANS)

**Task**: Pesquisar como rotacionar texto 90 graus em React Native.

**Findings**:
- React Native suporta `transform: [{ rotate: '90deg' }]` ou `transform: [{ rotate: '-90deg' }]`
- Para texto vertical da esquerda para direita (bottom-to-top): `rotate: '-90deg'`
- Posicionamento absoluto necessario para lateral direita

**Decision**: Usar `transform: [{ rotate: '-90deg' }]` com `position: 'absolute'` e `right: 0`.
**Rationale**: Solucao nativa sem dependencias extras.

### 4. Badge Conectado ao Topo

**Task**: Pesquisar como criar badge "colado" na borda superior do cartao.

**Findings**:
- Opcao 1: `position: 'absolute', top: 0, right: X` com `borderBottomLeftRadius`
- Opcao 2: `marginTop: -height` para puxar acima do container
- Design original: badge verde com cantos inferiores arredondados

**Decision**: Usar posicionamento absoluto com `top: 0` e `borderBottomLeftRadius: 20`.
**Rationale**: Mantem badge dentro do overflow do cartao, mais simples de implementar.

### 5. Mapeamento de Dados da API

**Task**: Identificar campos do `OracleReciprocidade` para preencher o template Fachesf.

**Findings**:
- `NOME_BENEFICIARIO` -> Nome do beneficiario
- `MATRICULA_BENEFICIARIO` -> Matricula/Codigo
- `VALIDADE_CARTAO` -> Validade
- `CNS_BENEFICIARIO` -> CNS (se disponivel)
- `TIPO_ACOMODACAO` -> Acomodacao
- `COBERTURA` -> Cobertura
- `PRESTADOR_RECIPROCIDADE` -> Para elegibilidade ("Fachesf")

**Decision**: Criar mapeamento em `extractFACHESFCardData()` com fallbacks para campos opcionais.
**Rationale**: Consistente com outros templates.

## Resolved Unknowns

| Unknown | Resolution |
|---------|------------|
| Estrutura de arquivos | Seguir padrao existente (ELETROS/VIVEST) |
| Texto vertical | `transform: [{ rotate: '-90deg' }]` |
| Badge conectado | `position: absolute` com `top: 0` |
| Hierarquia invertida | Componente `LabeledField` com valor acima |
| Dados da API | Usar `OracleReciprocidade` existente |

## Dependencies Identified

1. **Logo Fachesf**: Precisa ser fornecido como asset PNG
2. **Telefones de contato**: Constantes estaticas em `FACHESF_STATIC_INFO`
3. **Campos CNS**: Pode nao existir na API - usar fallback "-"
