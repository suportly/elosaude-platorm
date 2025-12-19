import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors, Typography, Spacing, ComponentSizes, Shadows } from '../../config';
import { formatCPF as maskCPF } from '../../utils/formatters';
import { API_URL } from '../../config/api';

const schema = yup.object().shape({
  cpf: yup.string().required('CPF é obrigatório').min(14, 'CPF inválido'),
});

interface FormData {
  cpf: string;
}

export default function ForgotPasswordScreen({ navigation }: any) {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      cpf: '',
    },
  });

  const cpf = watch('cpf');

  const handleCPFChange = (text: string) => {
    const masked = maskCPF(text);
    setValue('cpf', masked);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/accounts/password-reset/request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpf: data.cpf }),
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
                navigation.navigate('ResetPassword', { cpf: data.cpf });
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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.surface.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="lock-reset" size={ComponentSizes.icon.xl} color={colors.primary.main} />
          <Text variant="headlineMedium" style={[styles.title, { color: colors.text.primary }]}>
            Esqueci minha senha
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.text.secondary }]}>
            Digite seu CPF para receber um código de recuperação por e-mail
          </Text>
        </View>

        {/* Form */}
        <Card style={styles.card}>
          <Card.Content>
            <Controller
              control={control}
              name="cpf"
              render={({ field: { onBlur } }) => (
                <>
                  <TextInput
                    label="CPF"
                    mode="outlined"
                    value={cpf}
                    onChangeText={handleCPFChange}
                    onBlur={onBlur}
                    error={!!errors.cpf}
                    keyboardType="numeric"
                    maxLength={14}
                    left={<TextInput.Icon icon="card-account-details" />}
                    placeholder="000.000.000-00"
                    disabled={isLoading}
                    style={styles.input}
                    accessibilityLabel="Campo de CPF"
                    accessibilityHint="Digite seu número de CPF no formato 000.000.000-00 para receber um código de recuperação de senha"
                    accessibilityRole="text"
                  />
                  {errors.cpf && (
                    <HelperText type="error" visible={!!errors.cpf}>
                      {errors.cpf.message}
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
              icon="send"
              accessibilityLabel="Enviar Código de Recuperação"
              accessibilityHint="Envia um código de recuperação de senha para o seu e-mail cadastrado"
              accessibilityRole="button"
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
              accessibilityRole="button"
            >
              Voltar para Login
            </Button>
          </Card.Content>
        </Card>

        {/* Info Card */}
        <Card style={[styles.infoCard, { backgroundColor: colors.feedback.info + '10' }]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Icon name="information-outline" size={ComponentSizes.icon.sm} color={colors.feedback.info} />
              <Text variant="bodySmall" style={[styles.infoText, { color: colors.feedback.info }]}>
                O código de recuperação será enviado para o e-mail cadastrado
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={ComponentSizes.icon.sm} color={colors.feedback.info} />
              <Text variant="bodySmall" style={[styles.infoText, { color: colors.feedback.info }]}>
                O código expira em 1 hora
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
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  card: {
    marginBottom: Spacing.screenPadding,
    ...Shadows.card,
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
  infoCard: {
    ...Shadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
  },
});
