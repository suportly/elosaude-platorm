# Implementation Plan: Template Carteirinha Digital Unimed

**Branch**: `008-unimed-card-template` | **Date**: 2025-12-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-unimed-card-template/spec.md`

## Summary

Esta feature atualiza o template visual da carteirinha digital quando o tipo de cartão é "UNIMED", replicando exatamente o design oficial da Unimed Santa Catarina. O componente existente `DigitalCardScreen.tsx` já possui suporte básico para cartões UNIMED, mas precisa ser estendido para exibir o layout completo de três seções (header verde, corpo verde-lima, footer verde-petróleo) com todos os campos especificados pelo design Unimed.

A implementação consiste em criar um componente especializado `UnimedCardTemplate.tsx` que renderiza o layout fiel ao cartão físico, integrado ao sistema de cards existente através de renderização condicional baseada no `cardType === 'UNIMED'`.

## Technical Context

**Language/Version**: TypeScript 5+
**Primary Dependencies**: React Native, Expo 0.73+, React Native Paper 5+
**Storage**: N/A (dados via API existente)
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS 15+, Android 10+ (mobile)
**Project Type**: Mobile
**Performance Goals**: Renderização < 100ms, 60 fps scrolling
**Constraints**: Proporção de cartão 1.586:1, telas mínimas 4.7"
**Scale/Scope**: 3 novos componentes, 1 arquivo de assets, ~400 linhas de código

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applicable | Status | Notes |
|-----------|------------|--------|-------|
| I. LGPD & Privacy First | Sim | PASS | Feature apenas exibe dados já autorizados via API existente. Nenhum dado novo coletado. |
| II. API-First Design | Sim | PASS | API `/beneficiaries/beneficiaries/my_cards/` já existe e retorna dados UNIMED. Nenhuma alteração de backend necessária. |
| III. Healthcare Standards Compliance | Sim | PASS | Carteirinha segue padrões ANS para identificação de beneficiário. Campos obrigatórios incluídos. |
| IV. Security by Design | Sim | PASS | Dados sensíveis já protegidos por autenticação JWT existente. Sem novos endpoints. |
| V. Mobile-Accessible UX | Sim | PASS | Touch targets 48x48dp, texto escalável, feedback visual. Layout responsivo. |

**Gate Result**: PASS - Nenhuma violação identificada.

## Project Structure

### Documentation (this feature)

```text
specs/008-unimed-card-template/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
mobile/
├── src/
│   ├── screens/
│   │   └── DigitalCard/
│   │       ├── DigitalCardScreen.tsx      # Tela principal (modificar)
│   │       └── components/
│   │           └── UnimedCardTemplate.tsx  # NOVO: Template Unimed
│   ├── components/
│   │   └── cards/
│   │       ├── UnimedHeader.tsx            # NOVO: Seção header
│   │       ├── UnimedBody.tsx              # NOVO: Seção corpo
│   │       └── UnimedFooter.tsx            # NOVO: Seção footer
│   ├── assets/
│   │   └── images/
│   │       ├── unimed-logo.svg             # NOVO: Logo Unimed SC
│   │       └── somos-coop-logo.svg         # NOVO: Logo Somos Coop
│   ├── config/
│   │   └── theme.ts                        # Adicionar cores Unimed específicas
│   └── types/
│       └── oracle.ts                       # Tipos já existentes
└── __tests__/
    └── screens/
        └── DigitalCard/
            └── UnimedCardTemplate.test.tsx  # NOVO: Testes do template
```

**Structure Decision**: Componentes de card organizados em `components/cards/` para reutilização. Template principal em `screens/DigitalCard/components/` para encapsular a lógica específica da tela.

## Complexity Tracking

Nenhuma violação de constitution identificada. Tabela não aplicável.

## Design Decisions

### Approach: Componente Especializado vs. Condicional Inline

**Decisão**: Criar componente `UnimedCardTemplate.tsx` separado

**Rationale**:
- O layout Unimed é significativamente diferente do template genérico (3 seções coloridas vs. card único)
- Facilita manutenção e testes isolados
- Permite adicionar outros templates de operadoras no futuro com mesmo padrão

### Cores do Design Unimed

| Seção | Cor Hex | Nome |
|-------|---------|------|
| Header | #00995D | Verde Unimed |
| Body | #C4D668 | Verde Lima |
| Footer | #0B504B | Verde Petróleo |
| Texto Header/Footer | #FFFFFF | Branco |
| Texto Body | #333333 | Cinza Escuro |

### Hierarquia de Componentes

```text
DigitalCardScreen
└── renderCard()
    └── cardType === 'UNIMED' ?
        └── UnimedCardTemplate
            ├── UnimedHeader
            │   ├── Logo Unimed SC
            │   ├── Logo Somos Coop
            │   └── Texto "COLETIVO EMPRESARIAL"
            ├── UnimedBody
            │   ├── Número da Carteirinha
            │   ├── Nome do Beneficiário
            │   ├── Grid 2 colunas (Acomodação, Validade, Plano, Rede, Abrangência, Atend.)
            │   └── Segmentação Assistencial
            └── UnimedFooter
                ├── Grid 2 colunas (Nascimento, Vigência, Cob. Parcial, Via)
                ├── Contratante
                └── Barra ANS
```

## Data Mapping

Mapeamento de campos `OracleUnimed` para o template visual:

| Campo Visual | Fonte de Dados | Fallback |
|--------------|----------------|----------|
| Número da Carteirinha | `MATRICULA_UNIMED` | "-" |
| Nome do Beneficiário | `NOME` | beneficiary.full_name |
| Acomodação | `ACOMODACAO` | "Não informado" |
| Validade | `Validade` | "-" |
| Plano | `PLANO` | "-" |
| Rede de Atendimento | Derivado de PLANO | "N/A" |
| Abrangência | `ABRANGENCIA` | "-" |
| Atend. | Primeiros 4 dígitos de MATRICULA | "-" |
| Nascimento | `NASCTO` via beneficiary | "-" |
| Vigência | Data de início do plano | "-" |
| Cob. Parcial Temp. | "NÃO HÁ" (padrão) | "NÃO HÁ" |
| Via | "Única" (padrão) | "Única" |
| Contratante | beneficiary.company | "-" |

## Next Steps

1. Execute `/speckit.tasks` para gerar tasks.md com tarefas detalhadas
2. Obter assets (logos SVG) da Unimed para inclusão
3. Implementar componentes seguindo a hierarquia definida
