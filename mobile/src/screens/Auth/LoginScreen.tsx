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
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentSizes,
} from '../../config/theme';
import { Input, Button } from '../../components/ui';
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
  const insets = useSafeAreaInsets();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + Spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/elosaude_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.welcomeTitle}>Bem-vindo de volta</Text>
          <Text style={styles.welcomeSubtitle}>
            Entre com seu CPF e senha para acessar sua conta
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Input
            label="CPF"
            value={cpf}
            onChangeText={handleCPFChange}
            error={cpfError}
            leftIcon="account-outline"
            keyboardType="numeric"
            maxLength={14}
            placeholder="000.000.000-00"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            autoCapitalize="none"
            autoCorrect={false}
            disabled={isLoading}
            accessibilityLabel="CPF"
            accessibilityHint="Digite seu CPF com 11 dígitos"
          />

          <Input
            ref={passwordInputRef}
            label="Senha"
            value={password}
            onChangeText={handlePasswordChange}
            error={passwordError}
            leftIcon="lock-outline"
            secureTextEntry
            placeholder="Digite sua senha"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            autoCapitalize="none"
            autoCorrect={false}
            disabled={isLoading}
            accessibilityLabel="Senha"
            accessibilityHint="Digite sua senha de acesso"
          />

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            size="large"
            style={styles.loginButton}
            accessibilityLabel="Entrar na conta"
            accessibilityHint="Toque para fazer login com as credenciais informadas"
          />

          {/* Links */}
          <View style={styles.linksContainer}>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('ForgotPassword' as never)}
              accessibilityRole="link"
              accessibilityLabel="Esqueci minha senha"
            >
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={20}
                color={Colors.primary.main}
              />
              <Text style={styles.linkText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('FirstAccess' as never)}
              accessibilityRole="link"
              accessibilityLabel="Primeiro acesso"
            >
              <MaterialCommunityIcons
                name="account-plus-outline"
                size={20}
                color={Colors.primary.main}
              />
              <Text style={styles.linkText}>Primeiro acesso</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Credentials Card */}
        <View style={styles.demoCard}>
          <View style={styles.demoHeader}>
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color={Colors.primary.main}
            />
            <Text style={styles.demoTitle}>Acesso Demonstração</Text>
          </View>
          <View style={styles.demoCredentials}>
            <View style={styles.demoRow}>
              <Text style={styles.demoLabel}>CPF:</Text>
              <Text style={styles.demoValue}>951.974.949-72</Text>
            </View>
            <View style={styles.demoRow}>
              <Text style={styles.demoLabel}>Senha:</Text>
              <Text style={styles.demoValue}>Demo@123</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ao entrar, você concorda com nossos
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Terms' as never)}
            accessibilityRole="link"
          >
            <Text style={styles.footerLink}>Termos de Uso</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xxl,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  logo: {
    width: 80,
    height: 80,
  },
  welcomeTitle: {
    fontSize: Typography.sizes.h2,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: Typography.sizes.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.body * Typography.lineHeight.normal,
    maxWidth: 280,
  },

  // Form
  formContainer: {
    backgroundColor: Colors.surface.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.cardPadding,
    ...Shadows.md,
  },
  loginButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // Links
  linksContainer: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  linkText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.main,
    fontWeight: Typography.weights.medium,
  },

  // Demo Card
  demoCard: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary.lighter,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary.light,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  demoTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.dark,
  },
  demoCredentials: {
    gap: Spacing.xs,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoLabel: {
    fontSize: Typography.sizes.body,
    color: Colors.text.secondary,
    width: 60,
  },
  demoValue: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.main,
  },

  // Footer
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  footerLink: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.primary.main,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xxs,
  },
});
