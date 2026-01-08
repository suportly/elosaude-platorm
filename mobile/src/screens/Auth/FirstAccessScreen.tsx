import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, HelperText, Text, TextInput, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '../../config/ThemeContext';
import { Typography, Spacing, BorderRadius, Shadows, ComponentSizes } from '../../config/theme';
import { API_URL } from '../../config/api';

export default function FirstAccessScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  const [step, setStep] = useState(1); // 1: CPF, 2: Token, 3: Senha
  const [cpf, setCpf] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  // Resend state
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [maxResends] = useState(5);
  const [isResending, setIsResending] = useState(false);

  const [cpfError, setCpfError] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return cpf;
  };

  const handleCPFChange = (text: string) => {
    const formatted = formatCPF(text);
    setCpf(formatted);
    if (cpfError) setCpfError('');
  };

  const handleCodeChange = (text: string) => {
    // Only allow digits and limit to 6
    const digits = text.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(digits);
    if (tokenError) setTokenError('');
  };

  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) {
      setCpfError('CPF deve conter 11 dígitos');
      return false;
    }
    return true;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Email inválido');
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    setCpfError('');
    setRegistrationError('');
    setEmailError('');

    if (!cpf.trim()) {
      setCpfError('CPF é obrigatório');
      return false;
    }

    if (!validateCPF(cpf)) {
      return false;
    }

    if (!registrationNumber.trim()) {
      setRegistrationError('Número de matrícula é obrigatório');
      return false;
    }

    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      return false;
    }

    if (!validateEmail(email)) {
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    setTokenError('');

    if (!verificationCode.trim()) {
      setTokenError('Código de verificação é obrigatório');
      return false;
    }

    if (verificationCode.length !== 6) {
      setTokenError('Código deve ter 6 dígitos');
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    setPasswordError('');
    setConfirmPasswordError('');

    if (!newPassword.trim()) {
      setPasswordError('Senha é obrigatória');
      return false;
    }

    if (newPassword.length < 8) {
      setPasswordError('Senha deve ter no mínimo 8 caracteres');
      return false;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Senha deve conter pelo menos uma letra maiúscula');
      return false;
    }

    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('Senha deve conter pelo menos uma letra minúscula');
      return false;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('Senha deve conter pelo menos um número');
      return false;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirmação de senha é obrigatória');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleRequestActivation = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/accounts/first-access/request/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''),
          registration_number: registrationNumber,
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMaskedEmail(data.email_masked || email);
        setResendCountdown(60); // Start 60 second countdown
        setResendCount(0);
        Alert.alert(
          'Código Enviado',
          `Um código de verificação foi enviado para ${data.email_masked || 'seu email'}. O código expira em 10 minutos.`,
          [{ text: 'OK', onPress: () => setStep(2) }]
        );
      } else {
        const errorMessage = data.error || 'Não foi possível enviar o código. Verifique seus dados.';
        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = useCallback(async () => {
    if (resendCountdown > 0 || isResending) return;

    setIsResending(true);

    try {
      const response = await fetch(`${API_URL}/accounts/first-access/resend/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendCount(data.resend_count || resendCount + 1);
        setResendCountdown(60);
        setVerificationCode(''); // Clear old code
        Alert.alert('Código Reenviado', 'Um novo código foi enviado para seu email.');
      } else if (response.status === 429) {
        // Rate limited
        setResendCountdown(data.wait_seconds || 60);
        Alert.alert('Aguarde', data.error || 'Aguarde para reenviar o código.');
      } else {
        Alert.alert('Erro', data.error || 'Não foi possível reenviar o código.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão. Por favor, tente novamente.');
    } finally {
      setIsResending(false);
    }
  }, [cpf, resendCountdown, isResending, resendCount]);

  const handleVerifyToken = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/accounts/first-access/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''),
          token: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(3);
      } else {
        if (data.expired) {
          setTokenError('Código expirado. Solicite um novo código.');
        } else {
          setTokenError(data.error || 'Código inválido ou expirado');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateAccount = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/accounts/first-access/activate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''),
          token: verificationCode,
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Conta Ativada!',
          'Sua conta foi ativada com sucesso. Agora você pode fazer login.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login' as never),
            },
          ]
        );
      } else {
        if (data.expired) {
          Alert.alert('Código Expirado', 'O código expirou. Por favor, solicite um novo código.', [
            { text: 'OK', onPress: () => setStep(2) },
          ]);
        } else {
          const errorMessage = data.error || 'Não foi possível ativar sua conta. Tente novamente.';
          Alert.alert('Erro', errorMessage);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
    stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    stepDot: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.border.medium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepDotActive: {
      backgroundColor: colors.primary.main,
    },
    stepText: {
      color: colors.text.inverse,
      fontWeight: Typography.weights.bold,
      fontSize: Typography.sizes.label,
    },
    stepLine: {
      width: 40,
      height: 2,
      backgroundColor: colors.border.medium,
    },
    stepLineActive: {
      backgroundColor: colors.primary.main,
    },
    input: {
      marginBottom: Spacing.sm,
      backgroundColor: colors.surface.card,
    },
    codeInput: {
      marginBottom: Spacing.sm,
      backgroundColor: colors.surface.card,
      fontSize: 24,
      letterSpacing: 8,
      textAlign: 'center',
    },
    infoCard: {
      marginBottom: Spacing.md,
      backgroundColor: colors.feedback.infoLight,
    },
    infoText: {
      color: colors.feedback.info,
      fontSize: Typography.sizes.body,
      textAlign: 'center',
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
    backButton: {
      marginTop: Spacing.sm,
      minHeight: ComponentSizes.touchTarget,
    },
    cancelButton: {
      marginTop: Spacing.md,
      minHeight: ComponentSizes.touchTarget,
    },
    resendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.md,
    },
    resendText: {
      color: colors.text.secondary,
      fontSize: Typography.sizes.caption,
    },
    resendButton: {
      marginLeft: Spacing.xs,
    },
    resendButtonText: {
      color: colors.primary.main,
      fontSize: Typography.sizes.caption,
      fontWeight: Typography.weights.medium,
    },
    resendDisabledText: {
      color: colors.text.tertiary,
    },
    resendInfo: {
      textAlign: 'center',
      color: colors.text.tertiary,
      fontSize: Typography.sizes.caption,
      marginTop: Spacing.sm,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/elosaude_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text variant="headlineSmall" style={styles.title}>
            Primeiro Acesso
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {step === 1 && 'Insira seus dados para solicitar a ativação'}
            {step === 2 && 'Digite o código de 6 dígitos enviado para seu email'}
            {step === 3 && 'Crie sua senha de acesso'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]}>
              <Text style={styles.stepText}>3</Text>
            </View>
          </View>

          {/* Step 1: CPF, Registration and Email */}
          {step === 1 && (
            <>
              <TextInput
                label="CPF"
                value={cpf}
                onChangeText={handleCPFChange}
                keyboardType="numeric"
                maxLength={14}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
                error={!!cpfError}
                disabled={isLoading}
                accessibilityLabel="Campo de CPF"
                accessibilityHint="Insira seu CPF com 11 dígitos"
              />
              <HelperText type="error" visible={!!cpfError}>
                {cpfError}
              </HelperText>

              <TextInput
                label="Número de Matrícula"
                value={registrationNumber}
                onChangeText={(text) => {
                  setRegistrationNumber(text);
                  if (registrationError) setRegistrationError('');
                }}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="card-account-details" />}
                error={!!registrationError}
                disabled={isLoading}
                accessibilityLabel="Campo de Número de Matrícula"
                accessibilityHint="Insira seu número de matrícula"
              />
              <HelperText type="error" visible={!!registrationError}>
                {registrationError}
              </HelperText>

              <TextInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
                error={!!emailError}
                disabled={isLoading}
                accessibilityLabel="Campo de Email"
                accessibilityHint="Insira seu email para receber o código de verificação"
              />
              <HelperText type="error" visible={!!emailError}>
                {emailError}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleRequestActivation}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                accessibilityLabel="Solicitar Código"
                accessibilityHint="Envia um código de verificação para seu email"
              >
                Solicitar Código
              </Button>
            </>
          )}

          {/* Step 2: Verification Code */}
          {step === 2 && (
            <>
              <Card style={styles.infoCard}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.infoText}>
                    Um código de 6 dígitos foi enviado para {maskedEmail}.{'\n'}
                    O código expira em 10 minutos.
                  </Text>
                </Card.Content>
              </Card>

              <TextInput
                label="Código de Verificação"
                value={verificationCode}
                onChangeText={handleCodeChange}
                keyboardType="number-pad"
                maxLength={6}
                mode="outlined"
                style={styles.codeInput}
                left={<TextInput.Icon icon="numeric" />}
                error={!!tokenError}
                disabled={isLoading}
                accessibilityLabel="Campo de Código de Verificação"
                accessibilityHint="Insira o código de 6 dígitos recebido em seu email"
              />
              <HelperText type="error" visible={!!tokenError}>
                {tokenError}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleVerifyToken}
                loading={isLoading}
                disabled={isLoading || verificationCode.length !== 6}
                style={styles.button}
                contentStyle={styles.buttonContent}
                accessibilityLabel="Verificar Código"
                accessibilityHint="Valida o código de verificação e avança para a criação de senha"
              >
                Verificar Código
              </Button>

              {/* Resend code section */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Não recebeu o código?</Text>
                <Button
                  mode="text"
                  onPress={handleResendCode}
                  disabled={resendCountdown > 0 || isResending || resendCount >= maxResends}
                  loading={isResending}
                  compact
                  style={styles.resendButton}
                  labelStyle={[
                    styles.resendButtonText,
                    (resendCountdown > 0 || resendCount >= maxResends) && styles.resendDisabledText,
                  ]}
                  accessibilityLabel="Reenviar código"
                  accessibilityHint="Envia um novo código de verificação para seu email"
                >
                  {resendCountdown > 0
                    ? `Reenviar (${resendCountdown}s)`
                    : resendCount >= maxResends
                    ? 'Limite atingido'
                    : 'Reenviar'}
                </Button>
              </View>

              {resendCount > 0 && (
                <Text style={styles.resendInfo}>
                  Reenvios: {resendCount}/{maxResends}
                </Text>
              )}

              <Button
                mode="text"
                onPress={() => setStep(1)}
                disabled={isLoading}
                style={styles.backButton}
                accessibilityLabel="Voltar"
                accessibilityHint="Retorna à etapa anterior"
              >
                Voltar
              </Button>
            </>
          )}

          {/* Step 3: Set Password */}
          {step === 3 && (
            <>
              <Card style={styles.infoCard}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.infoText}>
                    Agora crie uma senha forte para sua conta. A senha deve conter no mínimo 8
                    caracteres, incluindo letras maiúsculas, minúsculas e números.
                  </Text>
                </Card.Content>
              </Card>

              <TextInput
                label="Nova Senha"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (passwordError) setPasswordError('');
                }}
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
                error={!!passwordError}
                disabled={isLoading}
                accessibilityLabel="Campo de Nova Senha"
                accessibilityHint="Insira uma senha com no mínimo 8 caracteres"
              />
              <HelperText type="error" visible={!!passwordError}>
                {passwordError}
              </HelperText>

              <TextInput
                label="Confirmar Senha"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                secureTextEntry={!showConfirmPassword}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    accessibilityLabel={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                  />
                }
                error={!!confirmPasswordError}
                disabled={isLoading}
                accessibilityLabel="Campo de Confirmação de Senha"
                accessibilityHint="Digite novamente sua senha para confirmar"
              />
              <HelperText type="error" visible={!!confirmPasswordError}>
                {confirmPasswordError}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleActivateAccount}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                accessibilityLabel="Ativar Conta"
                accessibilityHint="Ativa sua conta com a senha criada"
              >
                Ativar Conta
              </Button>
            </>
          )}

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            style={styles.cancelButton}
            accessibilityLabel="Cancelar"
            accessibilityHint="Cancela o processo de primeiro acesso"
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
