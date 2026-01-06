# Implementation Plan: Guia Médico por Tipo de Cartão

**Branch**: `012-guia-medico-links` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-guia-medico-links/spec.md`

## Summary

Modificar a tela NetworkScreen existente para exibir links externos de Guia Médico/Rede Credenciada baseados no tipo de cartão do usuário. A busca interna de prestadores será removida e substituída por cards clicáveis que abrem os portais externos das operadoras. Apenas os guias das operadoras cujos cartões o usuário possui serão exibidos.

## Technical Context

**Language/Version**: TypeScript 5+
**Primary Dependencies**: React Native 0.73+, Expo, React Native Paper 5+, React Navigation 6+
**Storage**: N/A (dados já disponíveis via API existente)
**Testing**: Jest + React Native Testing Library
**Target Platform**: iOS 15+, Android 10+
**Project Type**: Mobile
**Performance Goals**: Links devem abrir em < 1 segundo
**Constraints**: Offline não aplicável (links externos)
**Scale/Scope**: 5 operadoras, ~8 beneficiários ativos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. LGPD & Privacy First | ✅ PASS | Não manipula dados pessoais, apenas abre links externos |
| II. API-First Design | ✅ PASS | Usa dados já disponíveis da API OracleReciprocidade |
| III. Healthcare Standards Compliance | ✅ PASS | Links para portais oficiais das operadoras |
| IV. Security by Design | ✅ PASS | Links HTTPS, sem transmissão de dados |
| V. Mobile-Accessible UX | ✅ PASS | Touch targets 48x48dp, feedback visual |

**Gate Result**: PASSED - Nenhuma violação identificada.

## Project Structure

### Documentation (this feature)

```text
specs/012-guia-medico-links/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
mobile/
├── src/
│   ├── config/
│   │   └── medicalGuides.ts           # NEW: Mapeamento operadora → URL
│   ├── screens/
│   │   ├── Network/
│   │   │   └── NetworkScreen.tsx      # MODIFY: Substituir conteúdo por links externos
│   │   └── DigitalCard/
│   │       ├── DigitalCardScreen.tsx  # MODIFY: Adicionar botão contextual
│   │       └── components/
│   │           ├── MedicalGuideButton.tsx  # NEW: Botão reutilizável
│   │           └── *CardTemplate.tsx       # MODIFY: Integrar botão
│   ├── utils/
│   │   └── cardUtils.ts               # MODIFY: Helper para obter URL do guia
│   └── types/
│       └── medicalGuide.ts            # NEW: Tipos para guia médico
```

**Structure Decision**: Mobile-only feature. Modifica a estrutura existente do app React Native com Expo, substituindo o conteúdo da NetworkScreen.

## Complexity Tracking

> Nenhuma violação de constitution que precise justificativa.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Design Decisions

### Abordagem de Implementação

**Substituição da NetworkScreen** (conforme clarificação):
- Remover toda a lógica de busca interna de prestadores (`useGetProvidersQuery`, filtros, lista)
- Substituir por grid/lista de cards das operadoras do usuário
- Cada card abre o portal externo correspondente

### Acesso Contextual

- Botão em cada template de carteirinha para abrir o guia específico daquela operadora

### Mapeamento de URLs

| Operadora | Identificador | URL |
|-----------|---------------|-----|
| Fachesf | `FACHESF` | https://s008.fachesf.com.br/ConsultaCredenciadosRedeAtendimento/ |
| Vivest | `VIVEST` | https://medhub.facilinformatica.com.br/provider-search |
| Unimed | `UNIMED` | https://www.unimed.coop.br/site/web/guest/guia-medico#/ |
| Elosaude | `CARTEIRINHA` | https://webprod.elosaude.com.br/#/guia-medico |
| Eletrossaude | `ELETROS` | https://eletrossaude.com.br/rede-credenciada/ |

### Detecção de Tipo de Cartão

Utiliza lógica já existente:
- `_type === 'CARTEIRINHA'` → Elosaude
- `_type === 'UNIMED'` → Unimed
- `_type === 'RECIPROCIDADE'` + `PRESTADOR_RECIPROCIDADE` → Fachesf, Vivest, Eletros

## Implementation Phases

### Phase 1: Configuração e Tipos (P1)
- Criar `medicalGuides.ts` com mapeamento de URLs
- Criar tipos TypeScript em `medicalGuide.ts`
- Criar helper `getOperatorFromCard()` em cardUtils
- Criar helper `getUserOperators()` em cardUtils

### Phase 2: Substituir NetworkScreen (P1)
- Reescrever NetworkScreen para exibir cards de operadoras
- Remover busca interna, filtros, lista de prestadores
- Usar dados de cartões do usuário via hook existente
- Implementar empty state para usuário sem cartões

### Phase 3: Componente de Botão Contextual (P1)
- Criar `MedicalGuideButton.tsx` componente reutilizável
- Integrar nos templates de carteirinha existentes

### Phase 4: Testes e Validação
- Validação visual em iOS e Android
- Verificar que todos os links abrem corretamente
