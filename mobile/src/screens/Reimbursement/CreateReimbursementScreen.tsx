import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  HelperText,
  List,
  Chip,
  ActivityIndicator,
  ProgressBar,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { reimbursementSchema } from '../../utils/validationSchemas';
import { formatCurrency, maskCurrency, formatDate } from '../../utils/formatters';
import { useCreateReimbursementMutation } from '../../store/services/api';
import { DatePickerModal } from 'react-native-paper-dates';
import DocumentUploader, { UploadedDocument } from '../../components/DocumentUploader';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { uploadFiles, validateFiles, UploadedFileResponse } from '../../utils/fileUploader';

const EXPENSE_TYPES = [
  { value: 'CONSULTATION', label: 'Consulta' },
  { value: 'EXAM', label: 'Exame' },
  { value: 'MEDICATION', label: 'Medicamento' },
  { value: 'HOSPITALIZATION', label: 'Internação' },
  { value: 'SURGERY', label: 'Cirurgia' },
  { value: 'THERAPY', label: 'Terapia' },
  { value: 'OTHER', label: 'Outro' },
];

const ACCOUNT_TYPES = [
  { value: 'CORRENTE', label: 'Conta Corrente' },
  { value: 'POUPANCA', label: 'Poupança' },
];

interface FormData {
  expense_type: string;
  service_date: Date;
  provider_name: string;
  provider_cnpj_cpf: string;
  requested_amount: number;
  bank_details: {
    bank_name: string;
    agency: string;
    account: string;
    account_type: string;
  };
  documents: any[];
}

