# Implementation Plan: Template Carteirinha Digital Fachesf

**Branch**: `011-fachesf-card-template` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-fachesf-card-template/spec.md`

## Summary

Criar template de carteirinha digital para beneficiarios do plano Fachesf. O template segue um design limpo com fundo branco, badge "ESPECIAL" verde no canto superior direito, hierarquia de texto invertida (valor acima do label), grid de informacoes e rodape com contatos e logo. Diferente dos outros templates, este nao possui funcionalidade de flip (frente/verso).

## Technical Context

**Language/Version**: TypeScript 5+
**Primary Dependencies**: React Native 0.73+, Expo, React Native Paper 5+
**Storage**: N/A (dados via API existente - OracleReciprocidade)
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS 15+ / Android 10+ (Mobile)
**Project Type**: mobile
**Performance Goals**: Renderizacao em < 2 segundos
**Constraints**: Acessibilidade para usuarios 35-65+, touch targets minimos 48x48dp
**Scale/Scope**: 1 template de carteirinha, ~6 componentes novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. LGPD & Privacy First | PASS | Nao coleta dados novos, apenas exibe dados existentes |
| II. API-First Design | PASS | Usa API existente (OracleReciprocidade) |
| III. Healthcare Standards Compliance | PASS | Exibe registro ANS conforme obrigatorio |
| IV. Security by Design | PASS | Nao introduz novos pontos de entrada |
| V. Mobile-Accessible UX | PASS | Touch targets 48dp, hierarquia clara, texto legivel |

**Gate Status**: PASSED - Nenhuma violacao identificada.

## Project Structure

### Documentation (this feature)

```text
specs/011-fachesf-card-template/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A - usa API existente
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
mobile/
├── src/
│   ├── components/cards/
│   │   ├── FACHESFHeader.tsx          # Header com badge ESPECIAL
│   │   ├── FACHESFBody.tsx            # Grid de informacoes
│   │   ├── FACHESFFooter.tsx          # Rodape com contatos e logo
│   │   ├── FACHESFLogo.tsx            # Componente do logo
│   │   └── index.ts                   # Exportacoes
│   ├── screens/DigitalCard/components/
│   │   ├── FACHESFCardTemplate.tsx    # Template principal
│   │   └── index.ts                   # Exportacoes
│   ├── types/
│   │   └── fachesf.ts                 # Tipos e constantes
│   ├── utils/
│   │   └── cardUtils.ts               # +isFACHESFEligible, +extractFACHESFCardData
│   └── assets/images/
│       └── LogoFachesf.png            # Logo da Fachesf Saude
└── tests/
    └── components/cards/
        └── FACHESFCardTemplate.test.tsx
```

**Structure Decision**: Segue padrao estabelecido pelos templates existentes (ELETROS, VIVEST, Unimed, Elosaude).

## Complexity Tracking

> Nenhuma violacao da Constitution identificada. Tabela nao aplicavel.

## Implementation Notes

### Diferencas em Relacao aos Outros Templates

1. **Sem flip animation**: Template de lado unico (sem frente/verso)
2. **Hierarquia invertida**: Valor em cima, label embaixo (diferente do padrao)
3. **ANS vertical**: Texto rotacionado 90 graus na lateral direita
4. **Badge conectado ao topo**: Estilo "pill shape" colado na borda superior

### Padroes a Seguir

- Usar `OracleReciprocidade` como fonte de dados (mesmo dos outros templates)
- Criar funcao `isFACHESFEligible()` em `cardUtils.ts`
- Criar funcao `extractFACHESFCardData()` em `cardUtils.ts`
- Definir `FACHESF_COLORS` e `FACHESF_STATIC_INFO` em `types/fachesf.ts`
- Exportar componente em `screens/DigitalCard/components/index.ts`

### Cores Definidas

- Background: `#FFFFFF` (branco)
- Badge/Accent: `#2BB673` (verde esmeralda)
- Texto valor: `#333333` (escuro)
- Texto label: `#999999` (cinza)
- Divisor: `#E0E0E0` (cinza claro)
