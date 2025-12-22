# Implementation Plan: Admin Design System - Elo Saúde

**Branch**: `007-admin-design-system` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-admin-design-system/spec.md`

## Summary

Redesign do painel administrativo Next.js com novo sistema de design Elo Saúde. Implementação de design tokens (cores, tipografia, espaçamento), sidebar dark collapsible, dashboard com stats cards, e componentes base com micro-interações.

Este é um projeto **frontend-only** - refatoração de UI/UX sem alterações no backend.

## Technical Context

**Language/Version**: TypeScript 5+
**Primary Dependencies**: Next.js 14, Tailwind CSS 3.4, lucide-react, @tanstack/react-query
**Storage**: N/A (frontend-only, APIs existentes)
**Testing**: Jest + React Testing Library (opcional)
**Target Platform**: Web (browsers modernos)
**Project Type**: web (admin frontend)
**Performance Goals**: FCP < 1.5s, CLS < 0.1, Lighthouse Accessibility >= 90
**Constraints**: WCAG AA compliance, prefers-reduced-motion support
**Scale/Scope**: 6 páginas (dashboard, users, providers, reimbursements, reports, settings)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applies? | Status | Notes |
|-----------|----------|--------|-------|
| I. LGPD & Privacy First | No | N/A | Sem manipulação de dados pessoais |
| II. API-First Design | No | N/A | Frontend-only, APIs já existem |
| III. Healthcare Standards | No | N/A | Sem operações de saúde |
| IV. Security by Design | No | N/A | Sem alterações de auth/security |
| V. Mobile-Accessible UX | **Yes** | PASS | Touch targets >= 48px, contrast WCAG AA, prefers-reduced-motion |

**Gate Status**: PASS - Nenhuma violação identificada.

## Project Structure

### Documentation (this feature)

```text
specs/007-admin-design-system/
├── plan.md              # This file
├── research.md          # Phase 0: best practices
├── data-model.md        # N/A (frontend-only)
├── quickstart.md        # Phase 1: test scenarios
├── contracts/           # N/A (existing APIs)
└── tasks.md             # Phase 2 output
```

### Source Code (existing structure)

```text
admin/
├── src/
│   ├── app/
│   │   ├── globals.css           # Design tokens (update)
│   │   ├── layout.tsx            # Root layout (update)
│   │   └── (protected)/
│   │       ├── layout.tsx        # Protected layout with sidebar (update)
│   │       ├── dashboard/page.tsx # Stats cards (update)
│   │       ├── users/page.tsx     # Table refactor
│   │       ├── providers/page.tsx
│   │       ├── reimbursements/page.tsx
│   │       ├── reports/page.tsx
│   │       └── settings/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx       # Dark sidebar with collapse (major update)
│   │   │   ├── header.tsx        # Search + user menu (update)
│   │   │   └── breadcrumb.tsx
│   │   └── ui/
│   │       ├── stats-card.tsx    # NEW: Dashboard card component
│   │       ├── data-table.tsx    # NEW: Reusable table component
│   │       ├── skeleton.tsx      # NEW: Loading skeletons
│   │       ├── modal.tsx         # Update with animations
│   │       ├── button.tsx        # Update with design tokens
│   │       └── input.tsx         # Update with design tokens
│   └── lib/
│       └── utils.ts
├── tailwind.config.ts            # Custom colors + fonts (update)
└── public/
    └── logo.png                  # Already exists
```

**Structure Decision**: Reutilizar estrutura existente do admin Next.js. Novos componentes em `components/ui/`. Design tokens via CSS variables em `globals.css` + Tailwind config.

## Implementation Strategy

### MVP Scope (P1 Stories Only)

O MVP inclui apenas as User Stories P1:
- US1: Dashboard com Stats Cards
- US2: Sidebar Dark Collapsible
- US3: Design Tokens

Após P1 completo, o admin já terá visual redesenhado funcional.

### Phases

1. **Phase 1 - Design Tokens** (US3): Definir CSS variables, configurar Tailwind
2. **Phase 2 - Sidebar** (US2): Refatorar sidebar com dark theme e collapse
3. **Phase 3 - Dashboard** (US1): Stats cards com skeleton loading
4. **Phase 4 - Header** (US4): Busca de usuários e menu
5. **Phase 5 - Tables** (US5): DataTable component responsivo
6. **Phase 6 - Forms/Modals** (US6): Validação visual
7. **Phase 7 - Polish** (US7, US8): Micro-interações e responsividade

### Key Files to Modify

| File | Changes |
|------|---------|
| `globals.css` | Design tokens (CSS variables) |
| `tailwind.config.ts` | Custom colors, fonts, extend theme |
| `sidebar.tsx` | Dark theme, collapse/expand, tooltips |
| `header.tsx` | User search, notifications, dropdown menu |
| `dashboard/page.tsx` | Stats cards grid |
| `components/ui/stats-card.tsx` | NEW component |
| `components/ui/data-table.tsx` | NEW component |
| `components/ui/skeleton.tsx` | NEW component |

## Complexity Tracking

> No violations identified - no complexity justification needed.
