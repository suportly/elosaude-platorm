/**
 * StatusBadge Component
 *
 * Badge para indicar status de itens (guias, reembolsos, etc.)
 * - Cores semânticas para cada status
 * - Ícone opcional
 * - Tamanhos variados
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  getStatusColor,
  getStatusBackgroundColor,
} from '../../config/theme';

// =============================================================================
// TYPES
// =============================================================================

type BadgeSize = 'small' | 'medium' | 'large';

type StatusType =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'under_review'
  | 'draft'
  | 'cancelled'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: BadgeSize;
  showIcon?: boolean;
  icon?: string;
  style?: ViewStyle;
}

// =============================================================================
// STATUS CONFIG
// =============================================================================

const statusConfig: Record<
  string,
  { label: string; icon: string; color: string; backgroundColor: string }
> = {
  approved: {
    label: 'Aprovado',
    icon: 'check-circle',
    color: Colors.status.approved,
    backgroundColor: Colors.feedback.successLight,
  },
  pending: {
    label: 'Pendente',
    icon: 'clock-outline',
    color: Colors.status.pending,
    backgroundColor: Colors.feedback.warningLight,
  },
  rejected: {
    label: 'Rejeitado',
    icon: 'close-circle',
    color: Colors.status.rejected,
    backgroundColor: Colors.feedback.errorLight,
  },
  under_review: {
    label: 'Em Análise',
    icon: 'file-search',
    color: Colors.status.underReview,
    backgroundColor: Colors.feedback.infoLight,
  },
  draft: {
    label: 'Rascunho',
    icon: 'file-edit',
    color: Colors.status.draft,
    backgroundColor: Colors.surface.muted,
  },
  cancelled: {
    label: 'Cancelado',
    icon: 'cancel',
    color: Colors.status.cancelled,
    backgroundColor: Colors.surface.muted,
  },
  success: {
    label: 'Sucesso',
    icon: 'check-circle',
    color: Colors.feedback.success,
    backgroundColor: Colors.feedback.successLight,
  },
  warning: {
    label: 'Atenção',
    icon: 'alert',
    color: Colors.feedback.warning,
    backgroundColor: Colors.feedback.warningLight,
  },
  error: {
    label: 'Erro',
    icon: 'alert-circle',
    color: Colors.feedback.error,
    backgroundColor: Colors.feedback.errorLight,
  },
  info: {
    label: 'Informação',
    icon: 'information',
    color: Colors.feedback.info,
    backgroundColor: Colors.feedback.infoLight,
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'medium',
  showIcon = true,
  icon,
  style,
}) => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  const config = statusConfig[normalizedStatus] || {
    label: status,
    icon: 'circle',
    color: Colors.text.secondary,
    backgroundColor: Colors.surface.muted,
  };

  const displayLabel = label || config.label;
  const displayIcon = icon || config.icon;
  const sizeStyles = getSizeStyles(size);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        sizeStyles.container,
        style,
      ]}
      accessibilityLabel={`Status: ${displayLabel}`}
    >
      {showIcon && (
        <MaterialCommunityIcons
          name={displayIcon as any}
          size={sizeStyles.iconSize}
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text
        style={[styles.label, { color: config.color }, sizeStyles.label]}
        numberOfLines={1}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

// =============================================================================
// DOT BADGE (simpler version)
// =============================================================================

interface DotBadgeProps {
  status: StatusType | string;
  label?: string;
  style?: ViewStyle;
}

export const DotBadge: React.FC<DotBadgeProps> = ({ status, label, style }) => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  const config = statusConfig[normalizedStatus] || {
    label: status,
    color: Colors.text.secondary,
  };

  const displayLabel = label || config.label;

  return (
    <View style={[styles.dotContainer, style]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={styles.dotLabel}>{displayLabel}</Text>
    </View>
  );
};

// =============================================================================
// COUNT BADGE (for notifications, etc)
// =============================================================================

interface CountBadgeProps {
  count: number;
  maxCount?: number;
  color?: string;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  maxCount = 99,
  color = Colors.feedback.error,
  size = 'medium',
  style,
}) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.countContainer,
        { backgroundColor: color },
        isSmall && styles.countContainerSmall,
        style,
      ]}
    >
      <Text style={[styles.countLabel, isSmall && styles.countLabelSmall]}>
        {displayCount}
      </Text>
    </View>
  );
};

// =============================================================================
// STYLE HELPERS
// =============================================================================

const getSizeStyles = (size: BadgeSize) => {
  switch (size) {
    case 'small':
      return {
        container: {
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xxs,
          borderRadius: BorderRadius.sm,
        },
        label: {
          fontSize: Typography.sizes.badge,
        },
        iconSize: 12,
      };
    case 'large':
      return {
        container: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: BorderRadius.md,
        },
        label: {
          fontSize: Typography.sizes.bodySmall,
        },
        iconSize: 18,
      };
    default:
      return {
        container: {
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
          borderRadius: BorderRadius.sm,
        },
        label: {
          fontSize: Typography.sizes.caption,
        },
        iconSize: 14,
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
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Spacing.xxs,
  },
  label: {
    fontWeight: Typography.weights.semibold,
  },

  // Dot Badge
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  dotLabel: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.text.secondary,
  },

  // Count Badge
  countContainer: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  countContainerSmall: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  countLabel: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  countLabelSmall: {
    fontSize: 9,
  },
});

export default StatusBadge;
