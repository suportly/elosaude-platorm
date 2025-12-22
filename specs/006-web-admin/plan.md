# Implementation Plan: Painel Administrativo Web

**Branch**: `006-web-admin` | **Date**: 2025-12-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-web-admin/spec.md`

## Summary

Implementar painel administrativo web para gerenciamento da plataforma Elosaude. O painel permitira que administradores realizem operacoes de CRUD em usuarios, prestadores e reembolsos, alem de visualizar dashboards com metricas e gerar relatorios. O frontend sera construido com Next.js 14 (App Router) consumindo as APIs REST existentes do backend Django.

## Technical Context

**Language/Version**: TypeScript 5+, Python 3.11 (backend existente)
**Primary Dependencies**: Next.js 14+, React 18+, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod
**Storage**: PostgreSQL 14+ (backend existente via Django ORM)
**Testing**: Jest + React Testing Library (frontend), pytest (backend existente)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - ultimas 2 versoes)
**Project Type**: Web application (frontend Next.js + backend Django existente)
**Performance Goals**: Dashboard < 3s, CRUD operations < 2s, 50 usuarios simultaneos
**Constraints**: Acesso restrito via rede interna/VPN, sessao expira em 30 minutos
**Scale/Scope**: ~50 admins, 7 telas principais, integracao com 6+ entidades existentes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. LGPD & Privacy First | PASS | Admin panel will access existing LGPD-compliant backend; audit logs required (FR-004) |
| II. API-First Design | PASS | Will consume existing DRF APIs with OpenAPI docs; new admin endpoints will be documented |
| III. Healthcare Standards | PASS | Not directly impacted; data displayed follows existing TISS/ANS compliance |
| IV. Security by Design | PASS | JWT auth via existing simplejwt; session timeout 30min; HTTPS enforced |
| V. Mobile-Accessible UX | N/A | Desktop-first admin panel; not a mobile application |

**Gate Result**: PASS - No violations. Proceed with Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/006-web-admin/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (admin API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/                      # Existing Django backend
├── apps/
│   ├── accounts/            # User authentication (existing)
│   ├── beneficiaries/       # Beneficiaries management (existing)
│   ├── providers/           # Healthcare providers (existing)
│   ├── reimbursements/      # Reimbursement management (existing)
│   ├── guides/              # Medical guides (existing)
│   ├── financial/           # Financial operations (existing)
│   ├── notifications/       # Notification system (existing)
│   └── admin_api/           # NEW: Admin-specific API endpoints
└── elosaude_backend/
    └── settings.py

admin/                        # NEW: Next.js admin panel
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Login, logout routes
│   │   ├── (dashboard)/    # Protected dashboard routes
│   │   │   ├── page.tsx    # Main dashboard
│   │   │   ├── users/      # User management
│   │   │   ├── providers/  # Provider management
│   │   │   ├── reimbursements/  # Reimbursement management
│   │   │   ├── reports/    # Reports generation
│   │   │   └── settings/   # System settings
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── forms/          # Form components
│   │   ├── tables/         # Data tables
│   │   └── charts/         # Dashboard charts
│   ├── lib/
│   │   ├── api/            # API client (TanStack Query)
│   │   ├── auth/           # Auth utilities
│   │   └── utils/          # Shared utilities
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript types
├── public/
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json
```

**Structure Decision**: Web application with separate admin frontend (Next.js) consuming existing Django backend. New admin-specific endpoints will be added to backend under `apps/admin_api/`.

## Complexity Tracking

> No Constitution violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
