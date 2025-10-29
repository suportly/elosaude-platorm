import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../config/theme';
import { changePasswordSchema } from '../../utils/validationSchemas';
import { useChangePasswordMutation } from '../../store/services/api';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function ChangePasswordScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      console.log('Changing password:', {
        current_password: '***',
        new_password: '***',
      });

      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      }).unwrap();

      Alert.alert(
        'Sucesso',
        'Senha alterada com sucesso! Por favor, faça login novamente.',
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              // Logout user and redirect to login
              dispatch(logout());
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error changing password:', error);

      let errorMessage = 'Erro ao alterar senha. Tente novamente.';

      if (error?.data?.current_password) {
        errorMessage = 'Senha atual incorreta.';
      } else if (error?.data?.new_password) {
        errorMessage = error.data.new_password[0];
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      }

      Alert.alert('Erro', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Card.Content style={styles.infoCardContent}>
          <Icon name="information-outline" size={24} color={Colors.info} />
          <View style={styles.infoTextContainer}>
            <Text variant="titleSmall" style={[styles.infoTitle, { color: Colors.info }]}>
              Alterar Senha
            </Text>
            <Text variant="bodySmall" style={[styles.infoText, { color: Colors.info }]}>
              Sua nova senha deve ter no mínimo 8 caracteres e conter letras maiúsculas,
              minúsculas e números para maior segurança.
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Security Tips Card */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <View style={styles.tipsHeader}>
            <Icon name="shield-check" size={24} color={Colors.success} />
            <Text variant="titleSmall" style={styles.tipsTitle}>
              Dicas de Segurança
            </Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={16} color={Colors.success} />
              <Text variant="bodySmall" style={styles.tipText}>
                Use uma combinação de letras, números e caracteres especiais
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={16} color={Colors.success} />
              <Text variant="bodySmall" style={styles.tipText}>
                Evite usar informações pessoais óbvias
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={16} color={Colors.success} />
              <Text variant="bodySmall" style={styles.tipText}>
                Não compartilhe sua senha com ninguém
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={16} color={Colors.success} />
              <Text variant="bodySmall" style={styles.tipText}>
                Altere sua senha regularmente
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Form Card */}
      <Card style={styles.formCard}>
        <Card.Content>
          {/* Current Password */}
          <Controller
            control={control}
            name="current_password"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Senha Atual *"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.current_password}
                  secureTextEntry={!showCurrentPassword}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showCurrentPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    />
                  }
                  style={styles.input}
                  autoCapitalize="none"
                />
                {errors.current_password && (
                  <HelperText type="error" visible={!!errors.current_password}>
                    {errors.current_password.message}
                  </HelperText>
                )}
              </>
            )}
          />

          <View style={styles.divider} />

          {/* New Password */}
          <Controller
            control={control}
            name="new_password"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Nova Senha *"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.new_password}
                  secureTextEntry={!showNewPassword}
                  left={<TextInput.Icon icon="lock-outline" />}
                  right={
                    <TextInput.Icon
                      icon={showNewPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    />
                  }
                  style={styles.input}
                  autoCapitalize="none"
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
                  label="Confirmar Nova Senha *"
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
                  style={styles.input}
                  autoCapitalize="none"
                />
                {errors.confirm_password && (
                  <HelperText type="error" visible={!!errors.confirm_password}>
                    {errors.confirm_password.message}
                  </HelperText>
                )}
              </>
            )}
          />
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
          disabled={isLoading}
          loading={isLoading}
        >
          Alterar Senha
        </Button>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: Colors.info + '10',
  },
  infoCardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    lineHeight: 18,
  },
  tipsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.success + '10',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontWeight: 'bold',
    color: Colors.success,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    flex: 1,
    color: Colors.text,
    lineHeight: 18,
  },
  formCard: {
    margin: 16,
    marginTop: 8,
    elevation: 1,
  },
  input: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  bottomPadding: {
    height: 24,
  },
});
