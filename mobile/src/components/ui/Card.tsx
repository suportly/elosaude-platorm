/**
 * Card Component
 *
 * Container de conteúdo com estilo de cartão
 * - Bordas arredondadas (16px)
 * - Sombra suave
 * - Variantes: default, elevated, outlined, interactive
 * - Suporte a pressão para cards clicáveis
 */

import React, { useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
  Animations,
} from '../../config/theme';

// =============================================================================
// TYPES
// =============================================================================

type CardVariant = 'default' | 'elevated' | 'outlined' | 'flat';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
  contentStyle,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (onPress && !disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  }, [scaleAnim, onPress, disabled]);

  const handlePressOut = useCallback(() => {
    if (onPress && !disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  }, [scaleAnim, onPress, disabled]);

  const cardStyles = getCardStyles(variant, disabled);

  const content = (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  if (onPress) {
    return (
      <Animated.View
        style={[
          styles.card,
          cardStyles,
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.9}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          testID={testID}
        >
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View
      style={[styles.card, cardStyles, style]}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {content}
    </View>
  );
};

// =============================================================================
// CARD HEADER COMPONENT
// =============================================================================

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  left,
  right,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      {left && <View style={styles.headerLeft}>{left}</View>}
      <View style={styles.headerContent}>
        <Animated.Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Animated.Text>
        {subtitle && (
          <Animated.Text style={styles.headerSubtitle} numberOfLines={1}>
            {subtitle}
          </Animated.Text>
        )}
      </View>
      {right && <View style={styles.headerRight}>{right}</View>}
    </View>
  );
};

// =============================================================================
// CARD CONTENT COMPONENT
// =============================================================================

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  return <View style={[styles.cardContent, style]}>{children}</View>;
};

// =============================================================================
// CARD ACTIONS COMPONENT
// =============================================================================

interface CardActionsProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardActions: React.FC<CardActionsProps> = ({ children, style }) => {
  return <View style={[styles.actions, style]}>{children}</View>;
};

// =============================================================================
// STYLE HELPERS
// =============================================================================

const getCardStyles = (variant: CardVariant, disabled: boolean): ViewStyle => {
  const baseStyles: ViewStyle = {
    backgroundColor: Colors.surface.card,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
  };

  if (disabled) {
    return {
      ...baseStyles,
      opacity: 0.6,
    };
  }

  switch (variant) {
    case 'elevated':
      return {
        ...baseStyles,
        ...Shadows.lg,
      };
    case 'outlined':
      return {
        ...baseStyles,
        borderWidth: 1,
        borderColor: Colors.border.light,
        ...Shadows.none,
      };
    case 'flat':
      return {
        ...baseStyles,
        ...Shadows.none,
      };
    default:
      return {
        ...baseStyles,
        ...Shadows.card,
      };
  }
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  touchable: {
    flex: 1,
  },
  content: {
    padding: Spacing.cardPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.cardPadding,
    paddingTop: Spacing.cardPadding,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  headerRight: {
    marginLeft: Spacing.md,
  },
  cardContent: {
    paddingHorizontal: Spacing.cardPadding,
    paddingBottom: Spacing.cardPadding,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
});

export default Card;
