/**
 * useThemeStyles Hook
 *
 * Provides theme-aware styles and utilities for components.
 * Use this hook to create styles that automatically update with theme changes.
 */

import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useColors, useIsDark } from '../config/ThemeContext';
import {
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentSizes,
} from '../config/theme';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Creates theme-aware styles using a factory function.
 *
 * @example
 * const styles = useThemeStyles((colors) => ({
 *   container: {
 *     backgroundColor: colors.surface.background,
 *     padding: Spacing.md,
 *   },
 *   title: {
 *     color: colors.text.primary,
 *     fontSize: Typography.sizes.lg,
 *   },
 * }));
 */
export function useThemeStyles<T extends NamedStyles<T>>(
  styleFactory: (colors: ReturnType<typeof useColors>) => T
): T {
  const colors = useColors();

  return useMemo(() => {
    const styles = styleFactory(colors);
    return StyleSheet.create(styles) as T;
  }, [colors, styleFactory]);
}

/**
 * Returns commonly used base styles that respond to theme changes.
 * Provides pre-built styles for common UI patterns.
 */
export function useBaseStyles() {
  const colors = useColors();
  const isDark = useIsDark();

  return useMemo(
    () =>
      StyleSheet.create({
        // Containers
        screen: {
          flex: 1,
          backgroundColor: colors.surface.background,
        },
        screenPadded: {
          flex: 1,
          backgroundColor: colors.surface.background,
          padding: Spacing.md,
        },
        card: {
          backgroundColor: colors.surface.card,
          borderRadius: BorderRadius.lg,
          padding: Spacing.md,
          ...Shadows.sm,
        },
        cardElevated: {
          backgroundColor: colors.surface.elevated,
          borderRadius: BorderRadius.lg,
          padding: Spacing.md,
          ...Shadows.md,
        },

        // Flexbox
        row: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        rowSpaceBetween: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        center: {
          alignItems: 'center',
          justifyContent: 'center',
        },

        // Typography
        title: {
          fontSize: Typography.sizes.xxl,
          fontWeight: Typography.weights.bold as TextStyle['fontWeight'],
          color: colors.text.primary,
          lineHeight: Typography.lineHeights.tight * Typography.sizes.xxl,
        },
        subtitle: {
          fontSize: Typography.sizes.lg,
          fontWeight: Typography.weights.semibold as TextStyle['fontWeight'],
          color: colors.text.primary,
          lineHeight: Typography.lineHeights.normal * Typography.sizes.lg,
        },
        body: {
          fontSize: Typography.sizes.md,
          fontWeight: Typography.weights.normal as TextStyle['fontWeight'],
          color: colors.text.primary,
          lineHeight: Typography.lineHeights.relaxed * Typography.sizes.md,
        },
        bodySecondary: {
          fontSize: Typography.sizes.md,
          fontWeight: Typography.weights.normal as TextStyle['fontWeight'],
          color: colors.text.secondary,
          lineHeight: Typography.lineHeights.relaxed * Typography.sizes.md,
        },
        caption: {
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights.normal as TextStyle['fontWeight'],
          color: colors.text.tertiary,
          lineHeight: Typography.lineHeights.normal * Typography.sizes.sm,
        },
        link: {
          fontSize: Typography.sizes.md,
          fontWeight: Typography.weights.medium as TextStyle['fontWeight'],
          color: colors.text.link,
        },

        // Buttons
        buttonPrimary: {
          backgroundColor: colors.primary.main,
          borderRadius: BorderRadius.md,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.lg,
          minHeight: ComponentSizes.buttonHeight,
          minWidth: ComponentSizes.touchTarget,
          alignItems: 'center',
          justifyContent: 'center',
        },
        buttonPrimaryText: {
          color: colors.primary.contrast,
          fontSize: Typography.sizes.md,
          fontWeight: Typography.weights.semibold as TextStyle['fontWeight'],
        },
        buttonSecondary: {
          backgroundColor: 'transparent',
          borderRadius: BorderRadius.md,
          borderWidth: 1,
          borderColor: colors.primary.main,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.lg,
          minHeight: ComponentSizes.buttonHeight,
          minWidth: ComponentSizes.touchTarget,
          alignItems: 'center',
          justifyContent: 'center',
        },
        buttonSecondaryText: {
          color: colors.primary.main,
          fontSize: Typography.sizes.md,
          fontWeight: Typography.weights.semibold as TextStyle['fontWeight'],
        },

        // Inputs
        input: {
          backgroundColor: colors.surface.card,
          borderRadius: BorderRadius.md,
          borderWidth: 1,
          borderColor: colors.border.default,
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          minHeight: ComponentSizes.inputHeight,
          fontSize: Typography.sizes.md,
          color: colors.text.primary,
        },
        inputFocused: {
          borderColor: colors.primary.main,
        },
        inputError: {
          borderColor: colors.feedback.error,
        },
        inputLabel: {
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights.medium as TextStyle['fontWeight'],
          color: colors.text.secondary,
          marginBottom: Spacing.xs,
        },
        inputHelper: {
          fontSize: Typography.sizes.sm,
          color: colors.text.tertiary,
          marginTop: Spacing.xs,
        },
        inputErrorText: {
          fontSize: Typography.sizes.sm,
          color: colors.feedback.error,
          marginTop: Spacing.xs,
        },

        // Dividers
        divider: {
          height: 1,
          backgroundColor: colors.border.light,
        },
        dividerVertical: {
          width: 1,
          backgroundColor: colors.border.light,
        },

        // Status indicators
        statusSuccess: {
          backgroundColor: colors.status.successLight,
          color: colors.status.success,
        },
        statusWarning: {
          backgroundColor: colors.status.warningLight,
          color: colors.status.warning,
        },
        statusError: {
          backgroundColor: colors.status.errorLight,
          color: colors.status.error,
        },
        statusInfo: {
          backgroundColor: colors.status.infoLight,
          color: colors.status.info,
        },
      }),
    [colors, isDark]
  );
}

/**
 * Hook to get theme-related values and utilities
 */
export function useThemeValues() {
  const colors = useColors();
  const isDark = useIsDark();

  return useMemo(
    () => ({
      colors,
      isDark,
      typography: Typography,
      spacing: Spacing,
      borderRadius: BorderRadius,
      shadows: Shadows,
      componentSizes: ComponentSizes,
    }),
    [colors, isDark]
  );
}

export default useThemeStyles;
