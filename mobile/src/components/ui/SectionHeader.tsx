/**
 * SectionHeader Component
 *
 * Cabeçalho de seção com título, subtítulo e ações opcionais
 * - Hierarquia visual clara
 * - Ação "Ver tudo" opcional
 * - Ícone opcional
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';

// =============================================================================
// TYPES
// =============================================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

// =============================================================================
// COMPONENT
// =============================================================================

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  actionLabel,
  onAction,
  style,
  size = 'medium',
}) => {
  const sizeStyles = getSizeStyles(size);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContent}>
        {icon && (
          <View style={[styles.iconContainer, sizeStyles.iconContainer]}>
            <MaterialCommunityIcons
              name={icon as any}
              size={sizeStyles.iconSize}
              color={Colors.primary.main}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, sizeStyles.title]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, sizeStyles.subtitle]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={Colors.primary.main}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// =============================================================================
// DIVIDER SECTION HEADER (with line)
// =============================================================================

interface DividerHeaderProps {
  title: string;
  style?: ViewStyle;
}

export const DividerHeader: React.FC<DividerHeaderProps> = ({ title, style }) => {
  return (
    <View style={[styles.dividerContainer, style]}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerTitle}>{title}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
};

// =============================================================================
// COLLAPSIBLE SECTION HEADER
// =============================================================================

interface CollapsibleHeaderProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  count?: number;
  style?: ViewStyle;
}

export const CollapsibleHeader: React.FC<CollapsibleHeaderProps> = ({
  title,
  isExpanded,
  onToggle,
  count,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.collapsibleContainer, style]}
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityLabel={`${title}${count ? `, ${count} itens` : ''}`}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
    >
      <View style={styles.collapsibleLeft}>
        <Text style={styles.collapsibleTitle}>{title}</Text>
        {count !== undefined && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
      <MaterialCommunityIcons
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={24}
        color={Colors.text.secondary}
      />
    </TouchableOpacity>
  );
};

// =============================================================================
// STYLE HELPERS
// =============================================================================

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        title: {
          fontSize: Typography.sizes.body,
          fontWeight: '600' as const,
        },
        subtitle: {
          fontSize: Typography.sizes.caption,
        },
        iconSize: 20,
        iconContainer: {
          width: 32,
          height: 32,
          borderRadius: 8,
        },
      };
    case 'large':
      return {
        title: {
          fontSize: Typography.sizes.h2,
          fontWeight: '700' as const,
        },
        subtitle: {
          fontSize: Typography.sizes.body,
        },
        iconSize: 28,
        iconContainer: {
          width: 48,
          height: 48,
          borderRadius: 12,
        },
      };
    default:
      return {
        title: {
          fontSize: Typography.sizes.h3,
          fontWeight: '600' as const,
        },
        subtitle: {
          fontSize: Typography.sizes.bodySmall,
        },
        iconSize: 24,
        iconContainer: {
          width: 40,
          height: 40,
          borderRadius: 10,
        },
      };
  }
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.lighter,
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    color: Colors.text.secondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginLeft: Spacing.md,
  },
  actionLabel: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.primary.main,
    marginRight: Spacing.xxs,
  },

  // Divider Header
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.light,
  },
  dividerTitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: Colors.text.tertiary,
    paddingHorizontal: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wide,
  },

  // Collapsible Header
  collapsibleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    backgroundColor: Colors.surface.muted,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  collapsibleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  collapsibleTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  countBadge: {
    marginLeft: Spacing.sm,
    backgroundColor: Colors.primary.lighter,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.round,
  },
  countText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.main,
  },
});

export default SectionHeader;
