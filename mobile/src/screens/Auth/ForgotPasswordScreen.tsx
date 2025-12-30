/**
 * ForgotPasswordScreen - Tela de Recuperação de Senha
 *
 * Redesign UX/UI otimizado para usuários 35-65 anos:
 * - Formulário simples e claro
 * - Mensagens de erro amigáveis
 * - CTA primário destacado
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useColors } from '../../config/ThemeContext';
import { Typography, Spacing, BorderRadius, ComponentSizes, Shadows } from '../../config/theme';
import { formatCPF as maskCPF } from '../../utils/formatters';
import { API_URL } from '../../config/api';

export default function ForgotPasswordScreen({ navigation }: any) {
  const colors = useColors();
  const [cpf, setCpf] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCPFChange = (text: string) => {
    const masked = maskCPF(text);
    setCpf(masked);
    if (cpfError) setCpfError('');
  };

  const validateCPF = (): boolean => {
    if (!cpf.trim()) {
      setCpfError('CPF é obrigatório');
      return false;
    }

    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) {
      setCpfError('CPF deve conter 11 dígitos');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateCPF()) return;

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/accounts/password-reset/request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpf }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          'Código Enviado',
          'Se o CPF estiver cadastrado, você receberá um código de recuperação por e-mail.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('ResetPassword', { cpf });
              },
            },
          ]
        );
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível enviar o código. Tente novamente.');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      Alert.alert('Erro', 'Erro de conexão. Verifique sua internet e tente novamente.');
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
    backButton: {
      marginTop: Spacing.sm,
      minHeight: ComponentSizes.touchTarget,
    },
    infoCard: {
      marginTop: Spacing.lg,
      backgroundColor: colors.feedback.infoLight,
      borderRadius: BorderRadius.card,
    },
    infoContent: {
      padding: Spacing.md,
    },
    infoText: {
      color: colors.feedback.info,
      fontSize: Typography.sizes.bodySmall,
      textAlign: 'center',
      marginBottom: Spacing.xs,
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
            Esqueci minha senha
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Digite seu CPF para receber um código de recuperação por e-mail
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
            accessibilityLabel="Campo de CPF"
            accessibilityHint="Digite seu CPF para receber o código de recuperação"
          />
          <HelperText type="error" visible={!!cpfError}>
            {cpfError}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="send"
            accessibilityLabel="Enviar Código"
            accessibilityHint="Envia um código de recuperação para o seu e-mail"
          >
            Enviar Código
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            style={styles.backButton}
            accessibilityLabel="Voltar para Login"
            accessibilityHint="Retorna para a tela de login"
          >
            Voltar para Login
          </Button>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              O código será enviado para o e-mail cadastrado
            </Text>
            <Text style={styles.infoText}>
              O código expira em 1 hora
            </Text>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
