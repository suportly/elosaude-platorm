import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../config/theme';
import { API_URL } from '../../config/api';

const schema = yup.object().shape({
  code: yup.string().required('Código é obrigatório').length(6, 'Código deve ter 6 dígitos'),
  new_password: yup
    .string()
    .required('Nova senha é obrigatória')
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .matches(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .matches(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .matches(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirm_password: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('new_password')], 'As senhas não coincidem'),
});

interface FormData {
  code: string;
  new_password: string;
  confirm_password: string;
}

export default function ResetPasswordScreen({ route, navigation }: any) {
  const { cpf } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      code: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/accounts/password-reset/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf,
          code: data.code,
          new_password: data.new_password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          'Sucesso',
          'Senha redefinida com sucesso! Faça login com sua nova senha.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              },
            },
          ]
        );
      } else {
        const errorMessage =
          result.error || result.new_password?.[0] || 'Não foi possível redefinir a senha. Tente novamente.';
        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Erro', 'Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="shield-lock" size={64} color={Colors.primary} />
          <Text variant="headlineMedium" style={styles.title}>
            Nova Senha
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Digite o código recebido por e-mail e sua nova senha
          </Text>
        </View>

        {/* Form */}
        <Card style={styles.card}>
          <Card.Content>
            {/* Code */}
            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Código de Verificação"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.code}
                    keyboardType="numeric"
                    maxLength={6}
                    left={<TextInput.Icon icon="numeric" />}
                    placeholder="000000"
                    disabled={isLoading}
                    style={styles.input}
                  />
                  {errors.code && (
                    <HelperText type="error" visible={!!errors.code}>
                      {errors.code.message}
                    </HelperText>
                  )}
                </>
              )}
            />

            {/* New Password */}
            <Controller
              control={control}
              name="new_password"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Nova Senha"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.new_password}
                    secureTextEntry={!showPassword}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    disabled={isLoading}
                    style={styles.input}
                  />
                  {errors.new_password && (
                    <HelperText type="error" visible={!!errors.new_password}>
                      {errors.new_password.message}
                    </HelperText>
                  )}
                </>
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirm_password"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Confirmar Nova Senha"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.confirm_password}
                    secureTextEntry={!showConfirmPassword}
                    left={<TextInput.Icon icon="lock-check" />}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                    disabled={isLoading}
                    style={styles.input}
                  />
                  {errors.confirm_password && (
                    <HelperText type="error" visible={!!errors.confirm_password}>
                      {errors.confirm_password.message}
                    </HelperText>
                  )}
                </>
              )}
            />

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              icon="check"
            >
              Redefinir Senha
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              disabled={isLoading}
              style={styles.backButton}
            >
              Voltar
            </Button>
          </Card.Content>
        </Card>

        {/* Requirements Card */}
        <Card style={styles.requirementsCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.requirementsTitle}>
              Requisitos da senha:
            </Text>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={16} color={Colors.success} />
              <Text variant="bodySmall" style={styles.requirementText}>
                Mínimo de 8 caracteres
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={16} color={Colors.success} />
              <Text variant="bodySmall" style={styles.requirementText}>
                Pelo menos uma letra maiúscula
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={16} color={Colors.success} />
              <Text variant="bodySmall" style={styles.requirementText}>
                Pelo menos uma letra minúscula
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={16} color={Colors.success} />
              <Text variant="bodySmall" style={styles.requirementText}>
                Pelo menos um número
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.textSecondary,
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 20,
    elevation: 2,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  backButton: {
    marginTop: 8,
  },
  requirementsCard: {
    backgroundColor: Colors.success + '10',
  },
  requirementsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.text,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 8,
  },
  requirementText: {
    color: Colors.text,
  },
});
