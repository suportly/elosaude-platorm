# Implementation Plan: UI Modernization

**Branch**: `004-ui-modernization` | **Date**: 2025-12-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-ui-modernization/spec.md`

## Summary

Modernize the Elosaúde mobile app interface by ensuring consistent application of the existing design system across all 30+ screens, adding dark mode support, improving component feedback states, and enhancing accessibility for the 35-65 age demographic. The app already has a comprehensive design system in `mobile/src/config/theme.ts` that needs to be consistently applied.

## Technical Context

**Language/Version**: TypeScript 5+ (Mobile)
**Primary Dependencies**: React Native + Expo 0.73+, React Native Paper 5+, React Navigation 6+
**Storage**: N/A (UI-only changes)
**Testing**: Visual inspection, accessibility audit, device testing
**Target Platform**: iOS 15+, Android (React Native)
**Project Type**: Mobile application UI refresh
**Performance Goals**: 60fps animations, <100ms touch feedback
**Constraints**: Must maintain backwards compatibility, no breaking changes to navigation structure
**Scale/Scope**: 30+ screens, ~100 components to audit

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. LGPD & Privacy First | ✅ N/A | UI changes do not affect data handling |
| II. API-First Design | ✅ N/A | No API changes required |
| III. Healthcare Standards | ✅ N/A | No healthcare workflow changes |
| IV. Security by Design | ✅ N/A | No security-sensitive changes |
| V. Mobile-Accessible UX | ✅ PASS | Core focus: 48x48dp touch targets, dynamic type, platform conventions |

**Gate Result**: PASSED - Feature aligns with Constitution V (Mobile-Accessible UX)

## Project Structure

### Documentation (this feature)

```text
specs/004-ui-modernization/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Design tokens documentation
├── quickstart.md        # Implementation guide
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
mobile/
├── src/
│   ├── config/
│   │   └── theme.ts           # Design system (EXISTS - to be extended)
│   ├── components/
│   │   └── common/            # Shared components (to audit/update)
│   ├── screens/               # 30+ screens (to audit/update)
│   │   ├── Auth/
│   │   ├── Home/
│   │   ├── DigitalCard/
│   │   ├── Guides/
│   │   ├── Financial/
│   │   ├── Health/
│   │   ├── Network/
│   │   ├── Reimbursement/
│   │   ├── Dependents/
│   │   ├── Profile/
│   │   ├── Support/
│   │   ├── Notifications/
│   │   └── More/
│   └── hooks/
└── app.json
```

**Structure Decision**: Mobile-only changes within existing `mobile/` directory structure. No new directories needed - focus is on auditing and updating existing screens to use the design system consistently.

## Implementation Approach

### Phase 1: Design System Audit & Extension

1. **Audit current theme.ts** - Already comprehensive with:
   - Colors (primary, secondary, surface, text, feedback, border, status)
   - Typography (sizes, weights, line heights)
   - Spacing (xxs to xxxl scale)
   - Border radius, shadows, animations
   - Component sizes (48x48 touch targets)

2. **Extensions needed**:
   - Dark mode color variants
   - Theme context for mode switching

### Phase 2: Screen-by-Screen Updates

Priority order based on user frequency:
1. **P1 (Critical Path)**: Login, Home, DigitalCard
2. **P2 (Frequent Use)**: Guides, Reimbursement, Network
3. **P3 (Secondary)**: Profile, Financial, Health, Dependents
4. **P4 (Support)**: Support screens, Notifications, More

### Phase 3: Dark Mode Implementation

1. Add dark mode color palette to theme.ts
2. Implement ThemeContext for mode switching
3. Update all screens to use dynamic colors

### Phase 4: Accessibility Verification

1. Test with system font scaling (100%, 150%, 200%)
2. Verify touch targets (48x48 minimum per Constitution V)
3. Check color contrast ratios (WCAG AA 4.5:1)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Visual regression | Medium | Medium | Before/after screenshots for each screen |
| Performance impact | Low | Medium | Profile animations, lazy load heavy components |
| Breaking existing layouts | Medium | High | Test on multiple device sizes (iPhone SE to iPad) |

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `mobile/src/config/theme.ts` | MODIFY | Add dark mode variants |
| `mobile/src/config/ThemeContext.tsx` | CREATE | Theme mode management |
| `mobile/src/screens/**/*.tsx` | MODIFY | Apply consistent design tokens |
| `mobile/src/components/**/*.tsx` | MODIFY | Update to use theme tokens |

## Artifacts Generated

| Artifact | Purpose |
|----------|---------|
| [research.md](./research.md) | Design system analysis and recommendations |
| [data-model.md](./data-model.md) | Design tokens and component specifications |
| [quickstart.md](./quickstart.md) | Step-by-step implementation guide |

## Next Steps

Run `/speckit.tasks` to generate the implementation task list.
