# Research: UI Modernization

**Feature**: 004-ui-modernization
**Date**: 2025-12-16

## Summary

This research documents findings for modernizing the Elosaúde mobile app interface, focusing on design system consistency, dark mode implementation, and accessibility improvements for the 35-65 age demographic.

## Current State Analysis

### Existing Design System (theme.ts)

The project already has a comprehensive design system at `mobile/src/config/theme.ts`:

| Category | Status | Quality |
|----------|--------|---------|
| Colors | ✅ Complete | Excellent - includes primary, secondary, surface, text, feedback, border, status |
| Typography | ✅ Complete | Excellent - optimized for 35-65 age group (17pt body text) |
| Spacing | ✅ Complete | Good - 8pt base scale (xxs to xxxl) |
| Shadows | ✅ Complete | Good - xs to xl scale plus component-specific |
| Border Radius | ✅ Complete | Good - consistent scale |
| Component Sizes | ✅ Complete | Excellent - 48x48 touch targets (WCAG compliant) |
| Animations | ✅ Complete | Good - timing and easing defined |
| Dark Mode | ❌ Missing | Not implemented |

### Key Findings

1. **Design System Quality**: The existing system is well-designed and already optimized for healthcare users
2. **Main Gap**: Dark mode support is not implemented
3. **Consistency Issue**: Not all screens may be using the design tokens consistently

## Research Decisions

### Decision 1: Dark Mode Implementation Strategy

**Decision**: Use React Context with `useColorScheme` hook

**Rationale**:
- Native integration with iOS/Android system preferences
- React Native's `useColorScheme` detects system dark mode automatically
- Context pattern allows easy propagation to all components
- No external dependencies needed

**Alternatives Considered**:
1. **Styled-components ThemeProvider**: Requires additional dependency, more complex setup
2. **Redux for theme state**: Overkill for simple theme switching
3. **Manual preference storage**: Doesn't respect system settings automatically

**Implementation Pattern**:
```typescript
// ThemeContext.tsx
const ThemeContext = createContext<{
  colors: typeof Colors;
  isDark: boolean;
  toggleTheme: () => void;
}>({ ... });

// Hook
export const useTheme = () => useContext(ThemeContext);
```

### Decision 2: Dark Mode Color Palette

**Decision**: Create semantic dark variants that maintain WCAG AA contrast

**Rationale**:
- Healthcare apps require high readability
- Older users may have reduced night vision
- Contrast ratios must meet 4.5:1 for body text

**Dark Mode Palette**:
| Light Mode | Dark Mode | Purpose |
|------------|-----------|---------|
| `#F8FAFC` (background) | `#0F172A` (slate-900) | Main background |
| `#FFFFFF` (card) | `#1E293B` (slate-800) | Card surfaces |
| `#1E293B` (text) | `#F1F5F9` (slate-100) | Primary text |
| `#2563EB` (primary) | `#3B82F6` (lighter) | Primary actions |
| `#10B981` (success) | `#34D399` (lighter) | Success states |

### Decision 3: Screen Update Strategy

**Decision**: Priority-based incremental updates

**Rationale**:
- Allows testing and validation at each step
- Most-used screens improved first
- Reduces risk of widespread regressions

**Priority Order**:
1. **P1 - Daily Use**: Home, DigitalCard, Login (3 screens)
2. **P2 - Weekly Use**: Guides, Reimbursement, Network (6 screens)
3. **P3 - Monthly Use**: Profile, Financial, Health, Dependents (8 screens)
4. **P4 - Occasional**: Support, Notifications, More (15 screens)

### Decision 4: Accessibility Verification Approach

**Decision**: Automated + manual testing with specific focus areas

**Rationale**:
- Constitution V requires 48x48dp touch targets
- Target demographic (35-65) may have visual or motor limitations
- WCAG AA compliance is a specification requirement

**Testing Checklist**:
1. Touch targets: Verify 48x48 minimum with layout inspector
2. Font scaling: Test at 100%, 150%, 200% system scale
3. Color contrast: Use accessibility tools (Xcode/Android Studio)
4. Screen reader: Test VoiceOver (iOS) and TalkBack (Android)

### Decision 5: Component Consistency Audit

**Decision**: Create reusable components for common patterns

**Rationale**:
- Many screens likely have inline styles instead of theme tokens
- Creating components enforces consistency
- Reduces code duplication

**Key Components to Standardize**:
| Component | Usage | Priority |
|-----------|-------|----------|
| Button (Primary/Secondary/Outline) | All screens | High |
| Card | Lists, details | High |
| Input | Forms | High |
| ListItem | Lists | High |
| StatusBadge | Guides, Reimbursements | Medium |
| EmptyState | Lists | Medium |
| LoadingState | All screens | Medium |

## References

- React Native useColorScheme: https://reactnative.dev/docs/usecolorscheme
- WCAG 2.1 AA Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Material Design Dark Theme: https://material.io/design/color/dark-theme.html
- Apple Human Interface Guidelines (Dark Mode): https://developer.apple.com/design/human-interface-guidelines/dark-mode
