# Quickstart: Painel Administrativo Web

**Feature**: 006-web-admin
**Date**: 2025-12-21

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm 8+ (or npm/yarn)
- Python 3.11+ (for backend)
- PostgreSQL 14+ running
- Backend server running at `http://localhost:8000`

## 1. Project Setup

### Create Next.js Admin Project

```bash
# From repository root
cd /home/alairjt/workspace/elosaude-platform

# Create Next.js project with TypeScript
npx create-next-app@latest admin --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd admin
```

### Install Dependencies

```bash
# Core dependencies
pnpm add @tanstack/react-query @tanstack/react-query-devtools
pnpm add react-hook-form @hookform/resolvers zod
pnpm add next-auth@beta
pnpm add recharts
pnpm add date-fns
pnpm add lucide-react

# shadcn/ui setup
pnpm dlx shadcn-ui@latest init

# Add shadcn components (run interactively)
pnpm dlx shadcn-ui@latest add button input label card table dialog form select badge avatar dropdown-menu navigation-menu sheet sidebar toast
```

### Environment Configuration

Create `admin/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production

# Backend API
API_BASE_URL=http://localhost:8000
```

## 2. Backend Setup

### Create Admin API App

```bash
cd /home/alairjt/workspace/elosaude-platform/backend

# Create new Django app
python manage.py startapp admin_api apps/admin_api
```

### Register App in Settings

Edit `backend/elosaude_backend/settings.py`:

```python
INSTALLED_APPS = [
    # ... existing apps
    'apps.admin_api',
]
```

### Add URL Routes

Edit `backend/elosaude_backend/urls.py`:

```python
urlpatterns = [
    # ... existing patterns
    path('api/admin/', include('apps.admin_api.urls')),
]
```

## 3. Key Files to Create

### Frontend Structure

```
admin/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx              # Dashboard home
│   │   ├── users/page.tsx
│   │   ├── providers/page.tsx
│   │   ├── reimbursements/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx            # Sidebar layout
│   ├── api/auth/[...nextauth]/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn components
│   ├── dashboard/
│   │   ├── metric-card.tsx
│   │   ├── recent-activity.tsx
│   │   └── charts/
│   ├── data-table/
│   │   ├── data-table.tsx
│   │   ├── columns.tsx
│   │   └── toolbar.tsx
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── breadcrumb.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts             # API client
│   │   ├── users.ts
│   │   ├── providers.ts
│   │   ├── reimbursements.ts
│   │   └── dashboard.ts
│   ├── auth/
│   │   └── config.ts             # NextAuth config
│   └── utils.ts
├── hooks/
│   ├── use-users.ts
│   ├── use-providers.ts
│   └── use-reimbursements.ts
└── types/
    └── index.ts                  # API types from OpenAPI
```

### Backend Structure

```
backend/apps/admin_api/
├── __init__.py
├── admin.py
├── apps.py
├── models.py                     # AdminProfile, AuditLog, SystemConfiguration
├── serializers.py
├── views/
│   ├── __init__.py
│   ├── auth.py
│   ├── dashboard.py
│   ├── users.py
│   ├── providers.py
│   ├── reimbursements.py
│   ├── reports.py
│   ├── settings.py
│   └── audit.py
├── urls.py
├── permissions.py
├── signals.py                    # Auto audit logging
└── tests/
    └── test_*.py
```

## 4. Development Commands

### Run Backend

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Run Frontend

```bash
cd admin
pnpm dev
```

### Run Both (Recommended)

Use two terminal windows or create a script:

```bash
# Terminal 1 - Backend
cd backend && source venv/bin/activate && python manage.py runserver

# Terminal 2 - Frontend
cd admin && pnpm dev
```

## 5. Quick Implementation Order

### Phase 1: Foundation (Must have first)
1. Backend: Create `admin_api` app with models
2. Backend: Implement auth endpoints (`/api/admin/auth/*`)
3. Frontend: Setup NextAuth with credentials provider
4. Frontend: Create login page and protected layout

### Phase 2: Dashboard
1. Backend: Dashboard metrics endpoint
2. Frontend: Dashboard page with metric cards
3. Frontend: Recent activity component

### Phase 3: CRUD Operations
1. Users management (list, view, edit, deactivate)
2. Providers management (list, view, edit, approve/reject)
3. Reimbursements management (list, view, approve/reject)

### Phase 4: Reports & Settings
1. Report generation endpoints
2. CSV/PDF export
3. System configuration management

## 6. Testing

### Backend Tests
```bash
cd backend
pytest apps/admin_api/tests/ -v
```

### Frontend Tests
```bash
cd admin
pnpm test
```

## 7. Useful Links

- [Next.js 14 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [TanStack Query](https://tanstack.com/query/latest)
- [NextAuth.js v5](https://authjs.dev/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [API Contract](./contracts/admin-api.yaml)

## 8. Common Issues

### CORS Errors
Ensure `CORS_ALLOWED_ORIGINS` in Django settings includes `http://localhost:3000`.

### JWT Token Refresh
NextAuth handles token refresh automatically. If tokens expire, implement refresh logic in NextAuth callbacks.

### Type Generation from OpenAPI
Use `openapi-typescript` to generate TypeScript types:
```bash
npx openapi-typescript specs/006-web-admin/contracts/admin-api.yaml -o admin/src/types/api.d.ts
```
