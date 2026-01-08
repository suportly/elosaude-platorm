/**
 * Tipos para o template de carteirinha Eletros-Saude
 * Baseado em data-model.md da feature 010-eletros-card-template
 */

import type { ViewStyle } from 'react-native';
import type { OracleReciprocidade } from './oracle';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Paleta de cores do template Eletros-Saude
 */
export const ELETROS_COLORS = {
  // Header (Frente) - Area Azul (camada inferior)
  headerBlueStart: '#004a80',
  headerBlueEnd: '#e5f3ff',
  // Header (Frente) - Area Verde (camada superior, sobrepoe o azul)
  headerGreenStart: '#99cc33',
  headerGreenEnd: '#e6f2c2',

  // Textos
  textWhite: '#FFFFFF',
  textDark: '#333333',
  textGray: '#666666',

  // Destaques
  highlightRed: '#E53935',
  dividerGreen: '#4CAF50',

  // Logo colorido
  logoIconColor: '#2E7D87',
  logoTextGray: '#4A4A4A',
  logoTextGreen: '#4CAF50',

  // Tags e backgrounds
  ansTagBackground: '#000000',
  ansTagBorder: '#FFFFFF',
  cardBackground: '#FFFFFF',
} as const;

/**
 * Informacoes estaticas da Eletros-Saude
 */
export const ELETROS_STATIC_INFO = {
  ansNumber: 'ANS - No 42.207-0',
  legalText:
    'Apresentacao obrigatoria na utilizacao dos servicos, acompanhada do documento oficial de identidade.',
  transferabilityNote: 'Este cartao e pessoal e intransferivel, sendo vedado o uso por terceiros.',
  contacts: {
    eletrosSaude: {
      label: 'Eletros-Saude:',
      phone: '(21) 3900-3132 (8h as 17h)',
      website: 'www.eletrossaude.com.br',
    },
    emergencyService: {
      label: 'Plantao Emergencial:',
      phones: ['(21) 99681-8015', '(21) 99681-7223'],
      hours: 'Das 17h as 8h e 24h por dia aos sabados, domingos e feriados.',
    },
    ans: {
      label: 'Disque ANS:',
      phone: '0800 7019656',
      website: 'www.ans.gov.br',
    },
  },
} as const;

// =============================================================================
// DATA INTERFACES
// =============================================================================

/**
 * Informacoes de contato para o verso do cartao
 */
export interface ELETROSContactInfo {
  eletrosSaude: {
    readonly label: string;
    readonly phone: string;
    readonly website: string;
  };
  emergencyService: {
    readonly label: string;
    readonly phones: readonly string[];
    readonly hours: string;
  };
  ans: {
    readonly label: string;
    readonly phone: string;
    readonly website: string;
  };
}

/**
 * Dados formatados para exibicao no template Eletros-Saude
 */
export interface ELETROSCardData {
  // === FRENTE ===

  // Header
  ansNumber: string;

  // Body - Identificacao
  registrationNumber: string;
  beneficiaryName: string;

  // Body - Grid Principal (3 colunas)
  birthDate: string;
  validityDate: string;
  planName: string;

  // Body - Footer
  legalText: string;

  // === VERSO ===

  // Body - Dados Tecnicos
  segmentation: string;
  accommodation: string;
  coverage: string;
  contractType: string;
  utiMobile: string;
  cpt: string;

  // Body - Contatos
  contacts: ELETROSContactInfo;

  // Body - Nota
  transferabilityNote: string;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

/**
 * Props do componente principal ELETROSCardTemplate
 */
export interface ELETROSCardTemplateProps {
  /** Dados do cartao de reciprocidade da API */
  cardData: OracleReciprocidade;

  /** Dados do beneficiario logado */
  beneficiary: {
    full_name: string;
    birth_date?: string;
  };

  /** Callback quando o card e pressionado (opcional) */
  onPress?: () => void;

  /** Estilo customizado do container (opcional) */
  style?: ViewStyle;

  /** Estado inicial do flip - true = verso visivel (opcional) */
  initialFlipped?: boolean;

  /** Mostrar QR Code (opcional) */
  showQR?: boolean;
}

/**
 * Props do componente ELETROSHeader
 */
export interface ELETROSHeaderProps {
  /** Variante: frente (logo branco sobre curva) ou verso (logo colorido) */
  variant: 'front' | 'back';
}

/**
 * Props do componente ELETROSLogo
 */
export interface ELETROSLogoProps {
  /** Variante de cor: branco para header azul, colorido para header branco */
  variant: 'white' | 'colored';
  /** Largura do logo */
  width?: number;
  /** Altura do logo */
  height?: number;
}

/**
 * Props do componente ELETROSCurvedBackground
 */
export interface ELETROSCurvedBackgroundProps {
  /** Largura do container pai */
  width: number;
  /** Altura total do card */
  height: number;
}

/**
 * Props do componente ELETROSBodyFront
 */
export interface ELETROSBodyFrontProps {
  registrationNumber: string;
  beneficiaryName: string;
  gridData: {
    birthDate: string;
    validityDate: string;
    planName: string;
  };
  legalText: string;
}

/**
 * Props do componente ELETROSBodyBack
 */
export interface ELETROSBodyBackProps {
  technicalData: {
    segmentation: string;
    accommodation: string;
    coverage: string;
    contractType: string;
    utiMobile: string;
    cpt: string;
  };
  contacts: ELETROSContactInfo;
  transferabilityNote: string;
}
