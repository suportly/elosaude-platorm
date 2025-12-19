import React, { useState } from 'react';
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
  const [activationToken, setActivationToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [cpfError, setCpfError] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) {
      setCpfError('CPF deve conter 11 dígitos');
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    setCpfError('');
    setRegistrationError('');

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

    return true;
  };

  const validateStep2 = () => {
    setTokenError('');

    if (!activationToken.trim()) {
      setTokenError('Token de ativação é obrigatório');
      return false;
    }

    if (activationToken.length < 6) {
      setTokenError('Token deve ter pelo menos 6 caracteres');
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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Token Enviado',
          'Um token de ativação foi enviado para seu email cadastrado. Por favor, verifique sua caixa de entrada.',
          [{ text: 'OK', onPress: () => setStep(2) }]
        );
      } else {
        const errorMessage = data.error || 'Não foi possível enviar o token. Verifique seus dados.';
        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/accounts/first-access/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ''),
          token: activationToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(3);
      } else {
        const errorMessage = data.error || 'Token inválido ou expirado';
        setTokenError(errorMessage);
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
          token: activationToken,
          new_password: newPassword,
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
        const errorMessage = data.error || 'Não foi possível ativar sua conta. Tente novamente.';
        Alert.alert('Erro', errorMessage);
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
            {step === 2 && 'Digite o token enviado para seu email'}
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

          {/* Step 1: CPF and Registration */}
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
                accessibilityHint="Insira seu CPF com 11 dígitos para solicitar a ativação da conta"
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
                accessibilityHint="Insira seu número de matrícula para solicitar a ativação da conta"
              />
              <HelperText type="error" visible={!!registrationError}>
                {registrationError}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleRequestActivation}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                accessibilityLabel="Solicitar Token de Ativação"
                accessibilityHint="Envia um token de ativação para seu email cadastrado"
              >
                Solicitar Token
              </Button>
            </>
          )}

          {/* Step 2: Activation Token */}
          {step === 2 && (
            <>
              <Card style={styles.infoCard}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.infoText}>
                    Um token de ativação foi enviado para o email cadastrado em seu perfil.
                    Digite-o abaixo para continuar.
                  </Text>
                </Card.Content>
              </Card>

              <TextInput
                label="Token de Ativação"
                value={activationToken}
                onChangeText={(text) => {
                  setActivationToken(text);
                  if (tokenError) setTokenError('');
                }}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="key" />}
                error={!!tokenError}
                disabled={isLoading}
                accessibilityLabel="Campo de Token de Ativação"
                accessibilityHint="Insira o token recebido em seu email para verificar sua identidade"
              />
              <HelperText type="error" visible={!!tokenError}>
                {tokenError}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleVerifyToken}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                contentStyle={styles.buttonContent}
                accessibilityLabel="Verificar Token"
                accessibilityHint="Valida o token de ativação e avança para a criação de senha"
              >
                Verificar Token
              </Button>

              <Button
                mode="text"
                onPress={() => setStep(1)}
                disabled={isLoading}
                style={styles.backButton}
                accessibilityLabel="Voltar"
                accessibilityHint="Retorna à etapa anterior para inserir novamente seus dados"
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
                    accessibilityHint={showPassword ? 'Oculta a senha digitada' : 'Exibe a senha digitada'}
                  />
                }
                error={!!passwordError}
                disabled={isLoading}
                accessibilityLabel="Campo de Nova Senha"
                accessibilityHint="Insira uma senha com no mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números"
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
                    accessibilityLabel={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                    accessibilityHint={showConfirmPassword ? 'Oculta a confirmação de senha digitada' : 'Exibe a confirmação de senha digitada'}
                  />
                }
                error={!!confirmPasswordError}
                disabled={isLoading}
                accessibilityLabel="Campo de Confirmação de Senha"
                accessibilityHint="Digite novamente sua senha para confirmar que digitou corretamente"
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
                accessibilityHint="Ativa sua conta com a senha criada e leva você para o login"
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
            accessibilityHint="Cancela o processo de primeiro acesso e volta à tela anterior"
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
