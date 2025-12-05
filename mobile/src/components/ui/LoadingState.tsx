/**
 * LoadingState Components
 *
 * Componentes para estados de carregamento
 * - Skeleton screens (preferidos sobre spinners)
 * - Loading overlay
 * - Inline loading
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Text,
  ViewStyle,
  Dimensions,
} from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// SKELETON BASE COMPONENT
// =============================================================================

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// =============================================================================
// SKELETON CARD
// =============================================================================

interface SkeletonCardProps {
  style?: ViewStyle;
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  style,
  lines = 3,
  showAvatar = false,
  showImage = false,
}) => {
  return (
    <View style={[styles.skeletonCard, style]}>
      {showImage && (
        <Skeleton
          width="100%"
          height={160}
          borderRadius={0}
          style={styles.skeletonImage}
        />
      )}

      <View style={styles.skeletonCardContent}>
        {showAvatar && (
          <View style={styles.skeletonHeader}>
            <Skeleton
              width={48}
              height={48}
              borderRadius={24}
              style={styles.skeletonAvatar}
            />
            <View style={styles.skeletonHeaderText}>
              <Skeleton width="60%" height={18} style={styles.skeletonLine} />
              <Skeleton width="40%" height={14} />
            </View>
          </View>
        )}

        {!showAvatar && <Skeleton width="70%" height={20} style={styles.skeletonLine} />}

        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 1 ? '50%' : '100%'}
            height={16}
            style={styles.skeletonLine}
          />
        ))}
      </View>
    </View>
  );
};

// =============================================================================
// SKELETON LIST
// =============================================================================

interface SkeletonListProps {
  count?: number;
  style?: ViewStyle;
  itemStyle?: ViewStyle;
  showAvatar?: boolean;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  style,
  itemStyle,
  showAvatar = true,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.skeletonListItem, itemStyle]}>
          {showAvatar && (
            <Skeleton
              width={48}
              height={48}
              borderRadius={24}
              style={styles.skeletonListAvatar}
            />
          )}
          <View style={styles.skeletonListContent}>
            <Skeleton width="70%" height={18} style={styles.skeletonLine} />
            <Skeleton width="50%" height={14} />
          </View>
          <Skeleton width={24} height={24} borderRadius={12} />
        </View>
      ))}
    </View>
  );
};

// =============================================================================
// LOADING SPINNER
// =============================================================================

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = Colors.primary.main,
  message,
  style,
}) => {
  return (
    <View style={[styles.spinnerContainer, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.spinnerMessage}>{message}</Text>}
    </View>
  );
};

// =============================================================================
// FULL SCREEN LOADING
// =============================================================================

interface FullScreenLoadingProps {
  message?: string;
  transparent?: boolean;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  message = 'Carregando...',
  transparent = false,
}) => {
  return (
    <View
      style={[
        styles.fullScreenContainer,
        transparent && styles.fullScreenTransparent,
      ]}
    >
      <View style={styles.fullScreenContent}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.fullScreenMessage}>{message}</Text>
      </View>
    </View>
  );
};

// =============================================================================
// LOADING OVERLAY
// =============================================================================

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        {message && <Text style={styles.overlayMessage}>{message}</Text>}
      </View>
    </View>
  );
};

// =============================================================================
// INLINE LOADING (for buttons, etc)
// =============================================================================

interface InlineLoadingProps {
  message?: string;
  style?: ViewStyle;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message,
  style,
}) => {
  return (
    <View style={[styles.inlineContainer, style]}>
      <ActivityIndicator size="small" color={Colors.primary.main} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
};

// =============================================================================
// PULL TO REFRESH LOADING
// =============================================================================

interface RefreshLoadingProps {
  refreshing: boolean;
}

export const RefreshLoading: React.FC<RefreshLoadingProps> = ({ refreshing }) => {
  if (!refreshing) return null;

  return (
    <View style={styles.refreshContainer}>
      <ActivityIndicator size="small" color={Colors.primary.main} />
      <Text style={styles.refreshMessage}>Atualizando...</Text>
    </View>
  );
};

// =============================================================================
// PROGRESS BAR
// =============================================================================

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = Colors.primary.main,
  backgroundColor = Colors.surface.muted,
  style,
  showLabel = false,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={style}>
      <View style={[styles.progressContainer, { height, backgroundColor }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${clampedProgress}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.progressLabel}>{Math.round(clampedProgress)}%</Text>
      )}
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Skeleton
  skeleton: {
    backgroundColor: Colors.surface.muted,
  },
  skeletonCard: {
    backgroundColor: Colors.surface.card,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  skeletonImage: {
    marginBottom: 0,
  },
  skeletonCardContent: {
    padding: Spacing.cardPadding,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  skeletonAvatar: {
    marginRight: Spacing.md,
  },
  skeletonHeaderText: {
    flex: 1,
  },
  skeletonLine: {
    marginBottom: Spacing.sm,
  },

  // Skeleton List
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  skeletonListAvatar: {
    marginRight: Spacing.md,
  },
  skeletonListContent: {
    flex: 1,
  },

  // Spinner
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  spinnerMessage: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.body,
    color: Colors.text.secondary,
  },

  // Full Screen
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface.background,
    zIndex: 1000,
  },
  fullScreenTransparent: {
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
  },
  fullScreenContent: {
    alignItems: 'center',
  },
  fullScreenMessage: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.body,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: Colors.surface.card,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    minWidth: 150,
    ...Shadows.lg,
  },
  overlayMessage: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.body,
    color: Colors.text.primary,
  },

  // Inline
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  inlineMessage: {
    marginLeft: Spacing.sm,
    fontSize: Typography.sizes.bodySmall,
    color: Colors.text.secondary,
  },

  // Refresh
  refreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  refreshMessage: {
    marginLeft: Spacing.sm,
    fontSize: Typography.sizes.bodySmall,
    color: Colors.text.secondary,
  },

  // Progress Bar
  progressContainer: {
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.round,
  },
  progressLabel: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.caption,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
});

export default {
  Skeleton,
  SkeletonCard,
  SkeletonList,
  LoadingSpinner,
  FullScreenLoading,
  LoadingOverlay,
  InlineLoading,
  RefreshLoading,
  ProgressBar,
};
