/**
 * Toast Components
 *
 * Componentes de feedback visual para ações do usuário
 * - SuccessToast: Confirmação de ação bem-sucedida
 * - ErrorToast: Notificação de erro
 * - InfoToast: Informação geral
 * - WarningToast: Alerta de atenção
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Animations,
} from '../../config/theme';
import { useColors } from '../../config/ThemeContext';

// =============================================================================
// TYPES
// =============================================================================

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  position?: 'top' | 'bottom';
  style?: ViewStyle;
}

// =============================================================================
// TOAST COMPONENT
// =============================================================================

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  action,
  position = 'bottom',
  style,
}) => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const config = getToastConfig(type, colors);

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: Animations.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0 && onDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: position === 'top' ? -100 : 100,
          duration: Animations.duration.fast,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: Animations.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, duration, onDismiss, position]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: Animations.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: Animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  if (!visible) return null;

  const positionStyle = position === 'top'
    ? { top: insets.top + Spacing.md }
    : { bottom: insets.bottom + Spacing.md };

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyle,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
        style,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: config.iconBackground }]}>
          <MaterialCommunityIcons
            name={config.icon as any}
            size={24}
            color={config.iconColor}
          />
        </View>
        <Text style={[styles.message, { color: config.textColor }]} numberOfLines={2}>
          {message}
        </Text>
      </View>

      <View style={styles.actions}>
        {action && (
          <TouchableOpacity
            onPress={action.onPress}
            style={styles.actionButton}
            accessibilityLabel={action.label}
            accessibilityRole="button"
          >
            <Text style={[styles.actionText, { color: config.actionColor }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.dismissButton}
          accessibilityLabel="Fechar"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={config.textColor}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// =============================================================================
// SPECIALIZED TOAST COMPONENTS
// =============================================================================

interface SimpleToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  onDismiss?: () => void;
  position?: 'top' | 'bottom';
}

export const SuccessToast: React.FC<SimpleToastProps> = (props) => (
  <Toast {...props} type="success" />
);

export const ErrorToast: React.FC<SimpleToastProps> = (props) => (
  <Toast {...props} type="error" />
);

export const InfoToast: React.FC<SimpleToastProps> = (props) => (
  <Toast {...props} type="info" />
);

export const WarningToast: React.FC<SimpleToastProps> = (props) => (
  <Toast {...props} type="warning" />
);

// =============================================================================
// HELPERS
// =============================================================================

interface ToastConfig {
  icon: string;
  backgroundColor: string;
  iconBackground: string;
  iconColor: string;
  textColor: string;
  actionColor: string;
}

const getToastConfig = (
  type: ToastType,
  colors: ReturnType<typeof useColors>
): ToastConfig => {
  switch (type) {
    case 'success':
      return {
        icon: 'check-circle',
        backgroundColor: colors.feedback.successLight,
        iconBackground: colors.feedback.success,
        iconColor: colors.primary.contrast,
        textColor: colors.text.primary,
        actionColor: colors.feedback.success,
      };
    case 'error':
      return {
        icon: 'alert-circle',
        backgroundColor: colors.feedback.errorLight,
        iconBackground: colors.feedback.error,
        iconColor: colors.primary.contrast,
        textColor: colors.text.primary,
        actionColor: colors.feedback.error,
      };
    case 'warning':
      return {
        icon: 'alert',
        backgroundColor: colors.feedback.warningLight,
        iconBackground: colors.feedback.warning,
        iconColor: colors.text.primary,
        textColor: colors.text.primary,
        actionColor: colors.feedback.warning,
      };
    case 'info':
    default:
      return {
        icon: 'information',
        backgroundColor: colors.feedback.infoLight,
        iconBackground: colors.feedback.info,
        iconColor: colors.primary.contrast,
        textColor: colors.text.primary,
        actionColor: colors.feedback.info,
      };
  }
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.lg,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  message: {
    flex: 1,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.sizes.body * 1.4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  actionButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
  },
  dismissButton: {
    padding: Spacing.xs,
  },
});

export default Toast;
