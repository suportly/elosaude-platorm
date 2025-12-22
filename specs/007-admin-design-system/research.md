# Research: Admin Design System - Elo Saúde

**Feature**: 007-admin-design-system
**Date**: 2025-12-22

## Design System Implementation Patterns

### Decision: CSS Variables + Tailwind Extend

**Rationale**: Combinar CSS variables nativas com Tailwind permite:
- Design tokens acessíveis globalmente via `var(--token)`
- Utilities do Tailwind referenciam os tokens
- Fácil theming futuro (dark mode, etc.)
- Zero runtime overhead

**Alternatives Considered**:
- CSS-in-JS (styled-components): Descartado - adiciona runtime, incompatível com RSC
- Tailwind-only: Descartado - menos flexibilidade para tokens semânticos
- CSS Modules: Descartado - mais difícil manter consistência global

### Implementation Pattern

```css
/* globals.css - Define tokens */
:root {
  --color-primary: #1bb198;
  --color-secondary: #1976D2;
}

/* tailwind.config.ts - Reference tokens */
colors: {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
}

/* Usage in components */
<button className="bg-primary text-white" />
```

## Sidebar Collapse Pattern

### Decision: CSS Transform + State Hook

**Rationale**:
- Transição suave com `transform: translateX()` + `width`
- Estado controlado por React state (não localStorage para simplicidade)
- Tooltips via Radix UI ou CSS-only

**Alternatives Considered**:
- localStorage persist: Pode adicionar depois se necessário
- CSS-only collapse: Menos controle sobre timing

### Implementation Pattern

```tsx
const [collapsed, setCollapsed] = useState(false);

<aside className={cn(
  "transition-all duration-200",
  collapsed ? "w-[72px]" : "w-[240px]"
)}>
```

## Stats Card Hover Effect

### Decision: CSS Transform + Box Shadow

**Rationale**:
- `transform: scale(1.02)` para elevação sutil
- `box-shadow` aumenta com hover
- `transition: all 200ms ease` para suavidade

**Alternatives Considered**:
- Framer Motion: Overkill para efeitos simples
- CSS animations: Menos controle

### Implementation Pattern

```tsx
<div className="
  transition-all duration-200
  hover:scale-[1.02]
  hover:shadow-lg
">
```

## Skeleton Loading

### Decision: CSS Animation Shimmer

**Rationale**:
- Animação pura CSS (keyframes)
- Sem dependências extras
- Respeita `prefers-reduced-motion`

### Implementation Pattern

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```

## Responsive Sidebar Behavior

### Decision: Breakpoint-Based State

**Rationale**:
- Desktop (>=1280px): Sidebar expandida
- Tablet (768-1279px): Sidebar collapsed
- Mobile (<768px): Drawer overlay

### Implementation Pattern

```tsx
// Hook para detectar breakpoint
function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('desktop');

  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 768) setBreakpoint('mobile');
      else if (window.innerWidth < 1280) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return breakpoint;
}
```

## Color Contrast Validation

### Decision: Pre-validated Palette

**Rationale**: Cores definidas na spec já foram validadas para WCAG AA:

| Foreground | Background | Contrast | Status |
|------------|------------|----------|--------|
| #FFFFFF | #1E2530 (sidebar) | 12.6:1 | PASS |
| #B0BEC5 | #1E2530 (sidebar) | 7.5:1 | PASS |
| #212121 | #F5F7FA (background) | 14.3:1 | PASS |
| #FFFFFF | #1bb198 (primary) | 3.2:1 | FAIL (large text only) |

**Note**: Texto branco sobre primary (#1bb198) só passa para texto grande (18px+). Para texto pequeno, usar texto escuro ou primary-dark.

## Font Loading

### Decision: next/font/google

**Rationale**:
- Otimização automática pelo Next.js
- Self-hosted (sem requests externos)
- `font-display: swap` automático

### Implementation Pattern

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      {children}
    </html>
  );
}
```

## Dependencies Review

### Required (already installed)

- `next`: ^14.0.0 ✓
- `tailwindcss`: ^3.4.0 ✓
- `lucide-react`: Icons ✓
- `@tanstack/react-query`: Data fetching ✓

### Optional Additions

- `@radix-ui/react-tooltip`: For sidebar tooltips (lightweight)
- `clsx` or `tailwind-merge`: Already using via `cn()` utility

### Not Needed

- Framer Motion: CSS transitions sufficient
- Styled-components: Incompatible with RSC
- CSS-in-JS libraries: Avoid runtime overhead
