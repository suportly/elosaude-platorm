/**
 * Button Component
 *
 * Botão acessível otimizado para usuários 35-65 anos
 * - Touch target mínimo de 56px de altura
 * - Feedback visual claro com animação de press
 * - Variantes: primary, secondary, outline, text
 * - Estados: default, loading, disabled
 */

import React, { useCallback, useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentSizes,
  Animations,
} from '../../config/theme';
import { useColors } from '../../config/ThemeContext';

// =============================================================================
// TYPES
// =============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  // Get theme colors
  const colors = useColors();

  // Animated value for press feedback
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: Animations.scale.pressed,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  // Get styles based on variant, size and theme colors
  const buttonStyles = useMemo(
    () => getButtonStyles(variant, size, disabled, fullWidth, colors),
    [variant, size, disabled, fullWidth, colors]
  );
  const textStyles = useMemo(
    () => getTextStyles(variant, size, disabled, colors),
    [variant, size, disabled, colors]
  );
  const iconColor = useMemo(
    () => getIconColor(variant, disabled, colors),
    [variant, disabled, colors]
  );
  const iconSize = getIconSize(size);

  const isDisabled = disabled || loading;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.button, buttonStyles]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'danger' ? colors.primary.contrast : colors.primary.main}
            size="small"
          />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <MaterialCommunityIcons
                name={icon as any}
                size={iconSize}
                color={iconColor}
                style={styles.iconLeft}
              />
            )}
            <Text style={[styles.text, textStyles, textStyle]}>{title}</Text>
            {icon && iconPosition === 'right' && (
              <MaterialCommunityIcons
                name={icon as any}
                size={iconSize}
                color={iconColor}
                style={styles.iconRight}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// =============================================================================
// STYLE HELPERS
// =============================================================================

const getButtonStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  fullWidth: boolean,
  colors: ReturnType<typeof useColors>
): ViewStyle => {
  const baseStyles: ViewStyle = {
    height: getSizeHeight(size),
    paddingHorizontal: getSizePadding(size),
    minWidth: fullWidth ? undefined : ComponentSizes.button.minWidth,
  };

  if (disabled) {
    return {
      ...baseStyles,
      backgroundColor: colors.surface.muted,
      borderColor: colors.border.light,
    };
  }

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        backgroundColor: colors.primary.main,
        ...Shadows.button,
      };
    case 'secondary':
      return {
        ...baseStyles,
        backgroundColor: colors.secondary.main,
        ...Shadows.sm,
      };
    case 'outline':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary.main,
      };
    case 'text':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        paddingHorizontal: Spacing.sm,
        minWidth: undefined,
      };
    case 'danger':
      return {
        ...baseStyles,
        backgroundColor: colors.feedback.error,
        ...Shadows.sm,
      };
    default:
      return baseStyles;
  }
};

const getTextStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  colors: ReturnType<typeof useColors>
): TextStyle => {
  const baseStyles: TextStyle = {
    fontSize: size === 'small' ? Typography.sizes.buttonSmall : Typography.sizes.button,
    fontWeight: Typography.weights.semibold,
    letterSpacing: Typography.letterSpacing.wide,
  };

  if (disabled) {
    return {
      ...baseStyles,
      color: colors.text.disabled,
    };
  }

  switch (variant) {
    case 'primary':
    case 'secondary':
    case 'danger':
      return {
        ...baseStyles,
        color: colors.primary.contrast,
      };
    case 'outline':
    case 'text':
      return {
        ...baseStyles,
        color: colors.primary.main,
      };
    default:
      return baseStyles;
  }
};

const getIconColor = (
  variant: ButtonVariant,
  disabled: boolean,
  colors: ReturnType<typeof useColors>
): string => {
  if (disabled) return colors.text.disabled;

  switch (variant) {
    case 'primary':
    case 'secondary':
    case 'danger':
      return colors.primary.contrast;
    case 'outline':
    case 'text':
      return colors.primary.main;
    default:
      return colors.primary.main;
  }
};

const getSizeHeight = (size: ButtonSize): number => {
  switch (size) {
    case 'small':
      return ComponentSizes.button.heightSmall;
    case 'large':
      return ComponentSizes.button.heightLarge;
    default:
      return ComponentSizes.button.height;
  }
};

const getSizePadding = (size: ButtonSize): number => {
  switch (size) {
    case 'small':
      return Spacing.md;
    case 'large':
      return Spacing.xl;
    default:
      return Spacing.lg;
  }
};

const getIconSize = (size: ButtonSize): number => {
  switch (size) {
    case 'small':
      return 20;
    case 'large':
      return 28;
    default:
      return ComponentSizes.button.iconSize;
  }
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});

export default Button;
