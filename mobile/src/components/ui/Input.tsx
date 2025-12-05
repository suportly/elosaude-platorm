/**
 * Input Component
 *
 * Campo de entrada acessível otimizado para usuários 35-65 anos
 * - Altura de 56px para touch target confortável
 * - Label sempre visível (não usa placeholder como label)
 * - Estados visuais claros: default, focus, error, disabled
 * - Mensagens de erro amigáveis
 * - Suporte a ícones e máscaras
 */

import React, { useState, useRef, useCallback, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
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

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  disabled?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  mask?: (text: string) => string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      value,
      onChangeText,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      disabled = false,
      required = false,
      containerStyle,
      inputStyle,
      mask,
      onFocus,
      onBlur,
      secureTextEntry,
      ...textInputProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const borderColorAnim = useRef(new Animated.Value(0)).current;

    // Handle focus animation
    const handleFocus = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(true);
        Animated.timing(borderColorAnim, {
          toValue: 1,
          duration: Animations.duration.fast,
          useNativeDriver: false,
        }).start();
        onFocus?.(e);
      },
      [borderColorAnim, onFocus]
    );

    const handleBlur = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(false);
        Animated.timing(borderColorAnim, {
          toValue: 0,
          duration: Animations.duration.fast,
          useNativeDriver: false,
        }).start();
        onBlur?.(e);
      },
      [borderColorAnim, onBlur]
    );

    // Handle text change with mask
    const handleChangeText = useCallback(
      (text: string) => {
        const maskedText = mask ? mask(text) : text;
        onChangeText(maskedText);
      },
      [mask, onChangeText]
    );

    // Toggle password visibility
    const togglePasswordVisibility = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    // Determine border color
    const borderColor = borderColorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        error ? Colors.feedback.error : Colors.border.medium,
        error ? Colors.feedback.error : Colors.border.focus,
      ],
    });

    // Determine if using secure text
    const isSecure = secureTextEntry && !showPassword;

    // Determine right icon (password toggle or custom)
    const effectiveRightIcon = secureTextEntry
      ? showPassword
        ? 'eye-off'
        : 'eye'
      : rightIcon;
    const effectiveRightIconPress = secureTextEntry
      ? togglePasswordVisibility
      : onRightIconPress;

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.label,
              isFocused && styles.labelFocused,
              error && styles.labelError,
              disabled && styles.labelDisabled,
            ]}
          >
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>

        {/* Input Container */}
        <Animated.View
          style={[
            styles.inputContainer,
            { borderColor },
            disabled && styles.inputContainerDisabled,
            error && styles.inputContainerError,
          ]}
        >
          {/* Left Icon */}
          {leftIcon && (
            <MaterialCommunityIcons
              name={leftIcon as any}
              size={ComponentSizes.input.iconSize}
              color={
                disabled
                  ? Colors.text.disabled
                  : isFocused
                  ? Colors.primary.main
                  : Colors.text.tertiary
              }
              style={styles.leftIcon}
            />
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              effectiveRightIcon && styles.inputWithRightIcon,
              disabled && styles.inputDisabled,
              inputStyle,
            ]}
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus as any}
            onBlur={handleBlur as any}
            editable={!disabled}
            secureTextEntry={isSecure}
            placeholderTextColor={Colors.text.tertiary}
            selectionColor={Colors.primary.main}
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            {...textInputProps}
          />

          {/* Right Icon */}
          {effectiveRightIcon && (
            <TouchableOpacity
              onPress={effectiveRightIconPress}
              style={styles.rightIconButton}
              disabled={!effectiveRightIconPress}
              accessibilityLabel={
                secureTextEntry
                  ? showPassword
                    ? 'Ocultar senha'
                    : 'Mostrar senha'
                  : undefined
              }
            >
              <MaterialCommunityIcons
                name={effectiveRightIcon as any}
                size={ComponentSizes.input.iconSize}
                color={
                  disabled
                    ? Colors.text.disabled
                    : isFocused
                    ? Colors.primary.main
                    : Colors.text.tertiary
                }
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Error or Hint Message */}
        {(error || hint) && (
          <View style={styles.messageContainer}>
            {error && (
              <MaterialCommunityIcons
                name="alert-circle"
                size={16}
                color={Colors.feedback.error}
                style={styles.messageIcon}
              />
            )}
            <Text style={[styles.message, error ? styles.errorMessage : styles.hintMessage]}>
              {error || hint}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelContainer: {
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.label,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
    letterSpacing: Typography.letterSpacing.wide,
  },
  labelFocused: {
    color: Colors.primary.main,
  },
  labelError: {
    color: Colors.feedback.error,
  },
  labelDisabled: {
    color: Colors.text.disabled,
  },
  required: {
    color: Colors.feedback.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ComponentSizes.input.height,
    borderWidth: 1.5,
    borderRadius: BorderRadius.input,
    backgroundColor: Colors.surface.card,
    paddingHorizontal: Spacing.inputPadding,
  },
  inputContainerDisabled: {
    backgroundColor: Colors.surface.muted,
    borderColor: Colors.border.light,
  },
  inputContainerError: {
    borderColor: Colors.feedback.error,
    backgroundColor: Colors.feedback.errorLight,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.input,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.sm,
  },
  inputDisabled: {
    color: Colors.text.disabled,
  },
  rightIconButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  messageIcon: {
    marginRight: Spacing.xs,
  },
  message: {
    flex: 1,
    fontSize: Typography.sizes.caption,
  },
  errorMessage: {
    color: Colors.feedback.error,
  },
  hintMessage: {
    color: Colors.text.tertiary,
  },
});

export default Input;
