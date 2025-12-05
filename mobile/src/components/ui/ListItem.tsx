/**
 * ListItem Component
 *
 * Item de lista acessível otimizado para usuários 35-65 anos
 * - Touch target mínimo de 56px de altura
 * - Suporte a ícones, avatares e ações
 * - Feedback visual claro
 */

import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  ComponentSizes,
  Animations,
} from '../../config/theme';

// =============================================================================
// TYPES
// =============================================================================

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: string;
  leftIconColor?: string;
  leftIconBackgroundColor?: string;
  leftAvatar?: string | { uri: string };
  leftComponent?: React.ReactNode;
  rightIcon?: string;
  rightText?: string;
  rightComponent?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  compact?: boolean;
  style?: ViewStyle;
  borderBottom?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leftIcon,
  leftIconColor = Colors.primary.main,
  leftIconBackgroundColor = Colors.primary.lighter,
  leftAvatar,
  leftComponent,
  rightIcon,
  rightText,
  rightComponent,
  showChevron = false,
  onPress,
  disabled = false,
  compact = false,
  style,
  borderBottom = true,
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

  // Render left component (icon, avatar, or custom)
  const renderLeft = () => {
    if (leftComponent) {
      return <View style={styles.leftContainer}>{leftComponent}</View>;
    }

    if (leftAvatar) {
      const source = typeof leftAvatar === 'string' ? { uri: leftAvatar } : leftAvatar;
      return (
        <View style={styles.leftContainer}>
          <Image source={source} style={styles.avatar} />
        </View>
      );
    }

    if (leftIcon) {
      return (
        <View style={styles.leftContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: leftIconBackgroundColor },
            ]}
          >
            <MaterialCommunityIcons
              name={leftIcon as any}
              size={ComponentSizes.listItem.iconSize}
              color={leftIconColor}
            />
          </View>
        </View>
      );
    }

    return null;
  };

  // Render right component
  const renderRight = () => {
    return (
      <View style={styles.rightContainer}>
        {rightComponent}
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
        {rightIcon && (
          <MaterialCommunityIcons
            name={rightIcon as any}
            size={20}
            color={Colors.text.tertiary}
            style={styles.rightIcon}
          />
        )}
        {showChevron && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={Colors.text.tertiary}
          />
        )}
      </View>
    );
  };

  const content = (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        borderBottom && styles.borderBottom,
        disabled && styles.disabled,
        style,
      ]}
    >
      {renderLeft()}

      <View style={styles.contentContainer}>
        <Text
          style={[styles.title, disabled && styles.titleDisabled]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, disabled && styles.subtitleDisabled]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
        {description && (
          <Text
            style={[styles.description, disabled && styles.descriptionDisabled]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
      </View>

      {renderRight()}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.9}
          accessibilityLabel={accessibilityLabel || title}
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

  return content;
};

// =============================================================================
// DIVIDER
// =============================================================================

interface ListDividerProps {
  style?: ViewStyle;
  inset?: boolean;
}

export const ListDivider: React.FC<ListDividerProps> = ({ style, inset = false }) => {
  return (
    <View
      style={[styles.divider, inset && styles.dividerInset, style]}
    />
  );
};

// =============================================================================
// SECTION
// =============================================================================

interface ListSectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ListSection: React.FC<ListSectionProps> = ({
  title,
  children,
  style,
}) => {
  return (
    <View style={[styles.section, style]}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    minHeight: ComponentSizes.listItem.height,
    backgroundColor: Colors.surface.card,
  },
  containerCompact: {
    minHeight: ComponentSizes.listItem.heightCompact,
    paddingVertical: Spacing.sm,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  disabled: {
    opacity: 0.5,
  },

  // Left
  leftContainer: {
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: ComponentSizes.listItem.avatarSize,
    height: ComponentSizes.listItem.avatarSize,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: ComponentSizes.listItem.avatarSize,
    height: ComponentSizes.listItem.avatarSize,
    borderRadius: ComponentSizes.listItem.avatarSize / 2,
  },

  // Content
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  titleDisabled: {
    color: Colors.text.disabled,
  },
  subtitle: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  subtitleDisabled: {
    color: Colors.text.disabled,
  },
  description: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.tertiary,
    lineHeight: Typography.sizes.caption * Typography.lineHeight.normal,
  },
  descriptionDisabled: {
    color: Colors.text.disabled,
  },

  // Right
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  rightText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.text.secondary,
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginRight: Spacing.xs,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
  },
  dividerInset: {
    marginLeft: Spacing.screenPadding + ComponentSizes.listItem.avatarSize + Spacing.md,
  },

  // Section
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wide,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface.muted,
  },
  sectionContent: {
    backgroundColor: Colors.surface.card,
  },
});

export default ListItem;
