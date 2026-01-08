import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store';
import { setOnboardingCompleted, updateBeneficiary } from '../../store/slices/authSlice';
import { useColors } from '../../config/ThemeContext';
import { Spacing, Typography, BorderRadius, Shadows, ComponentSizes } from '../../config/theme';
import { API_URL } from '../../config/api';

interface OnboardingScreenProps {
  navigation: any;
}

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const dispatch = useAppDispatch();
  const colors = useColors();
  const { beneficiary, accessToken } = useAppSelector((state) => state.auth);

  const [phone, setPhone] = useState(beneficiary?.phone || '');
  const [email, setEmail] = useState(beneficiary?.email || '');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return phone;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhone(text);
    setPhone(formatted);
    if (phoneError) setPhoneError('');
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional
    const numbers = phone.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  const handleComplete = async (skip = false) => {
    if (!skip) {
      // Validate inputs
      if (phone && !validatePhone(phone)) {
        setPhoneError('Telefone inválido');
        return;
      }
      if (email && !validateEmail(email)) {
        setEmailError('Email inválido');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/beneficiaries/beneficiaries/complete-onboarding/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            phone: skip ? undefined : phone.replace(/\D/g, ''),
            email: skip ? undefined : email,
            skip,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update local state
        dispatch(setOnboardingCompleted());
        if (!skip && data.beneficiary) {
          dispatch(updateBeneficiary({
            phone: data.beneficiary.phone,
            email: data.beneficiary.email,
          }));
        }
        // Navigation will be handled by AppNavigator checking onboarding_completed
      } else {
        Alert.alert('Erro', data.error || 'Não foi possível salvar os dados. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (cpf: string | undefined) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatBirthDate = (date: string | null | undefined) => {
    if (!date) return '';
    // If it's in ISO format (YYYY-MM-DD), convert to DD/MM/YYYY
    if (date.includes('-')) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    return date;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: Spacing.screenPadding,
    },
    header: {
      marginBottom: Spacing.xl,
    },
    title: {
      fontSize: Typography.sizes.h2,
      fontWeight: Typography.weights.bold,
      color: colors.primary.main,
      marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: Typography.sizes.body,
      color: colors.text.secondary,
      lineHeight: 22,
    },
    card: {
      backgroundColor: colors.surface.card,
      marginBottom: Spacing.lg,
      borderRadius: BorderRadius.card,
      ...Shadows.card,
    },
    sectionTitle: {
      fontSize: Typography.sizes.subtitle,
      fontWeight: Typography.weights.semiBold,
      color: colors.text.primary,
      marginBottom: Spacing.md,
    },
    label: {
      fontSize: Typography.sizes.caption,
      color: colors.text.tertiary,
      marginTop: Spacing.md,
    },
    readOnlyValue: {
      fontSize: Typography.sizes.body,
      fontWeight: Typography.weights.medium,
      color: colors.text.primary,
      marginBottom: Spacing.sm,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border.light,
      marginVertical: Spacing.lg,
    },
    input: {
      marginBottom: Spacing.sm,
      backgroundColor: colors.surface.card,
    },
    buttons: {
      marginTop: Spacing.lg,
    },
    primaryButton: {
      marginBottom: Spacing.md,
      backgroundColor: colors.primary.main,
      minHeight: ComponentSizes.touchTarget,
    },
    primaryButtonContent: {
      paddingVertical: Spacing.sm,
      minHeight: ComponentSizes.touchTarget,
    },
    skipButton: {
      minHeight: ComponentSizes.touchTarget,
    },
    infoCard: {
      backgroundColor: colors.feedback.infoLight,
      marginBottom: Spacing.lg,
    },
    infoText: {
      fontSize: Typography.sizes.caption,
      color: colors.feedback.info,
      textAlign: 'center',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Bem-vindo, {beneficiary?.full_name?.split(' ')[0]}!
        </Text>
        <Text style={styles.subtitle}>
          Seus dados básicos já estão cadastrados. Atualize suas informações de contato para
          facilitar a comunicação.
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Seus Dados</Text>

          <Text style={styles.label}>Nome Completo</Text>
          <Text style={styles.readOnlyValue}>{beneficiary?.full_name}</Text>

          <Text style={styles.label}>CPF</Text>
          <Text style={styles.readOnlyValue}>{formatCPF(beneficiary?.cpf)}</Text>

          <Text style={styles.label}>Data de Nascimento</Text>
          <Text style={styles.readOnlyValue}>{formatBirthDate(beneficiary?.birth_date)}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Informações de Contato</Text>

          <TextInput
            label="Telefone"
            value={phone}
            onChangeText={handlePhoneChange}
            mode="outlined"
            keyboardType="phone-pad"
            maxLength={15}
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
            error={!!phoneError}
            disabled={loading}
            accessibilityLabel="Campo de telefone"
            accessibilityHint="Insira seu número de telefone com DDD"
          />
          {phoneError ? <Text style={{ color: colors.feedback.error, fontSize: 12 }}>{phoneError}</Text> : null}

          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
            error={!!emailError}
            disabled={loading}
            accessibilityLabel="Campo de email"
            accessibilityHint="Insira seu endereço de email"
          />
          {emailError ? <Text style={{ color: colors.feedback.error, fontSize: 12 }}>{emailError}</Text> : null}
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoText}>
            Essas informações são importantes para que possamos entrar em contato quando necessário.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={() => handleComplete(false)}
          loading={loading}
          disabled={loading}
          style={styles.primaryButton}
          contentStyle={styles.primaryButtonContent}
          accessibilityLabel="Salvar e Continuar"
          accessibilityHint="Salva suas informações de contato e continua para o aplicativo"
        >
          Salvar e Continuar
        </Button>

        <Button
          mode="text"
          onPress={() => handleComplete(true)}
          disabled={loading}
          style={styles.skipButton}
          accessibilityLabel="Fazer depois"
          accessibilityHint="Pula a atualização de dados e continua para o aplicativo"
        >
          Fazer depois
        </Button>
      </View>
    </ScrollView>
  );
}
