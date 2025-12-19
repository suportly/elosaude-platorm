# Quickstart: UI Modernization

**Feature**: 004-ui-modernization

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] iOS Simulator or Android Emulator configured
- [ ] Access to `mobile/` directory

## Step 1: Understand the Design System

The design system is located at `mobile/src/config/theme.ts`. Key exports:

```typescript
import {
  Colors,           // Color palette
  Typography,       // Font sizes, weights
  Spacing,          // Spacing scale
  BorderRadius,     // Border radius values
  Shadows,          // Shadow definitions
  ComponentSizes,   // Touch targets, heights
  CommonStyles,     // Pre-built style objects
} from '@/config/theme';
```

## Step 2: Add Dark Mode Support

### 2.1 Create ThemeContext

Create `mobile/src/config/ThemeContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from './theme';

// Dark mode color overrides
const DarkColors = {
  ...Colors,
  surface: {
    background: '#0F172A',
    card: '#1E293B',
    elevated: '#334155',
    muted: '#1E293B',
  },
  text: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    disabled: '#475569',
    inverse: '#1E293B',
    link: '#60A5FA',
  },
  border: {
    light: '#334155',
    medium: '#475569',
    dark: '#64748B',
    focus: '#3B82F6',
  },
};

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colors: typeof Colors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const colors = isDark ? DarkColors : Colors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### 2.2 Wrap App with ThemeProvider

In `App.tsx` or your root component:

```typescript
import { ThemeProvider } from '@/config/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

## Step 3: Update Screens to Use Theme

### Before (hardcoded colors):

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',  // ❌ Hardcoded
  },
  title: {
    color: '#1E293B',  // ❌ Hardcoded
  },
});
```

### After (using theme):

```typescript
import { useTheme } from '@/config/ThemeContext';
import { Typography, Spacing } from '@/config/theme';

const MyScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.background }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        Hello World
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.screenPadding,
  },
  title: {
    fontSize: Typography.sizes.h1,
    fontWeight: Typography.weights.bold,
  },
});
```

## Step 4: Audit Checklist Per Screen

For each screen, verify:

- [ ] All colors use `colors.` from `useTheme()`
- [ ] All font sizes use `Typography.sizes`
- [ ] All spacing uses `Spacing.*`
- [ ] Touch targets are minimum 48x48
- [ ] Loading states have visual feedback
- [ ] Error states are user-friendly

## Step 5: Test Accessibility

### Font Scaling Test

1. iOS: Settings → Accessibility → Display & Text Size → Larger Text
2. Android: Settings → Display → Font Size

Test at:
- [ ] 100% (default)
- [ ] 150% (medium)
- [ ] 200% (large)

### Dark Mode Test

1. iOS: Settings → Display & Brightness → Dark
2. Android: Settings → Display → Dark theme

Verify:
- [ ] All text is readable
- [ ] Contrast is sufficient
- [ ] Icons are visible

### Touch Target Test

Use Xcode's Accessibility Inspector or Android's Layout Inspector to verify 48x48dp minimum for all interactive elements.

## Common Patterns

### Card Component

```typescript
import { useTheme } from '@/config/ThemeContext';
import { Spacing, BorderRadius, Shadows } from '@/config/theme';

const Card = ({ children }) => {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.surface.card },
      Shadows.card,
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.cardPadding,
    borderRadius: BorderRadius.card,
  },
});
```

### Button Component

```typescript
import { ComponentSizes, Typography } from '@/config/theme';

const Button = ({ title, onPress, variant = 'primary' }) => {
  const { colors } = useTheme();

  const buttonColors = {
    primary: { bg: colors.primary.main, text: colors.primary.contrast },
    secondary: { bg: colors.secondary.main, text: colors.secondary.contrast },
    outline: { bg: 'transparent', text: colors.primary.main },
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonColors[variant].bg },
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.buttonText,
        { color: buttonColors[variant].text },
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: ComponentSizes.button.height,
    minWidth: ComponentSizes.button.minWidth,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.button,
    paddingHorizontal: Spacing.lg,
  },
  buttonText: {
    fontSize: Typography.sizes.button,
    fontWeight: Typography.weights.semibold,
  },
});
```

## Troubleshooting

### Colors not updating with theme

Ensure you're using `colors` from `useTheme()` hook, not importing `Colors` directly.

### Layout breaks with large fonts

Use `flex` and relative sizing instead of fixed heights where possible.

### Dark mode not detecting

Check that `ThemeProvider` wraps your entire app before any navigation.

## Verification Checklist

After implementation, verify:

- [ ] All screens use `useTheme()` for colors
- [ ] Dark mode toggles correctly
- [ ] System preference is respected when set to 'system'
- [ ] Text is readable at 150% font scale
- [ ] All buttons/links have 48x48 touch area
- [ ] Color contrast meets WCAG AA (4.5:1)
