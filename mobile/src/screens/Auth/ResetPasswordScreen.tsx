import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Text, TextInput, Button, HelperText, Card } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '../../config/ThemeContext';
import { Typography, Spacing, BorderRadius, Shadows, ComponentSizes } from '../../config/theme';
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: Spacing.screenPadding,
      paddingTop: Spacing.xl,
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
    infoCard: {
      marginBottom: Spacing.md,
      backgroundColor: colors.feedback.infoLight,
    },
    infoText: {
      color: colors.feedback.info,
      fontSize: Typography.sizes.body,
      textAlign: 'center',
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
    requirementsContainer: {
      marginTop: Spacing.md,
      padding: Spacing.md,
      backgroundColor: colors.surface.background,
      borderRadius: BorderRadius.md,
    },
    requirementsTitle: {
      color: colors.text.primary,
      fontWeight: Typography.weights.semibold,
      fontSize: Typography.sizes.label,
      marginBottom: Spacing.sm,
    },
    requirementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: Spacing.xs,
      gap: Spacing.sm,
    },
    requirementText: {
      color: colors.text.secondary,
      fontSize: Typography.sizes.caption,
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
            Nova Senha
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Digite o código recebido por e-mail e sua nova senha
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Info Card */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.infoText}>
                Insira o código de 6 dígitos enviado para seu e-mail e crie uma nova senha segura.
              </Text>
            </Card.Content>
          </Card>

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
                  keyboardType="number-pad"
                  maxLength={6}
                  left={<TextInput.Icon icon="numeric" />}
                  placeholder="000000"
                  disabled={isLoading}
                  style={styles.codeInput}
                  accessibilityLabel="Código de Verificação"
                  accessibilityHint="Digite o código de 6 dígitos recebido por e-mail"
                />
                <HelperText type="error" visible={!!errors.code}>
                  {errors.code?.message}
                </HelperText>
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
                    />
                  }
                  disabled={isLoading}
                  style={styles.input}
                  accessibilityLabel="Nova Senha"
                  accessibilityHint="Digite sua nova senha"
                />
                <HelperText type="error" visible={!!errors.new_password}>
                  {errors.new_password?.message}
                </HelperText>
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
                  label="Confirmar Senha"
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
                      accessibilityLabel={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                    />
                  }
                  disabled={isLoading}
                  style={styles.input}
                  accessibilityLabel="Confirmar Senha"
                  accessibilityHint="Digite a mesma senha novamente"
                />
                <HelperText type="error" visible={!!errors.confirm_password}>
                  {errors.confirm_password?.message}
                </HelperText>
              </>
            )}
          />

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Requisitos da senha:</Text>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={16} color={colors.feedback.success} />
              <Text style={styles.requirementText}>Mínimo de 8 caracteres</Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={16} color={colors.feedback.success} />
              <Text style={styles.requirementText}>Uma letra maiúscula</Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={16} color={colors.feedback.success} />
              <Text style={styles.requirementText}>Uma letra minúscula</Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon name="check-circle" size={16} color={colors.feedback.success} />
              <Text style={styles.requirementText}>Um número</Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            accessibilityLabel="Redefinir Senha"
            accessibilityHint="Submete o formulário para redefinir sua senha"
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
          >
            Voltar
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
