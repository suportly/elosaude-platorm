import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../config/theme';
import { formatCPF as maskCPF } from '../../utils/formatters';
import { API_URL } from '../../config/api';

const schema = yup.object().shape({
  cpf: yup.string().required('CPF é obrigatório').min(14, 'CPF inválido'),
});

interface FormData {
  cpf: string;
}

export default function ForgotPasswordScreen({ navigation }: any) {
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="lock-reset" size={64} color={Colors.primary.main} />
          <Text variant="headlineMedium" style={styles.title}>
            Esqueci minha senha
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
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
            >
              Enviar Código
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              disabled={isLoading}
              style={styles.backButton}
            >
              Voltar para Login
            </Button>
          </Card.Content>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Icon name="information-outline" size={20} color={Colors.feedback.info} />
              <Text variant="bodySmall" style={styles.infoText}>
                O código de recuperação será enviado para o e-mail cadastrado
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={20} color={Colors.feedback.info} />
              <Text variant="bodySmall" style={styles.infoText}>
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
    backgroundColor: Colors.surface.background,
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
    color: Colors.text.primary,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.text.secondary,
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
  infoCard: {
    backgroundColor: Colors.feedback.info + '10',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: Colors.feedback.info,
  },
});
