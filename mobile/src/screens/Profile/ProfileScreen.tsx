import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Card, Title, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { useGetBeneficiaryQuery, useUpdateProfileMutation } from '../../store/services/api';

// Validation schema
const schema = yup.object({
  phone: yup
    .string()
    .required('Telefone é obrigatório')
    .min(10, 'Telefone deve ter no mínimo 10 dígitos'),
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email inválido'),
  address: yup.string().required('Endereço é obrigatório'),
  city: yup.string().required('Cidade é obrigatória'),
  state: yup
    .string()
    .required('Estado é obrigatório')
    .length(2, 'Estado deve ter 2 caracteres (ex: SP)'),
  zip_code: yup
    .string()
    .required('CEP é obrigatório')
    .min(8, 'CEP deve ter 8 dígitos'),
  emergency_contact: yup.string().optional(),
  emergency_phone: yup.string().optional(),
}).required();

type ProfileFormData = yup.InferType<typeof schema>;

const ProfileScreen = () => {
  const navigation = useNavigation();
  const beneficiary = useSelector((state: RootState) => state.auth.beneficiary);

  const { data: beneficiaryData, isLoading: isLoadingBeneficiary } = useGetBeneficiaryQuery();

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      emergency_contact: '',
      emergency_phone: '',
    },
  });

  // Update form when beneficiary data loads
  useEffect(() => {
    if (beneficiaryData) {
      reset({
        phone: beneficiaryData.phone || '',
        email: beneficiaryData.email || '',
        address: beneficiaryData.address || '',
        city: beneficiaryData.city || '',
        state: beneficiaryData.state || '',
        zip_code: beneficiaryData.zip_code || '',
        emergency_contact: beneficiaryData.emergency_contact || '',
        emergency_phone: beneficiaryData.emergency_phone || '',
      });
    }
  }, [beneficiaryData, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data).unwrap();

      Alert.alert(
        'Sucesso',
        'Perfil atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error updating profile:', error);

      let errorMessage = 'Erro ao atualizar perfil. Tente novamente.';
      if (error?.data) {
        const errorFields = Object.keys(error.data);
        if (errorFields.length > 0) {
          errorMessage = error.data[errorFields[0]][0] || errorMessage;
        }
      }

      Alert.alert('Erro', errorMessage);
    }
  };

  if (isLoadingBeneficiary) {
    return (
      <View style={styles.loadingContainer}>
        <Title>Carregando...</Title>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Editar Perfil</Title>

            {/* Read-only fields */}
            <View style={styles.readOnlySection}>
              <Title style={styles.sectionTitle}>Informações Não Editáveis</Title>

              <TextInput
                label="Nome Completo"
                value={beneficiaryData?.full_name || ''}
                mode="outlined"
                disabled
                style={styles.input}
              />

              <TextInput
                label="CPF"
                value={beneficiaryData?.cpf || ''}
                mode="outlined"
                disabled
                style={styles.input}
              />

              <TextInput
                label="Data de Nascimento"
                value={beneficiaryData?.birth_date || ''}
                mode="outlined"
                disabled
                style={styles.input}
              />

              <TextInput
                label="Tipo de Beneficiário"
                value={beneficiaryData?.beneficiary_type_display || ''}
                mode="outlined"
                disabled
                style={styles.input}
              />
            </View>

            {/* Editable fields */}
            <View style={styles.editableSection}>
              <Title style={styles.sectionTitle}>Informações Editáveis</Title>

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      label="Telefone *"
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      keyboardType="phone-pad"
                      style={styles.input}
                      error={!!errors.phone}
                    />
                    {errors.phone && (
                      <HelperText type="error">{errors.phone.message}</HelperText>
                    )}
                  </>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      label="Email *"
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                      error={!!errors.email}
                    />
                    {errors.email && (
                      <HelperText type="error">{errors.email.message}</HelperText>
                    )}
                  </>
                )}
              />

              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      label="Endereço *"
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      style={styles.input}
                      error={!!errors.address}
                    />
                    {errors.address && (
                      <HelperText type="error">{errors.address.message}</HelperText>
                    )}
                  </>
                )}
              />

              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      label="Cidade *"
                      value={value}
                      onChangeText={onChange}
                      mode="outlined"
                      style={styles.input}
                      error={!!errors.city}
                    />
                    {errors.city && (
                      <HelperText type="error">{errors.city.message}</HelperText>
                    )}
                  </>
                )}
              />

              <View style={styles.row}>
                <Controller
                  control={control}
                  name="state"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.halfWidth}>
                      <TextInput
                        label="Estado *"
                        value={value}
                        onChangeText={onChange}
                        mode="outlined"
                        maxLength={2}
                        autoCapitalize="characters"
                        style={styles.input}
                        error={!!errors.state}
                      />
                      {errors.state && (
                        <HelperText type="error">{errors.state.message}</HelperText>
                      )}
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="zip_code"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.halfWidth}>
                      <TextInput
                        label="CEP *"
                        value={value}
                        onChangeText={onChange}
                        mode="outlined"
                        keyboardType="numeric"
                        maxLength={8}
                        style={styles.input}
                        error={!!errors.zip_code}
                      />
                      {errors.zip_code && (
                        <HelperText type="error">{errors.zip_code.message}</HelperText>
                      )}
                    </View>
                  )}
                />
              </View>

              <Title style={styles.sectionTitle}>Contato de Emergência</Title>

              <Controller
                control={control}
                name="emergency_contact"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Nome do Contato de Emergência"
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    style={styles.input}
                  />
                )}
              />

              <Controller
                control={control}
                name="emergency_phone"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Telefone de Emergência"
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                )}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={[styles.button, styles.cancelButton]}
                disabled={isUpdating}
              >
                Cancelar
              </Button>

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.button}
                loading={isUpdating}
                disabled={isUpdating}
              >
                Salvar
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  readOnlySection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editableSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976D2',
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderColor: '#666',
  },
});

export default ProfileScreen;
