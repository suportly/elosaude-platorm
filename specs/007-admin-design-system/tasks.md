# Tasks: Admin Design System - Elo Saúde

**Input**: Design documents from `/specs/007-admin-design-system/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Not requested - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Admin Frontend**: `admin/src/` (Next.js 14)

---

## Phase 1: Setup

**Purpose**: Project initialization and font setup

- [ ] T001 Verify admin project runs with `npm run dev:admin` and login works
- [ ] T002 [P] Install @radix-ui/react-tooltip dependency in admin/package.json
- [ ] T003 [P] Configure Inter font import in admin/src/app/layout.tsx using next/font/google

---

## Phase 2: Foundational - Design Tokens (US3) 🎯 MVP

**Purpose**: Core design system that MUST be complete before ANY visual component can be implemented

**⚠️ CRITICAL**: No other user story work can begin until design tokens are in place

**Goal**: Implement design tokens (CSS variables + Tailwind config) for consistent styling across all components

**Independent Test**: Inspect CSS in DevTools and verify --color-primary (#1bb198), --color-secondary (#1976D2), --sidebar-bg (#1E2530) exist

- [ ] T004 [US3] Add CSS variables for color palette in admin/src/app/globals.css (primary, secondary, sidebar, neutral, semantic colors from spec)
- [ ] T005 [US3] Add CSS variables for typography scale in admin/src/app/globals.css (font sizes, weights)
- [ ] T006 [US3] Add CSS variables for spacing, shadows, border-radius, transitions in admin/src/app/globals.css
- [ ] T007 [US3] Update admin/tailwind.config.ts to extend colors referencing CSS variables
- [ ] T008 [US3] Add prefers-reduced-motion media query styles in admin/src/app/globals.css

**Checkpoint**: Design tokens ready - all components can now use consistent styling

---

## Phase 3: User Story 2 - Sidebar Dark Collapsible (Priority: P1) 🎯 MVP

**Goal**: Dark sidebar with navigation, collapse/expand functionality, and tooltips

**Independent Test**: Navigate between sections, verify dark background (#1E2530), active item in teal (#1bb198), collapse to 72px with tooltips

### Implementation for User Story 2

- [ ] T009 [US2] Create SidebarContext for collapse state in admin/src/components/layout/sidebar-context.tsx
- [ ] T010 [US2] Refactor sidebar component with dark theme (#1E2530 background) in admin/src/components/layout/sidebar.tsx
- [ ] T011 [US2] Add collapse/expand toggle button (72px collapsed / 240px expanded) in admin/src/components/layout/sidebar.tsx
- [ ] T012 [US2] Add tooltip component for collapsed sidebar items using @radix-ui/react-tooltip in admin/src/components/ui/tooltip.tsx
- [ ] T013 [US2] Style active nav item with teal (#1bb198) highlight in admin/src/components/layout/sidebar.tsx
- [ ] T014 [US2] Add smooth transition animation (200ms) for collapse/expand in admin/src/components/layout/sidebar.tsx
- [ ] T015 [US2] Update protected layout to handle sidebar width changes in admin/src/app/(protected)/layout.tsx

**Checkpoint**: Sidebar is dark themed, collapsible with tooltips, and navigation works

---

## Phase 4: User Story 1 - Dashboard Stats Cards (Priority: P1) 🎯 MVP

**Goal**: Dashboard with 4 stats cards showing key metrics with hover effects and skeleton loading

**Independent Test**: Access /dashboard, verify 4 cards (Usuários, Reembolsos Pendentes, Prestadores, Faturamento), hover shows scale+shadow

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create Skeleton component with shimmer animation in admin/src/components/ui/skeleton.tsx
- [ ] T017 [P] [US1] Create StatsCard component with icon, value, label, hover effect in admin/src/components/ui/stats-card.tsx
- [ ] T018 [US1] Add dashboard stats API call or use existing endpoints in admin/src/lib/api/endpoints.ts
- [ ] T019 [US1] Refactor dashboard page with stats cards grid layout in admin/src/app/(protected)/dashboard/page.tsx
- [ ] T020 [US1] Add skeleton loading state for stats cards in admin/src/app/(protected)/dashboard/page.tsx
- [ ] T021 [US1] Add hover effect (scale 1.02 + shadow-lg) to stats cards in admin/src/components/ui/stats-card.tsx

**Checkpoint**: Dashboard shows 4 stats cards with data, skeleton loading, and hover effects

---

## Phase 5: User Story 4 - Header with Search and User Menu (Priority: P2)

**Goal**: Fixed header with user search field (debounced), notifications icon, and user dropdown menu

**Independent Test**: Type in search field (300ms debounce), click avatar to see dropdown with name/email/logout

### Implementation for User Story 4

- [ ] T022 [P] [US4] Create UserSearchInput component with debounce (300ms) in admin/src/components/layout/user-search.tsx
- [ ] T023 [P] [US4] Create UserDropdownMenu component in admin/src/components/layout/user-dropdown.tsx
- [ ] T024 [US4] Refactor Header component with search, notifications, user menu layout in admin/src/components/layout/header.tsx
- [ ] T025 [US4] Add user search API call filtering by name/email in admin/src/lib/api/endpoints.ts
- [ ] T026 [US4] Style search results dropdown in admin/src/components/layout/user-search.tsx

**Checkpoint**: Header has working search (users only), notifications icon, and user dropdown

---

## Phase 6: User Story 5 - Responsive Data Tables (Priority: P2)

**Goal**: Reusable DataTable component with sortable columns, row hover, pagination, responsive behavior

**Independent Test**: Access /users, click column header to sort, hover row highlights, pagination works, responsive on mobile

### Implementation for User Story 5

- [ ] T027 [US5] Create DataTable component with column definitions in admin/src/components/ui/data-table.tsx
- [ ] T028 [US5] Add sortable column headers (click to toggle asc/desc) in admin/src/components/ui/data-table.tsx
- [ ] T029 [US5] Add row hover highlight style in admin/src/components/ui/data-table.tsx
- [ ] T030 [US5] Add pagination component with page indicators in admin/src/components/ui/pagination.tsx
- [ ] T031 [US5] Add responsive behavior (horizontal scroll or card layout on mobile) in admin/src/components/ui/data-table.tsx
- [ ] T032 [US5] Refactor /users page to use DataTable component in admin/src/app/(protected)/users/page.tsx
- [ ] T033 [P] [US5] Refactor /providers page to use DataTable component in admin/src/app/(protected)/providers/page.tsx
- [ ] T034 [P] [US5] Refactor /reimbursements page to use DataTable component in admin/src/app/(protected)/reimbursements/page.tsx

**Checkpoint**: All listing pages use DataTable with sorting, hover, pagination, and responsive behavior

---

## Phase 7: User Story 6 - Forms and Modals (Priority: P2)

**Goal**: Consistent form styling with validation feedback, modal with ESC/click-outside close and animations

**Independent Test**: Open modal, press ESC or click outside to close, submit form with errors to see red border + message

### Implementation for User Story 6

- [ ] T035 [P] [US6] Create Input component with focus state (teal border) and error state (red border + message) in admin/src/components/ui/input.tsx
- [ ] T036 [P] [US6] Create Button component with loading state (spinner + disabled) in admin/src/components/ui/button.tsx
- [ ] T037 [US6] Update Modal component with fade animations and ESC/click-outside handlers in admin/src/components/ui/modal.tsx
- [ ] T038 [US6] Create Form wrapper component for consistent validation display in admin/src/components/ui/form.tsx
- [ ] T039 [US6] Apply new form components to user creation/edit forms in admin/src/app/(protected)/users/page.tsx

**Checkpoint**: Forms show validation states, modals animate and close properly

---

## Phase 8: Polish & Cross-Cutting Concerns (US7, US8)

**Purpose**: Micro-interactions (US7) and responsive behavior (US8)

### Micro-interactions (US7)

- [ ] T040 [P] Add button hover effect (darken 10%, transition 150ms) across all buttons
- [ ] T041 [P] Add page transition fade effect for navigation in admin/src/app/(protected)/layout.tsx
- [ ] T042 Verify all interactive elements have focus indicators for accessibility

### Responsiveness (US8)

- [ ] T043 Add mobile drawer behavior for sidebar (<768px) in admin/src/components/layout/sidebar.tsx
- [ ] T044 Add hamburger menu button in header for mobile in admin/src/components/layout/header.tsx
- [ ] T045 Add responsive breakpoint hook (mobile/tablet/desktop) in admin/src/hooks/use-breakpoint.ts
- [ ] T046 Set sidebar default to collapsed on tablet (768-1279px) using breakpoint hook

### Final Validation

- [ ] T047 Run Lighthouse accessibility audit - target score >= 90
- [ ] T048 Verify all colors pass WCAG AA contrast check
- [ ] T049 Test prefers-reduced-motion disables animations
- [ ] T050 Run through quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational/US3 (Phase 2)**: Depends on Setup - BLOCKS all other user stories
- **US2 Sidebar (Phase 3)**: Depends on Foundational
- **US1 Dashboard (Phase 4)**: Depends on Foundational
- **US4 Header (Phase 5)**: Depends on Foundational
- **US5 Tables (Phase 6)**: Depends on Foundational
- **US6 Forms/Modals (Phase 7)**: Depends on Foundational
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US3 (Design Tokens)**: Foundational - must complete first
- **US2 (Sidebar)**: Can start after US3 - independent
- **US1 (Dashboard)**: Can start after US3 - independent
- **US4 (Header)**: Can start after US3 - independent
- **US5 (Tables)**: Can start after US3 - independent
- **US6 (Forms/Modals)**: Can start after US3 - independent
- **US7/US8 (Polish)**: After all stories complete

### Parallel Opportunities

**After Foundational (US3) completes, these can run in parallel:**

```
┌──────────────────────────────────────────────────────────────┐
│                    Phase 2: US3 (Design Tokens)              │
│                         MUST COMPLETE                        │
└─────────────────────────────┬────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌─────────┐     ┌─────────┐     ┌─────────┐
        │   US2   │     │   US1   │     │   US4   │
        │ Sidebar │     │Dashboard│     │ Header  │
        └─────────┘     └─────────┘     └─────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                        ┌─────────┐
                        │US5/US6  │
                        │ Tables  │
                        │ Forms   │
                        └─────────┘
                              │
                              ▼
                        ┌─────────┐
                        │US7/US8  │
                        │ Polish  │
                        └─────────┘
