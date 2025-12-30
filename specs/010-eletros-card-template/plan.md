# Implementation Plan: Template Carteirinha Digital Eletros-Saude

**Branch**: `010-eletros-card-template` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-eletros-card-template/spec.md`

## Summary

Criar um novo template de carteirinha digital para beneficiarios com reciprocidade Eletros-Saude, seguindo o design visual oficial com frente e verso. O template sera renderizado condicionalmente quando `PRESTADOR_RECIPROCIDADE = 'ELETROS'`. Design caracteristico inclui header curvo azul (frente), logo Eletros-Saude em duas versoes (branca e colorida), tag ANS preta, campos com destaque vermelho, e linha divisoria verde (verso). Implementacao usando React Native com animacao de flip 3D via react-native-reanimated.

## Technical Context

**Language/Version**: TypeScript 5+
**Primary Dependencies**: React Native + Expo 0.73+, React Native Paper 5+, react-native-reanimated 3.x (para animacao flip), react-native-svg (para header curvo e logo)
**Storage**: N/A (dados vindos da API existente via OracleReciprocidade)
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS 15+ / Android 8+ (via Expo)
**Project Type**: Mobile
**Performance Goals**: Animacao flip a 60fps, transicao completa em <500ms
**Constraints**: <16ms por frame na animacao, suporte a telas 4.7" a 6.7", largura minima 320px
**Scale/Scope**: 1 novo template de cartao, ~8 novos componentes, 1 novo tipo TypeScript

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. LGPD & Privacy First | PASS | Nenhuma nova coleta de dados pessoais. Apenas exibicao de dados existentes da API |
| II. API-First Design | PASS | Usa API existente (OracleReciprocidade). Nenhuma nova API necessaria |
| III. Healthcare Standards | PASS | Exibe informacoes ANS conforme especificado (ANS 42.207-0) |
| IV. Security by Design | PASS | Nenhuma nova superficie de ataque. Dados ja autenticados via JWT |
| V. Mobile-Accessible UX | PASS | Botao de flip tera 48x48dp minimo. Texto suporta escala dinamica. Contraste adequado branco/azul |

**Gate Status**: PASSED - Nenhuma violacao identificada

## Project Structure

### Documentation (this feature)

```text
specs/010-eletros-card-template/
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
│   │       ├── ELETROSHeader.tsx           # Header do cartao (logo + ANS tag)
│   │       ├── ELETROSBodyFront.tsx        # Corpo frontal (dados beneficiario)
│   │       ├── ELETROSBodyBack.tsx         # Corpo verso (segmentacao, contatos)
│   │       ├── ELETROSCurvedBackground.tsx # SVG background curvo azul
│   │       └── ELETROSLogo.tsx             # Logo SVG (versao branca e colorida)
│   ├── screens/
│   │   └── DigitalCard/
│   │       └── components/
│   │           └── ELETROSCardTemplate.tsx # Template principal com flip
│   ├── types/
│   │   └── eletros.ts                      # Tipos ELETROSCardData, ELETROSCardTemplateProps
│   └── utils/
│       └── cardUtils.ts                    # Adicionar extractELETROSCardData + isELETROSEligible
└── __tests__/
    └── components/
        └── cards/
            └── ELETROSCardTemplate.test.tsx
```

**Structure Decision**: Mobile-only feature seguindo a estrutura existente de card templates (Unimed, Vivest). Componentes organizados em `components/cards/` com template principal em `screens/DigitalCard/components/`. Seguindo padrao de nomenclatura ELETROS (uppercase) para consistencia com VIVEST.

## Complexity Tracking

> Nenhuma violacao de Constitution - secao nao aplicavel
