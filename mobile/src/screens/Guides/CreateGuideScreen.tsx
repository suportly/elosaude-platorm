import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  HelperText,
  Chip,
  List,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { guideSchema } from '../../utils/validationSchemas';
import { useCreateGuideMutation, useGetProvidersQuery } from '../../store/services/api';
import DocumentUploader, { UploadedDocument } from '../../components/DocumentUploader';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const GUIDE_TYPES = [
  { value: 'CONSULTATION', label: 'Consulta' },
  { value: 'SP_SADT', label: 'SP/SADT (Exames)' },
  { value: 'HOSPITALIZATION', label: 'Internação' },
  { value: 'EMERGENCY', label: 'Emergência' },
];

interface FormData {
  guide_type: string;
  provider: number;
  diagnosis: string;
  observations: string;
  requesting_physician_name: string;
  requesting_physician_crm: string;
  procedure_ids: number[];
  quantities: number[];
}

const CreateGuideScreen = ({ navigation }: any) => {
  const beneficiary = useSelector((state: RootState) => state.auth.beneficiary);

  const [providerSearch, setProviderSearch] = useState('');
  const [showProviderList, setShowProviderList] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const { data: providers, isLoading: loadingProviders } = useGetProvidersQuery({
    search: providerSearch,
  });

  const [createGuide, { isLoading }] = useCreateGuideMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(guideSchema),
    defaultValues: {
      procedure_ids: [],
      quantities: [],
    },
  });

  const selectedGuideType = watch('guide_type');

  const selectProvider = (provider: any) => {
    setSelectedProvider(provider);
    setValue('provider', provider.id);
    setShowProviderList(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!beneficiary) {
        Alert.alert('Erro', 'Beneficiário não encontrado. Por favor, faça login novamente.');
        return;
      }

      const payload = {
        ...data,
        beneficiary: beneficiary.id,
      };

      await createGuide(payload).unwrap();

      Alert.alert(
        'Sucesso',
        'Solicitação de guia enviada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating guide:', error);

      let errorMessage = 'Não foi possível enviar a solicitação. Tente novamente.';

      if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.data?.non_field_errors) {
        errorMessage = error.data.non_field_errors[0];
      }

      Alert.alert('Erro', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Card.Title title="Tipo de Guia" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <View style={styles.chipContainer}>
            {GUIDE_TYPES.map((type) => (
              <Controller
                key={type.value}
                control={control}
                name="guide_type"
                render={({ field: { onChange, value } }) => (
                  <Chip
                    selected={value === type.value}
                    onPress={() => onChange(type.value)}
                    style={styles.chip}
                  >
                    {type.label}
                  </Chip>
                )}
              />
            ))}
          </View>
          {errors.guide_type && (
            <HelperText type="error">{errors.guide_type.message}</HelperText>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Prestador" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {!selectedProvider ? (
            <>
              <Searchbar
                placeholder="Buscar prestador..."
                onChangeText={setProviderSearch}
                value={providerSearch}
                onFocus={() => setShowProviderList(true)}
                style={styles.searchBar}
              />

              {showProviderList && providers && (
                <View style={styles.providerList}>
                  {loadingProviders ? (
                    <ActivityIndicator />
                  ) : (
                    providers.slice(0, 5).map((provider) => (
                      <List.Item
                        key={provider.id}
                        title={provider.name}
                        description={`${provider.city} - ${provider.provider_type_display}`}
                        onPress={() => selectProvider(provider)}
                        left={(props) => <List.Icon {...props} icon="hospital-building" />}
                      />
                    ))
                  )}
                </View>
              )}
            </>
          ) : (
            <View style={styles.selectedProvider}>
              <List.Item
                title={selectedProvider.name}
                description={selectedProvider.city}
                left={(props) => <List.Icon {...props} icon="hospital-building" />}
                right={(props) => (
                  <Button onPress={() => {
                    setSelectedProvider(null);
                    setValue('provider', 0);
                  }}>
                    Alterar
                  </Button>
                )}
              />
            </View>
          )}
          {errors.provider && (
            <HelperText type="error">{errors.provider.message}</HelperText>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Informações Médicas" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <Controller
            control={control}
            name="requesting_physician_name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Nome do Médico Solicitante *"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                style={styles.input}
                error={!!errors.requesting_physician_name}
              />
            )}
          />
          {errors.requesting_physician_name && (
            <HelperText type="error">{errors.requesting_physician_name.message}</HelperText>
          )}

          <Controller
            control={control}
            name="requesting_physician_crm"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="CRM do Médico *"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                style={styles.input}
                error={!!errors.requesting_physician_crm}
              />
            )}
          />
          {errors.requesting_physician_crm && (
            <HelperText type="error">{errors.requesting_physician_crm.message}</HelperText>
          )}

          <Controller
            control={control}
            name="diagnosis"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Diagnóstico (CID) *"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                error={!!errors.diagnosis}
              />
            )}
          />
          {errors.diagnosis && (
            <HelperText type="error">{errors.diagnosis.message}</HelperText>
          )}

          <Controller
            control={control}
            name="observations"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Observações"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Procedimentos" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <Text style={styles.helperText}>
            Selecione os procedimentos solicitados (funcionalidade completa em desenvolvimento)
          </Text>
          
          <Button
            mode="outlined"
            icon="plus"
            onPress={() => {
              Alert.alert(
                'Em Desenvolvimento',
                'Seleção de procedimentos TUSS será implementada em breve'
              );
            }}
            style={styles.procedureButton}
          >
            Adicionar Procedimento
          </Button>

          {errors.procedure_ids && (
            <HelperText type="error">{errors.procedure_ids.message}</HelperText>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading || !selectedProvider}
          style={styles.submitButton}
          buttonColor="#20a490"
        >
          Enviar Solicitação
        </Button>

        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.cancelButton}>
          Cancelar
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 8,
  },
  providerList: {
    maxHeight: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    elevation: 2,
  },
  selectedProvider: {
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#20a490',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  procedureButton: {
    marginTop: 8,
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 12,
  },
});

export default CreateGuideScreen;
