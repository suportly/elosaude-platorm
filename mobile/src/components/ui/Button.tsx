/**
 * Button Component
 *
 * Botão acessível otimizado para usuários 35-65 anos
 * - Touch target mínimo de 56px de altura
 * - Feedback visual claro com animação de press
 * - Variantes: primary, secondary, outline, text
 * - Estados: default, loading, disabled
 */

import React, { useCallback } from 'react';
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

  // Get styles based on variant and size
  const buttonStyles = getButtonStyles(variant, size, disabled, fullWidth);
  const textStyles = getTextStyles(variant, size, disabled);
  const iconColor = getIconColor(variant, disabled);
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
            color={variant === 'primary' || variant === 'danger' ? Colors.primary.contrast : Colors.primary.main}
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
  fullWidth: boolean
): ViewStyle => {
  const baseStyles: ViewStyle = {
    height: getSizeHeight(size),
    paddingHorizontal: getSizePadding(size),
    minWidth: fullWidth ? undefined : ComponentSizes.button.minWidth,
  };

  if (disabled) {
    return {
      ...baseStyles,
      backgroundColor: Colors.surface.muted,
      borderColor: Colors.border.light,
    };
  }

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        backgroundColor: Colors.primary.main,
        ...Shadows.button,
      };
    case 'secondary':
      return {
        ...baseStyles,
        backgroundColor: Colors.secondary.main,
        ...Shadows.sm,
      };
    case 'outline':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.primary.main,
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
        backgroundColor: Colors.feedback.error,
        ...Shadows.sm,
      };
    default:
      return baseStyles;
  }
};

const getTextStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean
): TextStyle => {
  const baseStyles: TextStyle = {
    fontSize: size === 'small' ? Typography.sizes.buttonSmall : Typography.sizes.button,
    fontWeight: Typography.weights.semibold,
    letterSpacing: Typography.letterSpacing.wide,
  };

  if (disabled) {
    return {
      ...baseStyles,
      color: Colors.text.disabled,
    };
  }

  switch (variant) {
    case 'primary':
    case 'secondary':
    case 'danger':
      return {
        ...baseStyles,
        color: Colors.primary.contrast,
      };
    case 'outline':
    case 'text':
      return {
        ...baseStyles,
        color: Colors.primary.main,
      };
    default:
      return baseStyles;
  }
};

const getIconColor = (variant: ButtonVariant, disabled: boolean): string => {
  if (disabled) return Colors.text.disabled;

  switch (variant) {
    case 'primary':
    case 'secondary':
    case 'danger':
      return Colors.primary.contrast;
    case 'outline':
    case 'text':
      return Colors.primary.main;
    default:
      return Colors.primary.main;
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