const CreateReimbursementScreen = ({ navigation }: any) => {
  const beneficiary = useSelector((state: RootState) => state.auth.beneficiary);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [createReimbursement, { isLoading }] = useCreateReimbursementMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(reimbursementSchema),
    defaultValues: {
      service_date: new Date(),
      bank_details: {
        account_type: 'CORRENTE',
      },
    },
  });

  const selectedExpenseType = watch('expense_type');
  const serviceDate = watch('service_date');

  const handleDocumentsChange = (newDocuments: UploadedDocument[]) => {
    setDocuments(newDocuments);
    setValue('documents', newDocuments);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!beneficiary) {
        Alert.alert('Erro', 'Beneficiário não encontrado. Por favor, faça login novamente.');
        return;
      }

      if (!accessToken) {
        Alert.alert('Erro', 'Sessão expirada. Por favor, faça login novamente.');
        return;
      }

      // Validate documents before submission
      if (documents.length === 0) {
        Alert.alert(
          'Documentos Necessários',
          'Por favor, anexe pelo menos um documento (nota fiscal, receita ou recibo).'
        );
        return;
      }

      // Validate file sizes and types
      const validation = validateFiles(documents);
      if (!validation.valid) {
        Alert.alert(
          'Erro de Validação',
          validation.errors.join('\n')
        );
        return;
      }

      // Step 1: Upload documents
      setIsUploading(true);
      setUploadProgress(0);

      const uploadedFiles = await uploadFiles(
        {
          documents,
          uploadType: 'REIMBURSEMENT',
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
          onError: (error) => {
            console.error('Upload error:', error);
          },
        },
        accessToken
      );

      if (!uploadedFiles || uploadedFiles.length === 0) {
        setIsUploading(false);
        Alert.alert('Erro', 'Falha ao enviar documentos. Tente novamente.');
        return;
      }

      setIsUploading(false);

      // Step 2: Create reimbursement with uploaded document IDs
      const payload = {
        ...data,
        beneficiary: beneficiary.id,
        requested_amount: data.requested_amount.toString(),
        service_date: data.service_date.toISOString().split('T')[0],
        bank_details: JSON.stringify(data.bank_details),
        documents: uploadedFiles.map((file: UploadedFileResponse) => file.id),
      };

      await createReimbursement(payload).unwrap();

      Alert.alert(
        'Sucesso',
        'Solicitação de reembolso enviada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      setIsUploading(false);
      console.error('Reimbursement submission error:', error);
      Alert.alert(
        'Erro',
        error?.data?.error || 'Não foi possível enviar a solicitação. Tente novamente.'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Card.Title title="Informações do Serviço" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {/* Expense Type */}
          <Text style={styles.label}>Tipo de Despesa *</Text>
          <View style={styles.chipContainer}>
            {EXPENSE_TYPES.map((type) => (
              <Controller
                key={type.value}
                control={control}
                name="expense_type"
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
          {errors.expense_type && (
            <HelperText type="error">{errors.expense_type.message}</HelperText>
          )}

          {/* Service Date */}
          <Controller
            control={control}
            name="service_date"
            render={({ field: { onChange, value } }) => (
              <>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  icon="calendar"
                  style={styles.dateButton}
                >
                  Data do Serviço: {formatDate(value)}
                </Button>
                <DatePickerModal
                  locale="pt"
                  mode="single"
                  visible={showDatePicker}
                  onDismiss={() => setShowDatePicker(false)}
                  date={value}
                  onConfirm={(params) => {
                    setShowDatePicker(false);
                    if (params.date) onChange(params.date);
                  }}
                  validRange={{
                    endDate: new Date(),
                  }}
                />
              </>
            )}
          />
          {errors.service_date && (
            <HelperText type="error">{errors.service_date.message}</HelperText>
          )}

          {/* Provider Name */}
          <Controller
            control={control}
            name="provider_name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Nome do Prestador *"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                style={styles.input}
                error={!!errors.provider_name}
              />
            )}
          />
          {errors.provider_name && (
            <HelperText type="error">{errors.provider_name.message}</HelperText>
          )}

          {/* Provider CNPJ/CPF */}
          <Controller
            control={control}
            name="provider_cnpj_cpf"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="CNPJ/CPF do Prestador *"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.provider_cnpj_cpf}
              />
            )}
          />
          {errors.provider_cnpj_cpf && (
            <HelperText type="error">{errors.provider_cnpj_cpf.message}</HelperText>
          )}

          {/* Requested Amount */}
          <Controller
            control={control}
            name="requested_amount"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Valor Solicitado *"
                value={value ? maskCurrency(value.toString()) : ''}
                onChangeText={(text) => {
                  const numbers = text.replace(/\D/g, '');
                  onChange(parseFloat(numbers) / 100 || 0);
                }}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.requested_amount}
                left={<TextInput.Icon icon="currency-brl" />}
              />
            )}
          />
          {errors.requested_amount && (
            <HelperText type="error">{errors.requested_amount.message}</HelperText>
          )}
        </Card.Content>
      </Card>

      {/* Bank Details */}
      <Card style={styles.section}>
        <Card.Title title="Dados Bancários" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <Controller
            control={control}
            name="bank_details.bank_name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Nome do Banco *"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                style={styles.input}
                error={!!errors.bank_details?.bank_name}
              />
            )}
          />

          <View style={styles.row}>
            <Controller
              control={control}
              name="bank_details.agency"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Agência *"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfWidth]}
                  error={!!errors.bank_details?.agency}
                />
              )}
            />

            <Controller
              control={control}
              name="bank_details.account"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Conta *"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfWidth]}
                  error={!!errors.bank_details?.account}
                />
              )}
            />
          </View>

          <Text style={styles.label}>Tipo de Conta *</Text>
          <View style={styles.chipContainer}>
            {ACCOUNT_TYPES.map((type) => (
              <Controller
                key={type.value}
                control={control}
                name="bank_details.account_type"
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
        </Card.Content>
      </Card>

      {/* Documents */}
      <Card style={styles.section}>
        <Card.Title title="Documentos *" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <Text style={styles.helperText}>
            Anexe nota fiscal, receita médica e/ou recibos (obrigatório)
          </Text>

          <DocumentUploader
            documents={documents}
            onDocumentsChange={handleDocumentsChange}
            maxFiles={5}
            label=""
          />

          {errors.documents && (
            <HelperText type="error">{errors.documents.message}</HelperText>
          )}

          {isUploading && (
            <View style={styles.uploadProgressContainer}>
              <Text style={styles.uploadProgressText}>
                Enviando documentos...
              </Text>
              <ProgressBar
                progress={uploadProgress}
                color="#20a490"
                style={styles.uploadProgressBar}
              />
              <Text style={styles.uploadProgressPercentage}>
                {Math.round(uploadProgress * 100)}%
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading || isUploading}
          disabled={isLoading || isUploading}
          style={styles.submitButton}
          buttonColor="#20a490"
        >
          {isUploading ? 'Enviando Documentos...' : isLoading ? 'Enviando...' : 'Enviar Solicitação'}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={isLoading || isUploading}
        >
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
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
  dateButton: {
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  documentItem: {
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
    borderRadius: 4,
  },
  uploadButton: {
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
  uploadProgressContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F0F9F7',
    borderRadius: 8,
  },
  uploadProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20a490',
    marginBottom: 8,
  },
  uploadProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  uploadProgressPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});

export default CreateReimbursementScreen;
