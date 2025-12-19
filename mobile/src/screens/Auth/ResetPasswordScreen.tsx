import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '../../config/ThemeContext';
import { Typography, Spacing, ComponentSizes } from '../../config/theme';
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
  const colors = useColors();
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
      style={[styles.container, { backgroundColor: colors.surface.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="shield-lock" size={ComponentSizes.icon.xl} color={colors.primary.main} />
          <Text variant="headlineMedium" style={[styles.title, { color: colors.text.primary }]}>
            Nova Senha
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.text.secondary }]}>
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
                    accessibilityLabel="Código de Verificação"
                    accessibilityHint="Digite o código de 6 dígitos recebido por e-mail"
                    accessibilityRole="none"
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
                        accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        accessibilityHint="Toque para alternar a visibilidade da senha"
                        accessibilityRole="button"
                      />
                    }
                    disabled={isLoading}
                    style={styles.input}
                    accessibilityLabel="Nova Senha"
                    accessibilityHint="Digite sua nova senha com pelo menos 8 caracteres, incluindo maiúsculas, minúsculas e números"
                    accessibilityRole="none"
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
                        accessibilityLabel={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                        accessibilityHint="Toque para alternar a visibilidade da confirmação de senha"
                        accessibilityRole="button"
                      />
                    }
                    disabled={isLoading}
                    style={styles.input}
                    accessibilityLabel="Confirmar Nova Senha"
                    accessibilityHint="Digite a mesma senha novamente para confirmar"
                    accessibilityRole="none"
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
              accessibilityLabel="Redefinir Senha"
              accessibilityHint="Submete o formulário para redefinir sua senha"
              accessibilityRole="button"
            >
              Redefinir Senha
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              disabled={isLoading}
              style={styles.backButton}
              accessibilityLabel="Voltar"
              accessibilityHint="Retorna à tela anterior"
              accessibilityRole="button"
            >
              Voltar
            </Button>
          </Card.Content>
        </Card>

        {/* Requirements Card */}
        <Card style={[styles.requirementsCard, { backgroundColor: colors.feedback.successLight }]}>
          <Card.Content>
            <Text variant="titleSmall" style={[styles.requirementsTitle, { color: colors.text.primary }]}>
              Requisitos da senha:
            </Text>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={ComponentSizes.icon.xs} color={colors.feedback.success} />
              <Text variant="bodySmall" style={[styles.requirementText, { color: colors.text.primary }]}>
                Mínimo de 8 caracteres
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={ComponentSizes.icon.xs} color={colors.feedback.success} />
              <Text variant="bodySmall" style={[styles.requirementText, { color: colors.text.primary }]}>
                Pelo menos uma letra maiúscula
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={ComponentSizes.icon.xs} color={colors.feedback.success} />
              <Text variant="bodySmall" style={[styles.requirementText, { color: colors.text.primary }]}>
                Pelo menos uma letra minúscula
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={ComponentSizes.icon.xs} color={colors.feedback.success} />
              <Text variant="bodySmall" style={[styles.requirementText, { color: colors.text.primary }]}>
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
    // backgroundColor is applied dynamically via colors hook
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.screenPadding,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    fontWeight: 'bold',
    // color is applied dynamically via colors hook
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: Spacing.screenPadding,
    // color is applied dynamically via colors hook
  },
  card: {
    marginBottom: Spacing.screenPadding,
    elevation: 2,
  },
  input: {
    marginBottom: Spacing.sm,
  },
  button: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
    minHeight: ComponentSizes.touchTarget,
  },
  backButton: {
    marginTop: Spacing.sm,
    minHeight: ComponentSizes.touchTarget,
  },
  requirementsCard: {
    // backgroundColor is applied dynamically via colors hook
  },
  requirementsTitle: {
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    // color is applied dynamically via colors hook
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  requirementText: {
    // color is applied dynamically via colors hook
  },
});
