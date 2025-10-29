import * as yup from 'yup';

// Helper functions
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const cepRegex = /^\d{5}-\d{3}$/;

// CPF Validation
export const cpfSchema = yup
  .string()
  .matches(cpfRegex, 'CPF inválido. Use o formato: 000.000.000-00')
  .required('CPF é obrigatório');

// Phone Validation
export const phoneSchema = yup
  .string()
  .matches(phoneRegex, 'Telefone inválido. Use o formato: (00) 00000-0000');

// CEP Validation
export const cepSchema = yup
  .string()
  .matches(cepRegex, 'CEP inválido. Use o formato: 00000-000');

// ========================================
// LOGIN SCHEMA
// ========================================
export const loginSchema = yup.object().shape({
  cpf: cpfSchema,
  password: yup
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .required('Senha é obrigatória'),
});

// ========================================
// PROFILE SCHEMA
// ========================================
export const profileSchema = yup.object().shape({
  full_name: yup
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .required('Nome completo é obrigatório'),
  email: yup
    .string()
    .email('E-mail inválido')
    .required('E-mail é obrigatório'),
  phone: phoneSchema.optional(),
  mobile_phone: phoneSchema.optional(),
  address: yup.string().optional(),
  city: yup.string().optional(),
  state: yup
    .string()
    .length(2, 'Estado deve ter 2 caracteres')
    .optional(),
  zip_code: cepSchema.optional(),
});

// ========================================
// REIMBURSEMENT SCHEMA
// ========================================
export const reimbursementSchema = yup.object().shape({
  expense_type: yup
    .string()
    .oneOf(
      ['CONSULTATION', 'EXAM', 'MEDICATION', 'HOSPITALIZATION', 'SURGERY', 'THERAPY', 'OTHER'],
      'Tipo de despesa inválido'
    )
    .required('Tipo de despesa é obrigatório'),
  service_date: yup
    .date()
    .max(new Date(), 'Data do serviço não pode ser futura')
    .required('Data do serviço é obrigatória'),
  provider_name: yup
    .string()
    .min(3, 'Nome do prestador deve ter no mínimo 3 caracteres')
    .required('Nome do prestador é obrigatório'),
  provider_cnpj_cpf: yup
    .string()
    .min(11, 'CNPJ/CPF inválido')
    .required('CNPJ/CPF do prestador é obrigatório'),
  requested_amount: yup
    .number()
    .min(0.01, 'Valor deve ser maior que zero')
    .required('Valor solicitado é obrigatório'),
  bank_details: yup.object().shape({
    bank_name: yup.string().required('Nome do banco é obrigatório'),
    agency: yup.string().required('Agência é obrigatória'),
    account: yup.string().required('Conta é obrigatória'),
    account_type: yup
      .string()
      .oneOf(['CORRENTE', 'POUPANCA'], 'Tipo de conta inválido')
      .required('Tipo de conta é obrigatório'),
  }),
  documents: yup
    .array()
    .min(1, 'É necessário anexar pelo menos um documento')
    .required('Documentos são obrigatórios'),
});

// ========================================
// GUIDE REQUEST SCHEMA
// ========================================
export const guideSchema = yup.object().shape({
  guide_type: yup
    .string()
    .oneOf(
      ['SP_SADT', 'CONSULTATION', 'HOSPITALIZATION', 'EMERGENCY'],
      'Tipo de guia inválido'
    )
    .required('Tipo de guia é obrigatório'),
  provider: yup
    .number()
    .positive('Selecione um prestador válido')
    .required('Prestador é obrigatório'),
  diagnosis: yup
    .string()
    .min(10, 'Diagnóstico deve ter no mínimo 10 caracteres')
    .required('Diagnóstico é obrigatório'),
  observations: yup.string().optional(),
  requesting_physician_name: yup
    .string()
    .min(3, 'Nome do médico deve ter no mínimo 3 caracteres')
    .required('Nome do médico solicitante é obrigatório'),
  requesting_physician_crm: yup
    .string()
    .min(4, 'CRM inválido')
    .required('CRM do médico é obrigatório'),
  procedure_ids: yup
    .array()
    .of(yup.number().positive())
    .min(1, 'Selecione pelo menos um procedimento')
    .required('Procedimentos são obrigatórios'),
  quantities: yup
    .array()
    .of(yup.number().positive().integer())
    .optional(),
});

// ========================================
// CHANGE PASSWORD SCHEMA
// ========================================
export const changePasswordSchema = yup.object().shape({
  current_password: yup
    .string()
    .min(6, 'Senha atual deve ter no mínimo 6 caracteres')
    .required('Senha atual é obrigatória'),
  new_password: yup
    .string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter letras maiúsculas, minúsculas e números'
    )
    .required('Nova senha é obrigatória'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('new_password')], 'As senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
});

// ========================================
// DEPENDENT SCHEMA
// ========================================
export const dependentValidationSchema = yup.object().shape({
  full_name: yup
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .required('Nome completo é obrigatório'),
  cpf: yup
    .string()
    .required('CPF é obrigatório'),
  birth_date: yup
    .date()
    .max(new Date(), 'Data de nascimento não pode ser futura')
    .required('Data de nascimento é obrigatória'),
  gender: yup
    .string()
    .oneOf(['MALE', 'FEMALE', 'OTHER'], 'Sexo inválido')
    .required('Sexo é obrigatório'),
  relationship: yup
    .string()
    .oneOf(
      ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'],
      'Grau de parentesco inválido'
    )
    .required('Grau de parentesco é obrigatório'),
  email: yup
    .string()
    .email('E-mail inválido')
    .optional(),
  phone: yup.string().optional(),
});

// Backward compatibility
export const dependentSchema = dependentValidationSchema;

// ========================================
// CONTACT FORM SCHEMA
// ========================================
export const contactSchema = yup.object().shape({
  subject: yup
    .string()
    .min(5, 'Assunto deve ter no mínimo 5 caracteres')
    .required('Assunto é obrigatório'),
  message: yup
    .string()
    .min(20, 'Mensagem deve ter no mínimo 20 caracteres')
    .required('Mensagem é obrigatória'),
  category: yup
    .string()
    .oneOf(
      ['DOUBT', 'COMPLAINT', 'SUGGESTION', 'PRAISE', 'OTHER'],
      'Categoria inválida'
    )
    .required('Categoria é obrigatória'),
});

export default {
  loginSchema,
  profileSchema,
  reimbursementSchema,
  guideSchema,
  changePasswordSchema,
  dependentSchema,
  contactSchema,
};
