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
import { Colors } from '../../config/theme';
import { API_URL } from '../../config/api';

export default function FirstAccessScreen() {
  const navigation = useNavigation();
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
              >
                Verificar Token
              </Button>

              <Button
                mode="text"
                onPress={() => setStep(1)}
                disabled={isLoading}
                style={styles.backButton}
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
                  />
                }
                error={!!passwordError}
                disabled={isLoading}
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
                  />
                }
                error={!!confirmPasswordError}
                disabled={isLoading}
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
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 160,
    height: 80,
    marginBottom: 16,
  },
  title: {
    color: Colors.primary.main,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary.main,
  },
  stepText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
  },
  stepLineActive: {
    backgroundColor: Colors.primary.main,
  },
  input: {
    marginBottom: 8,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
  },
  infoText: {
    color: '#1565C0',
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    backgroundColor: Colors.primary.main,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 16,
  },
});
