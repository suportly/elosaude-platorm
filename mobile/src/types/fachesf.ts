/**
 * Tipos para o template de carteirinha Fachesf
 * Baseado em data-model.md da feature 011-fachesf-card-template
 */

import type { ViewStyle } from 'react-native';
import type { OracleReciprocidade } from './oracle';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Paleta de cores do template Fachesf
 */
export const FACHESF_COLORS = {
  // Background
  cardBackground: '#FFFFFF',

  // Badge/Accent
  accent: '#2BB673',
  accentDark: '#00A88F',

  // Textos
  textValue: '#333333',
  textLabel: '#999999',
  textDark: '#000000',
  textWhite: '#FFFFFF',

  // Divisores
  divider: '#E0E0E0',

  // Input box border (vermelho/rosa como na carteirinha original)
  inputBorder: '#E91E63',
  inputBackground: '#FFFFFF',
} as const;

/**
 * Informacoes estaticas da Fachesf
 */
export const FACHESF_STATIC_INFO = {
  ansNumber: '31723-3',
  legalText: 'Esta carteira so e valida mediante apresentacao de documento de identificacao do portador.',
  contactsTitle: 'Telefones para Contato',
  contacts: {
    credenciado: {
      label: 'CREDENCIADO',
      phone: '0800 281 7540',
    },
    beneficiario: {
      label: 'BENEFICIARIO',
      phone: '0800 281 7533',
    },
  },
} as const;

// =============================================================================
// DATA INTERFACES
// =============================================================================

/**
 * Informacoes de contato para o rodape do cartao
 */
export interface FACHESFContacts {
  credenciado: {
    label: string;
    phone: string;
  };
  beneficiario: {
    label: string;
    phone: string;
  };
}

/**
 * Dados formatados para exibicao no template Fachesf
 * Combina OracleReciprocidade + Beneficiary + valores derivados/estaticos
 */
export interface FACHESFCardData {
  // Header
  planType: string;           // Tipo do plano (ex: "ESPECIAL")

  // Beneficiario
  beneficiaryName: string;    // Nome completo

  // Grid Linha 1
  registrationCode: string;   // Matricula/Codigo
  validityDate: string;       // Validade (formato DD/MM/YYYY)
  cnsNumber: string;          // CNS (ou "-" se nao disponivel)

  // Grid Linha 2
  accommodation: string;      // Tipo de acomodacao (ex: "Apartamento")
  coverage: string;           // Cobertura (ex: "Ambulatorial + Hospitalar c/obstetricia")

  // Footer
  contactsTitle: string;      // Titulo da secao de contatos
  contacts: FACHESFContacts;  // Telefones de contato
  ansNumber: string;          // Registro ANS (31723-3)

  // Legal
  legalText: string;          // Texto de aviso legal
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

/**
 * Props do componente principal FACHESFCardTemplate
 */
export interface FACHESFCardTemplateProps {
  /** Dados do cartao de reciprocidade da API */
  cardData: OracleReciprocidade;

  /** Dados do beneficiario logado */
  beneficiary: {
    full_name: string;
    birth_date?: string;
    cns?: string;
  };

  /** Callback quando o card e pressionado (opcional) */
  onPress?: () => void;

  /** Estilo customizado do container (opcional) */
  style?: ViewStyle;

  /** Mostrar QR Code (opcional) */
  showQR?: boolean;
}

/**
 * Props do componente FACHESFHeader
 */
export interface FACHESFHeaderProps {
  /** Nome do beneficiario */
  beneficiaryName: string;
  /** Tipo do plano para o badge (ex: "ESPECIAL") */
  planType: string;
}

/**
 * Props do componente FACHESFBody
 */
export interface FACHESFBodyProps {
  registrationCode: string;
  validityDate: string;
  cnsNumber: string;
  accommodation: string;
  coverage: string;
}

/**
 * Props do componente FACHESFFooter
 */
export interface FACHESFFooterProps {
  contactsTitle: string;
  contacts: FACHESFContacts;
  legalText: string;
}
