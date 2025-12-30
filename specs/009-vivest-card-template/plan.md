# Implementation Plan: Template Carteirinha Digital Vivest

**Branch**: `009-vivest-card-template` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-vivest-card-template/spec.md`

## Summary

Criar um novo template de carteirinha digital para beneficiarios com reciprocidade Vivest, seguindo o design visual oficial com frente e verso. O template sera renderizado condicionalmente quando `prestador_reciprocidade = 'VIVEST'` e `plano_elosaude` pertencer a lista de planos elegiveis (Executive e Saude Mais). Implementacao usando React Native com animacao de flip 3D via react-native-reanimated.

## Technical Context

**Language/Version**: TypeScript 5+
**Primary Dependencies**: React Native + Expo 0.73+, React Native Paper 5+, react-native-reanimated 3.x (para animacao flip)
**Storage**: N/A (dados vindos da API existente via OracleReciprocidade)
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS 15+ / Android 8+ (via Expo)
**Project Type**: Mobile
**Performance Goals**: Animacao flip a 60fps, transicao completa em <400ms
**Constraints**: <16ms por frame na animacao, suporte a telas 4.7" a 6.7"
**Scale/Scope**: 1 novo template de cartao, ~8 novos componentes, 1 novo tipo TypeScript

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. LGPD & Privacy First | PASS | Nenhuma nova coleta de dados pessoais. Apenas exibicao de dados existentes da API |
| II. API-First Design | PASS | Usa API existente (OracleReciprocidade). Nenhuma nova API necessaria |
| III. Healthcare Standards | PASS | Exibe informacoes ANS conforme especificado (ANS 31547-8, ANS 417297) |
| IV. Security by Design | PASS | Nenhuma nova superficie de ataque. Dados ja autenticados via JWT |
| V. Mobile-Accessible UX | PASS | Botao de flip tera 48x48dp minimo. Texto suporta escala dinamica |

**Gate Status**: PASSED - Nenhuma violacao identificada

## Project Structure

### Documentation (this feature)

```text
specs/009-vivest-card-template/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no new APIs)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
mobile/
├── src/
│   ├── components/
│   │   └── cards/
│   │       ├── VIVESTHeader.tsx          # Header do cartao (logo + plano)
│   │       ├── VIVESTBodyFront.tsx       # Corpo frontal (dados beneficiario)
│   │       ├── VIVESTBodyBack.tsx        # Corpo verso (carencias, ANS, contatos)
│   │       └── VIVESTDecorativeLines.tsx # SVG elementos decorativos
│   ├── screens/
│   │   └── DigitalCard/
│   │       └── components/
│   │           └── VIVESTCardTemplate.tsx # Template principal com flip
│   ├── types/
│   │   └── vivest.ts                     # Tipos VIVESTCardData, VIVESTCardTemplateProps
│   ├── utils/
│   │   └── cardUtils.ts                  # Adicionar extractVIVESTCardData + isVIVESTEligible
│   └── assets/
│       └── images/
│           └── vivest-logo.svg           # Logo Vivest
└── __tests__/
    └── components/
        └── cards/
            └── VIVESTCardTemplate.test.tsx
```

**Structure Decision**: Mobile-only feature seguindo a estrutura existente de card templates (Unimed/Elosaude). Componentes organizados em `components/cards/` com template principal em `screens/DigitalCard/components/`.

## Complexity Tracking

> Nenhuma violacao de Constitution - secao nao aplicavel