```

---

## Parallel Example: After Design Tokens Complete

```bash
# Launch in parallel after Phase 2 (Design Tokens) completes:

# Team member 1: Sidebar
Task: "T009 [US2] Create SidebarContext for collapse state"
Task: "T010 [US2] Refactor sidebar component with dark theme"

# Team member 2: Dashboard
Task: "T016 [US1] Create Skeleton component with shimmer animation"
Task: "T017 [US1] Create StatsCard component"

# Team member 3: Header
Task: "T022 [US4] Create UserSearchInput component with debounce"
Task: "T023 [US4] Create UserDropdownMenu component"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Design Tokens (US3) - **CRITICAL**
3. Complete Phase 3: Sidebar (US2)
4. Complete Phase 4: Dashboard (US1)
5. **STOP and VALIDATE**: Test MVP - sidebar + dashboard redesigned
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + US3 (Design Tokens) → Foundation ready
2. Add US2 (Sidebar) → Dark sidebar with collapse → Deploy
3. Add US1 (Dashboard) → Stats cards → Deploy (MVP Complete!)
4. Add US4 (Header) → Search + user menu → Deploy
5. Add US5 (Tables) → Responsive tables → Deploy
6. Add US6 (Forms/Modals) → Validation styling → Deploy
7. Add US7/US8 (Polish) → Final polish → Deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [US#] label maps task to specific user story for traceability
- Design Tokens (US3) is foundational - must complete before other UI work
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
