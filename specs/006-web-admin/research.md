# Research: Painel Administrativo Web

**Feature**: 006-web-admin
**Date**: 2025-12-21
**Status**: Complete

## Research Areas

### 1. Next.js 14 App Router for Admin Panels

**Decision**: Use Next.js 14 with App Router (not Pages Router)

**Rationale**:
- App Router provides better layouts for admin dashboards (nested layouts, parallel routes)
- Server Components reduce client-side JavaScript bundle
- Built-in loading states and error boundaries
- Route groups `(auth)` and `(dashboard)` for clean organization
- Middleware for authentication checks

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Next.js Pages Router | More mature, simpler | Legacy approach, less flexible layouts | Rejected |
| Remix | Great data loading | Smaller ecosystem, learning curve | Rejected |
| Vite + React | Faster dev, simpler | No SSR, manual routing | Rejected |

**Best Practices**:
- Use route groups for organizing auth vs protected routes
- Implement middleware for auth checks before page load
- Use Server Actions for form submissions
- Leverage parallel routes for modals

---

### 2. Authentication with Django JWT Backend

**Decision**: Use NextAuth.js v5 with Credentials Provider connecting to Django simplejwt

**Rationale**:
- NextAuth.js handles session management, token refresh, and route protection
- Credentials provider works with existing Django JWT endpoints
- Session stored server-side (more secure than client-only JWT)
- Built-in CSRF protection

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Direct JWT in cookies | Simple, no library | Manual refresh, CSRF handling | Rejected |
| Auth0/Clerk | Managed, secure | Cost, vendor lock-in, requires backend changes | Rejected |
| Custom auth context | Full control | Reinventing wheel, security risks | Rejected |

**Implementation Pattern**:
```typescript
// NextAuth configuration pattern
export const authConfig = {
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const res = await fetch(`${API_URL}/api/token/`, {
          method: 'POST',
          body: JSON.stringify(credentials),
        });
        const tokens = await res.json();
        // Return user with tokens
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // Handle token refresh
    },
    session: async ({ session, token }) => {
      // Attach tokens to session
    }
  }
};
```

---

### 3. Data Fetching with TanStack Query

**Decision**: Use TanStack Query (React Query v5) for server state management

**Rationale**:
- Automatic caching, background refetching, optimistic updates
- Built-in pagination, infinite scroll support
- DevTools for debugging
- Works seamlessly with Next.js App Router

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| SWR | Simpler API, Vercel native | Less features, no mutations | Rejected |
| RTK Query | Redux integration | Overkill for this project, Redux not needed | Rejected |
| Server Components only | No client state | Limited interactivity, no optimistic updates | Rejected |

**Implementation Pattern**:
```typescript
// Query hooks pattern
export function useUsers(params: PaginationParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => api.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

---

### 4. UI Component Library

**Decision**: Use shadcn/ui with Tailwind CSS

**Rationale**:
- Copy-paste components (full control, no dependency lock-in)
- Accessible by default (Radix UI primitives)
- Tailwind CSS for consistent styling
- Great data table component with sorting, filtering, pagination
- Theming support for future dark mode

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Material UI | Comprehensive, familiar | Heavy bundle, opinionated design | Rejected |
| Ant Design | Great for admin panels | Large bundle, Chinese-first docs | Rejected |
| Chakra UI | Good DX, accessible | Different styling approach | Rejected |
| Headless UI | Minimal, flexible | Need to build everything | Rejected |

**Key Components Needed**:
- DataTable (with pagination, sorting, filtering)
- Forms (Input, Select, DatePicker, Checkbox)
- Dialogs/Modals (confirmations, detail views)
- Cards (dashboard metrics)
- Charts (dashboard visualizations)
- Navigation (sidebar, breadcrumbs)

---

### 5. Form Handling

**Decision**: React Hook Form + Zod for validation

**Rationale**:
- React Hook Form is performant (uncontrolled inputs)
- Zod provides type-safe schema validation
- Integration with shadcn/ui form components
- TypeScript inference from Zod schemas

**Implementation Pattern**:
```typescript
// Form schema pattern
const userSchema = z.object({
  email: z.string().email('Email invalido'),
  name: z.string().min(2, 'Nome muito curto'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF invalido'),
});

type UserFormData = z.infer<typeof userSchema>;
```

---

### 6. Dashboard Charts

**Decision**: Use Recharts for data visualization

**Rationale**:
- React-native charting library
- Good TypeScript support
- Responsive by default
- Works well with shadcn/ui theming

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Chart.js | Popular, flexible | React wrapper less maintained | Rejected |
| Visx | Powerful, Airbnb-backed | Complex API, learning curve | Rejected |
| Nivo | Beautiful defaults | Heavy bundle | Rejected |

---

### 7. Report Generation

**Decision**: Server-side PDF generation via Django backend, CSV via frontend

**Rationale**:
- PDF requires server-side processing (existing ReportLab in backend)
- CSV can be generated client-side for better UX
- Large reports processed async via Celery (existing infrastructure)

**Implementation Pattern**:
- Small reports (< 1000 records): Direct download
- Large reports (> 1000 records): Background job, email notification with download link

---

### 8. Existing Backend APIs Analysis

**Finding**: Existing Django REST Framework APIs cover most admin needs

**Endpoints Available**:
- `/api/token/` - JWT authentication (existing)
- `/api/users/` - User management (needs admin-only endpoints)
- `/api/providers/` - Provider management (exists)
- `/api/reimbursements/` - Reimbursement management (exists)
- `/api/beneficiaries/` - Beneficiary management (exists)

**New Endpoints Needed**:
- `/api/admin/dashboard/` - Aggregated metrics
- `/api/admin/users/` - Admin user management (different from beneficiaries)
- `/api/admin/audit-logs/` - Audit log viewing
- `/api/admin/reports/` - Report generation
- `/api/admin/settings/` - System configuration

---

## Final Technology Stack

| Component | Choice | Version |
|-----------|--------|---------|
| Framework | Next.js | 14.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | Latest |
| Data Fetching | TanStack Query | 5.x |
| Forms | React Hook Form + Zod | 7.x / 3.x |
| Authentication | NextAuth.js | 5.x |
| Charts | Recharts | 2.x |
| Testing | Jest + React Testing Library | Latest |

---

## Resolved Clarifications

No NEEDS CLARIFICATION items were identified in the technical context. All decisions have been made based on:
1. Existing backend technology stack (Django, DRF, simplejwt)
2. Constitution requirements (Security by Design, API-First)
3. Modern web development best practices
4. Team familiarity with React/TypeScript ecosystem
