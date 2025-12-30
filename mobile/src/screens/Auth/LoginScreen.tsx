/**
 * LoginScreen - Tela de Login
 *
 * Redesign UX/UI otimizado para usuários 35-65 anos:
 * - Formulário simples e claro
 * - Inputs de 56px de altura
 * - Mensagens de erro amigáveis
 * - CTA primário destacado
 * - Links secundários acessíveis
 */

import { useNavigation } from '@react-navigation/native';
import React, { useState, useCallback, useRef } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import {
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentSizes,
} from '../../config/theme';
import { useColors } from '../../config/ThemeContext';
import { useLoginMutation } from '../../store/services/api';
import { setCredentials } from '../../store/slices/authSlice';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return value.slice(0, 14);
};

const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.length === 11;
};

const getErrorMessage = (error: any): { title: string; message: string } => {
  if (error?.status === 'FETCH_ERROR' || error?.error?.includes('Network request failed')) {
    return {
      title: 'Sem conexão',
      message: 'Verifique sua conexão com a internet e tente novamente.',
    };
  }

  if (error?.data?.non_field_errors) {
    const errors = error.data.non_field_errors;
    return {
      title: 'CPF ou senha incorretos',
      message: Array.isArray(errors) ? errors[0] : errors,
    };
  }

  if (error?.data?.cpf) {
    return {
      title: 'CPF inválido',
      message: Array.isArray(error.data.cpf) ? error.data.cpf[0] : error.data.cpf,
    };
  }

  if (error?.data?.password) {
    return {
      title: 'Senha incorreta',
      message: Array.isArray(error.data.password) ? error.data.password[0] : error.data.password,
    };
  }

  if (error?.data?.error) {
    return {
      title: 'Erro no login',
      message: error.data.error,
    };
  }

  if (error?.data?.detail) {
    return {
      title: 'Erro no login',
      message: error.data.detail,
    };
  }

  if (error?.status >= 500) {
    return {
      title: 'Servidor indisponível',
      message: 'Tente novamente em alguns minutos.',
    };
  }

  return {
    title: 'Não foi possível entrar',
    message: 'Verifique suas credenciais e tente novamente.',
  };
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colors = useColors();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [login, { isLoading }] = useLoginMutation();

  const passwordInputRef = useRef<any>(null);

  const handleCPFChange = useCallback((text: string) => {
    const formatted = formatCPF(text);
    setCpf(formatted);
    if (cpfError) setCpfError('');
  }, [cpfError]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  }, [passwordError]);

  const handleLogin = useCallback(async () => {
    // Reset errors
    setCpfError('');
    setPasswordError('');

    // Validate fields
    if (!cpf.trim()) {
      setCpfError('Digite seu CPF');
      return;
    }

    if (!validateCPF(cpf)) {
      setCpfError('CPF deve ter 11 dígitos');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Digite sua senha');
      return;
    }

    try {
      const result = await login({ cpf, password }).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
          beneficiary: result.beneficiary,
          access: result.access,
          refresh: result.refresh,
        })
      );
    } catch (error: any) {
      const { title, message } = getErrorMessage(error);

      if (error?.data?.cpf) {
        setCpfError(Array.isArray(error.data.cpf) ? error.data.cpf[0] : error.data.cpf);
      }
      if (error?.data?.password) {
        setPasswordError(Array.isArray(error.data.password) ? error.data.password[0] : error.data.password);
      }

      Alert.alert(title, message);
    }
  }, [cpf, password, login, dispatch]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: Spacing.screenPadding,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    logoImage: {
      width: 160,
      height: 80,
      marginBottom: Spacing.md,
    },
    title: {
      color: colors.primary.main,
      fontWeight: Typography.weights.bold,
      fontSize: Typography.sizes.h2,
      marginBottom: Spacing.sm,
    },
    subtitle: {
      color: colors.text.secondary,
      fontSize: Typography.sizes.body,
      textAlign: 'center',
      paddingHorizontal: Spacing.screenPadding,
    },
    formContainer: {
      backgroundColor: colors.surface.card,
      borderRadius: BorderRadius.card,
      padding: Spacing.lg,
      ...Shadows.card,
    },
    input: {
      marginBottom: Spacing.sm,
      backgroundColor: colors.surface.card,
    },
    button: {
      marginTop: Spacing.md,
      backgroundColor: colors.primary.main,
      minHeight: ComponentSizes.touchTarget,
    },
    buttonContent: {
      paddingVertical: Spacing.sm,
      minHeight: ComponentSizes.touchTarget,
    },
    linksContainer: {
      marginTop: Spacing.lg,
      gap: Spacing.sm,
    },
    linkButton: {
      minHeight: ComponentSizes.touchTarget,
    },
    footerText: {
      fontSize: Typography.sizes.bodySmall,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginTop: Spacing.xl,
    },
    footerLink: {
      fontSize: Typography.sizes.bodySmall,
      color: colors.primary.main,
      fontWeight: Typography.weights.medium,
      textAlign: 'center',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/elosaude_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text variant="headlineSmall" style={styles.title}>
            Bem-vindo
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Entre com seu CPF e senha para acessar sua conta
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="CPF"
            value={cpf}
            onChangeText={handleCPFChange}
            keyboardType="numeric"
            maxLength={14}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
            placeholder="000.000.000-00"
            error={!!cpfError}
            disabled={isLoading}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            accessibilityLabel="Campo de CPF"
            accessibilityHint="Digite seu CPF com 11 dígitos"
          />
          <HelperText type="error" visible={!!cpfError}>
            {cpfError}
          </HelperText>

          <TextInput
            ref={passwordInputRef}
            label="Senha"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              />
            }
            placeholder="Digite sua senha"
            error={!!passwordError}
            disabled={isLoading}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            accessibilityLabel="Campo de Senha"
            accessibilityHint="Digite sua senha de acesso"
          />
          <HelperText type="error" visible={!!passwordError}>
            {passwordError}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            accessibilityLabel="Entrar na conta"
            accessibilityHint="Toque para fazer login com as credenciais informadas"
          >
            Entrar
          </Button>

          <View style={styles.linksContainer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword' as never)}
              disabled={isLoading}
              style={styles.linkButton}
              icon="help-circle-outline"
              accessibilityLabel="Esqueci minha senha"
              accessibilityHint="Abre a tela para recuperar sua senha"
            >
              Esqueci minha senha
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('FirstAccess' as never)}
              disabled={isLoading}
              style={styles.linkButton}
              icon="account-plus-outline"
              accessibilityLabel="Primeiro acesso"
              accessibilityHint="Abre a tela para ativar sua conta pela primeira vez"
            >
              Primeiro acesso
            </Button>
          </View>
        </View>

        <Text style={styles.footerText}>
          Ao entrar, você concorda com nossos
        </Text>
        <Text
          style={styles.footerLink}
          onPress={() => navigation.navigate('Terms' as never)}
          accessibilityRole="link"
        >
          Termos de Uso
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
