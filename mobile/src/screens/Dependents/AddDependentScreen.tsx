import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  HelperText,
  Card,
  ActivityIndicator,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DatePickerModal } from 'react-native-paper-dates';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../config/theme';
import { formatDate } from '../../utils/formatters';
import { dependentValidationSchema } from '../../utils/validationSchemas';
import { useAddDependentMutation, useUpdateDependentMutation } from '../../store/services/api';

interface DependentFormData {
  full_name: string;
  cpf: string;
  birth_date: Date;
  gender: string;
  relationship: string;
  email?: string;
  phone?: string;
}

export default function AddDependentScreen({ route, navigation }: any) {
  const { dependent } = route.params || {};
  const isEditing = !!dependent;

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [addDependent, { isLoading: isAdding }] = useAddDependentMutation();
  const [updateDependent, { isLoading: isUpdating }] = useUpdateDependentMutation();

  const isLoading = isAdding || isUpdating;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DependentFormData>({
    resolver: yupResolver(dependentValidationSchema),
    defaultValues: {
      full_name: dependent?.full_name || '',
      cpf: dependent?.cpf || '',
      birth_date: dependent?.birth_date ? new Date(dependent.birth_date) : new Date(),
      gender: dependent?.gender || 'MALE',
      relationship: dependent?.relationship || 'CHILD',
      email: dependent?.email || '',
      phone: dependent?.phone || '',
    },
  });

  const birthDate = watch('birth_date');
  const gender = watch('gender');
  const relationship = watch('relationship');

  const onSubmit = async (data: DependentFormData) => {
    try {
      // Format data for API
      const formattedData = {
        ...data,
        birth_date: data.birth_date.toISOString().split('T')[0],
      };

      console.log('Submitting dependent:', formattedData);

      if (isEditing) {
        await updateDependent({ id: dependent.id, data: formattedData }).unwrap();
      } else {
        await addDependent(formattedData).unwrap();
      }

      Alert.alert(
        'Sucesso',
        isEditing ? 'Dependente atualizado com sucesso!' : 'Dependente adicionado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error saving dependent:', error);

      let errorMessage = 'Erro ao salvar dependente. Tente novamente.';

      // Handle specific error messages from backend
      if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.data?.cpf) {
        errorMessage = `CPF: ${error.data.cpf[0]}`;
      } else if (error?.data?.non_field_errors) {
        errorMessage = error.data.non_field_errors[0];
      }

      Alert.alert('Erro', errorMessage);
    }
  };

  const relationshipOptions = [
    { value: 'SPOUSE', label: 'Cônjuge', icon: 'heart' },
    { value: 'CHILD', label: 'Filho(a)', icon: 'baby-face' },
    { value: 'PARENT', label: 'Pai/Mãe', icon: 'human-male-female' },
    { value: 'SIBLING', label: 'Irmão(ã)', icon: 'account-group' },
    { value: 'OTHER', label: 'Outro', icon: 'account' },
  ];

  const genderOptions = [
    { value: 'MALE', label: 'Masculino', icon: 'gender-male' },
    { value: 'FEMALE', label: 'Feminino', icon: 'gender-female' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Card.Content style={styles.infoCardContent}>
          <Icon name="information-outline" size={24} color={Colors.info} />
          <View style={styles.infoTextContainer}>
            <Text variant="titleSmall" style={[styles.infoTitle, { color: Colors.info }]}>
              {isEditing ? 'Editar Dependente' : 'Adicionar Dependente'}
            </Text>
            <Text variant="bodySmall" style={[styles.infoText, { color: Colors.info }]}>
              {isEditing
                ? 'Atualize as informações do dependente.'
                : 'Preencha os dados do dependente para incluí-lo no plano de saúde. O valor adicional será de 50% da mensalidade.'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Form */}
      <Card style={styles.formCard}>
        <Card.Content>
          {/* Full Name */}
          <Controller
            control={control}
            name="full_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Nome Completo *"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.full_name}
                  left={<TextInput.Icon icon="account" />}
                  style={styles.input}
                />
                {errors.full_name && (
                  <HelperText type="error" visible={!!errors.full_name}>
                    {errors.full_name.message}
                  </HelperText>
                )}
              </>
            )}
          />

          {/* CPF */}
          <Controller
            control={control}
            name="cpf"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="CPF *"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.cpf}
                  keyboardType="numeric"
                  maxLength={14}
                  left={<TextInput.Icon icon="card-account-details" />}
                  style={styles.input}
                  placeholder="000.000.000-00"
                />
                {errors.cpf && (
                  <HelperText type="error" visible={!!errors.cpf}>
                    {errors.cpf.message}
                  </HelperText>
                )}
              </>
            )}
          />

          {/* Birth Date */}
          <Controller
            control={control}
            name="birth_date"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  label="Data de Nascimento *"
                  mode="outlined"
                  value={formatDate(value)}
                  onFocus={() => setShowDatePicker(true)}
                  showSoftInputOnFocus={false}
                  error={!!errors.birth_date}
                  left={<TextInput.Icon icon="calendar" />}
                  right={<TextInput.Icon icon="chevron-down" onPress={() => setShowDatePicker(true)} />}
                  style={styles.input}
                />
                {errors.birth_date && (
                  <HelperText type="error" visible={!!errors.birth_date}>
                    {errors.birth_date.message}
                  </HelperText>
                )}
                <DatePickerModal
                  locale="pt"
                  mode="single"
                  visible={showDatePicker}
                  onDismiss={() => setShowDatePicker(false)}
                  date={value}
                  onConfirm={(params) => {
                    setShowDatePicker(false);
                    if (params.date) {
                      onChange(params.date);
                    }
                  }}
                  validRange={{
                    endDate: new Date(),
                  }}
                />
              </>
            )}
          />

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text variant="titleSmall" style={styles.fieldLabel}>
              Sexo *
            </Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange } }) => (
                <View style={styles.genderContainer}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.genderOption,
                        gender === option.value && styles.genderOptionSelected,
                      ]}
                      onPress={() => onChange(option.value)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={option.icon}
                        size={32}
                        color={gender === option.value ? '#FFFFFF' : '#1976D2'}
                      />
                      <Text
                        variant="bodyMedium"
                        style={[
                          styles.genderLabel,
                          gender === option.value && styles.genderLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.gender && (
              <HelperText type="error" visible={!!errors.gender}>
                {errors.gender.message}
              </HelperText>
            )}
          </View>

          {/* Relationship */}
          <View style={styles.fieldContainer}>
            <Text variant="titleSmall" style={styles.fieldLabel}>
              Grau de Parentesco *
            </Text>
            <Controller
              control={control}
              name="relationship"
              render={({ field: { onChange } }) => (
                <View style={styles.relationshipContainer}>
                  {relationshipOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.relationshipOption,
                        relationship === option.value && styles.relationshipOptionSelected,
                      ]}
                      onPress={() => onChange(option.value)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={option.icon}
                        size={24}
                        color={relationship === option.value ? '#FFFFFF' : '#1976D2'}
                      />
                      <Text
                        variant="bodySmall"
                        style={[
                          styles.relationshipLabel,
                          relationship === option.value && styles.relationshipLabelSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.relationship && (
              <HelperText type="error" visible={!!errors.relationship}>
                {errors.relationship.message}
              </HelperText>
            )}
          </View>

          <View style={styles.divider} />

          {/* Email (Optional) */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="E-mail (Opcional)"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email" />}
                  style={styles.input}
                />
                {errors.email && (
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email.message}
                  </HelperText>
                )}
              </>
            )}
          />

          {/* Phone (Optional) */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Telefone (Opcional)"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.phone}
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone" />}
                  style={styles.input}
                  placeholder="(00) 00000-0000"
                />
                {errors.phone && (
                  <HelperText type="error" visible={!!errors.phone}>
                    {errors.phone.message}
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
          {isEditing ? 'Atualizar' : 'Adicionar'}
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
  formCard: {
    margin: 16,
    marginTop: 8,
    elevation: 1,
  },
  input: {
    marginBottom: 8,
  },
  fieldContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  fieldLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: Colors.text,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1976D2',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  genderOptionSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  genderLabel: {
    color: '#1976D2',
    fontWeight: '600',
  },
  genderLabelSelected: {
    color: '#FFFFFF',
  },
  relationshipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationshipOption: {
    width: '31%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1976D2',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  relationshipOptionSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  relationshipLabel: {
    color: '#1976D2',
    fontWeight: '600',
    textAlign: 'center',
  },
  relationshipLabelSelected: {
    color: '#FFFFFF',
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
