# Data Model: UI Modernization Design Tokens

**Feature**: 004-ui-modernization
**Date**: 2025-12-16

## Overview

This document specifies the design tokens (colors, typography, spacing, etc.) that form the visual language of the Elosaúde app. The existing `theme.ts` file serves as the source of truth; this document extends it with dark mode support.

## Design Token Categories

### 1. Color Tokens

#### Light Mode (Existing)

| Token | Value | Usage |
|-------|-------|-------|
| `Colors.primary.main` | `#2563EB` | Primary actions, links |
| `Colors.primary.light` | `#3B82F6` | Hover states |
| `Colors.primary.dark` | `#1D4ED8` | Pressed states |
| `Colors.secondary.main` | `#10B981` | Success, wellness |
| `Colors.surface.background` | `#F8FAFC` | Screen backgrounds |
| `Colors.surface.card` | `#FFFFFF` | Cards, containers |
| `Colors.text.primary` | `#1E293B` | Main text (high contrast) |
| `Colors.text.secondary` | `#64748B` | Secondary text |

#### Dark Mode (New - To Be Added)

| Token | Value | Usage |
|-------|-------|-------|
| `DarkColors.primary.main` | `#3B82F6` | Primary (slightly lighter) |
| `DarkColors.primary.light` | `#60A5FA` | Hover states |
| `DarkColors.primary.dark` | `#2563EB` | Pressed states |
| `DarkColors.secondary.main` | `#34D399` | Success (lighter for contrast) |
| `DarkColors.surface.background` | `#0F172A` | Screen backgrounds (slate-900) |
| `DarkColors.surface.card` | `#1E293B` | Cards (slate-800) |
| `DarkColors.text.primary` | `#F1F5F9` | Main text (high contrast) |
| `DarkColors.text.secondary` | `#94A3B8` | Secondary text |

### 2. Typography Tokens (Existing - No Changes Needed)

| Token | Value | Usage |
|-------|-------|-------|
| `Typography.sizes.h1` | 28 | Screen titles |
| `Typography.sizes.h2` | 24 | Section headers |
| `Typography.sizes.h3` | 20 | Subsection headers |
| `Typography.sizes.body` | 17 | Body text (larger for accessibility) |
| `Typography.sizes.caption` | 13 | Labels, captions |
| `Typography.lineHeight.normal` | 1.5 | Body text line height |

### 3. Spacing Tokens (Existing - No Changes Needed)

| Token | Value | Usage |
|-------|-------|-------|
| `Spacing.xs` | 4 | Tight spacing |
| `Spacing.sm` | 8 | Element gaps |
| `Spacing.md` | 16 | Component padding |
| `Spacing.lg` | 24 | Section gaps |
| `Spacing.xl` | 32 | Screen sections |
| `Spacing.screenPadding` | 20 | Screen horizontal padding |

### 4. Component Size Tokens (Existing - No Changes Needed)

| Token | Value | Purpose |
|-------|-------|---------|
| `ComponentSizes.touchTarget` | 48 | Minimum touch area (WCAG) |
| `ComponentSizes.button.height` | 56 | Standard button height |
| `ComponentSizes.input.height` | 56 | Input field height |
| `ComponentSizes.listItem.height` | 72 | List row height |

## Theme Context Interface

```typescript
interface ThemeContextValue {
  // Current color set (light or dark)
  colors: typeof Colors;

  // Current mode
  isDark: boolean;

  // Toggle between modes
  toggleTheme: () => void;

  // Set specific mode
  setTheme: (mode: 'light' | 'dark' | 'system') => void;

  // Current theme preference ('light' | 'dark' | 'system')
  themePreference: string;
}
```

## Screen Entities (Audit Status)

| Screen Group | Screens | Token Compliance | Priority |
|--------------|---------|------------------|----------|
| Auth | Login, FirstAccess, ForgotPassword, ResetPassword | To audit | P1 |
| Home | HomeScreen | To audit | P1 |
| DigitalCard | DigitalCardScreen | To audit | P1 |
| Guides | GuidesScreen, GuideDetailScreen, CreateGuideScreen | To audit | P2 |
| Reimbursement | ReimbursementScreen, ReimbursementDetailScreen, CreateReimbursementScreen | To audit | P2 |
| Network | NetworkScreen, ProviderDetailScreen | To audit | P2 |
| Profile | ProfileScreen, ChangePasswordScreen | To audit | P3 |
| Financial | InvoicesScreen, TaxStatementsScreen | To audit | P3 |
| Health | HealthRecordsScreen, VaccinationCardScreen | To audit | P3 |
| Dependents | DependentsScreen, DependentDetailScreen, AddDependentScreen | To audit | P3 |
| Support | HelpCenterScreen, ContactScreen, TermsScreen, PrivacyScreen, AboutScreen | To audit | P4 |
| Notifications | NotificationsScreen | To audit | P4 |
| More | MoreScreen | To audit | P4 |

## Validation Rules

### Color Contrast

- All text on backgrounds must meet WCAG AA (4.5:1 ratio)
- Large text (18pt+) can use 3:1 ratio
- Interactive elements must have visible focus states

### Touch Targets

- Minimum 48x48dp for all interactive elements
- Spacing between targets: minimum 8dp

### Typography

- Body text minimum 17pt (already configured)
- Support 150% system font scaling without layout breaks

## State Transitions

### Theme Switching

```
User sets preference
       │
       ▼
┌─────────────┐
│   Light     │◄──────┐
└──────┬──────┘       │
       │ Toggle       │ Toggle
       ▼              │
┌─────────────┐       │
│   Dark      │───────┘
└─────────────┘

System mode:
Device setting changes → App theme updates automatically
```

### Loading States

```
┌─────────────┐
│   Idle      │
└──────┬──────┘
       │ User action
       ▼
┌─────────────┐
│  Loading    │──► Show skeleton/spinner
└──────┬──────┘
       │
       ├──────────┐
       ▼          ▼
┌──────────┐ ┌──────────┐
│ Success  │ │  Error   │
└──────────┘ └──────────┘
       │          │
       ▼          ▼
   Show data   Show error message
               + retry option
```
