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
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../config/theme';
import { useLoginMutation } from '../../store/services/api';
import { setCredentials } from '../../store/slices/authSlice';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

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
    // Clear error when user starts typing
    if (cpfError) setCpfError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Clear error when user starts typing
    if (passwordError) setPasswordError('');
  };

  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) {
      setCpfError('CPF deve conter 11 dígitos');
      return false;
    }
    return true;
  };

  const getErrorMessage = (error: any): { title: string; message: string } => {
    // Network error
    if (error?.status === 'FETCH_ERROR' || error?.error?.includes('Network request failed')) {
      return {
        title: 'Erro de Conexão',
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.',
      };
    }

    // Validation errors from DRF
    if (error?.data?.non_field_errors) {
      const errors = error.data.non_field_errors;
      return {
        title: 'Erro no Login',
        message: Array.isArray(errors) ? errors[0] : errors,
      };
    }

    // Field-specific errors
    if (error?.data?.cpf) {
      return {
        title: 'CPF Inválido',
        message: Array.isArray(error.data.cpf) ? error.data.cpf[0] : error.data.cpf,
      };
    }

    if (error?.data?.password) {
      return {
        title: 'Senha Inválida',
        message: Array.isArray(error.data.password) ? error.data.password[0] : error.data.password,
      };
    }

    // Generic error message
    if (error?.data?.error) {
      return {
        title: 'Erro no Login',
        message: error.data.error,
      };
    }

    if (error?.data?.detail) {
      return {
        title: 'Erro no Login',
        message: error.data.detail,
      };
    }

    // 500 Server Error
    if (error?.status >= 500) {
      return {
        title: 'Erro no Servidor',
        message: 'O servidor está temporariamente indisponível. Por favor, tente novamente mais tarde.',
      };
    }

    // Default error
    return {
      title: 'Erro no Login',
      message: 'Não foi possível realizar o login. Por favor, verifique suas credenciais e tente novamente.',
    };
  };

  const handleLogin = async () => {
    // Reset errors
    setCpfError('');
    setPasswordError('');

    // Validate fields
    if (!cpf.trim()) {
      setCpfError('CPF é obrigatório');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Senha é obrigatória');
      return;
    }

    // Validate CPF format
    if (!validateCPF(cpf)) {
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

      // Set field-specific errors if available
      if (error?.data?.cpf) {
        setCpfError(Array.isArray(error.data.cpf) ? error.data.cpf[0] : error.data.cpf);
      }
      if (error?.data?.password) {
        setPasswordError(Array.isArray(error.data.password) ? error.data.password[0] : error.data.password);
      }

      Alert.alert(title, message);
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
          <Text variant="bodyMedium" style={styles.subtitle}>
            Gestão de Plano de Saúde
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
            error={!!cpfError}
            disabled={isLoading}
          />
          <HelperText type="error" visible={!!cpfError}>
            {cpfError}
          </HelperText>

          <TextInput
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
              />
            }
            error={!!passwordError}
            disabled={isLoading}
          />
          <HelperText type="error" visible={!!passwordError}>
            {passwordError}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
          >
            Entrar
          </Button>

          <View style={styles.linksContainer}>
            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword' as never)}
              style={styles.linkButton}
              labelStyle={styles.linkButtonText}
            >
              Esqueci minha senha
            </Button>
            <Button
              mode="text"
              onPress={() => navigation.navigate('FirstAccess' as never)}
              style={styles.linkButton}
              labelStyle={styles.linkButtonText}
            >
              Primeiro acesso?
            </Button>
          </View>

          <View style={styles.testInfoContainer}>
            <Text variant="titleSmall" style={styles.testInfoTitle}>
              👤 Credenciais de Demonstração
            </Text>
            <Text variant="bodySmall" style={styles.testInfo}>
              CPF: 123.456.789-00
            </Text>
            <Text variant="bodySmall" style={styles.testInfo}>
              Senha: Demo@123
            </Text>
          </View>
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
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 120,
    marginBottom: 16,
  },
  subtitle: {
    color: '#FFFFFF',
    marginTop: 8,
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
  input: {
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginHorizontal: -8,
  },
  linkButton: {
    flex: 1,
  },
  linkButtonText: {
    color: Colors.primary,
    fontSize: 12,
    textTransform: 'none',
  },
  testInfoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    alignItems: 'center',
  },
  testInfoTitle: {
    color: '#1565C0',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  testInfo: {
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 4,
  },
});
