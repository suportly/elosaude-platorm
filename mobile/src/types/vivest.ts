/**
 * Tipos para o template de carteirinha Vivest
 * Baseado em data-model.md da feature 009-vivest-card-template
 */

import type { ViewStyle } from 'react-native';
import type { OracleReciprocidade } from './oracle';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Lista de planos EloSaude elegiveis para template Vivest
 */
export const VIVEST_ELIGIBLE_PLANS = [
  'ELOSAUDE EXECUTIVE - DIRETORES',
  'ELOSAUDE EXECUTIVE - GERENTES',
  'ELOSAUDE EXECUTIVE - DIRETORES - DIAMANTE',
  'ELOSAUDE EXECUTIVE - GERENTES - DIAMANTE',
  'ELOSAUDE EXECUTIVE - DIRETORES - PAMPA',
  'ELOSAUDE EXECUTIVE - GERENTES - PAMPA',
  'SAUDE MAIS',
  'SAUDE MAIS II',
] as const;

export type VIVESTEligiblePlan = typeof VIVEST_ELIGIBLE_PLANS[number];

/**
 * Paleta de cores do template Vivest
 */
export const VIVEST_COLORS = {
  primary: '#003366',
  primaryLight: '#004080',
  accent: '#CC0000',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  tagBackground: '#1A1A1A',
} as const;

/**
 * Informacoes estaticas da Vivest
 */
export const VIVEST_STATIC_INFO = {
  planAnsNumber: 'ANS Nº 31547-8',
  operatorAnsNumber: 'ANS-nº 417297',
  gracePeriodTitle: 'Carências',
  gracePeriodText: 'Sem carências',
  operatorLabel: 'OPERADORA CONTRATADA',
  regulatedPlanLabel: 'Plano Regulamentado',
  contacts: {
    passwordRelease: {
      label: 'Liberação de senha',
      phones: ['(11) 3329-3701'],
    },
    disqueVivest: {
      label: 'Disque-Vivest',
      phones: ['0800 016 6633'],
    },
    ans: {
      label: 'ANS',
      phone: '0800 701 9656',
    },
    websites: {
      vivest: 'vivest.com.br',
      ans: 'ans.gov.br',
    },
  },
} as const;

// =============================================================================
// DATA INTERFACES
// =============================================================================

/**
 * Informacoes de contato para o verso do cartao
 */
export interface VIVESTContactInfo {
  passwordRelease: {
    label: string;
    phones: readonly string[];
  };
  disqueVivest: {
    label: string;
    phones: readonly string[];
  };
  ans: {
    label: string;
    phone: string;
  };
  websites: {
    vivest: string;
    ans: string;
  };
}

/**
 * Dados formatados para exibicao no template Vivest
 * Combina OracleReciprocidade + Beneficiary + valores derivados/estaticos
 */
export interface VIVESTCardData {
  // === FRENTE ===

  // Header
  planName: string;

  // Body - Identificacao
  registrationNumber: string;
  beneficiaryName: string;

  // Body - Grid Principal (3 colunas x 2 linhas)
  birthDate: string;
  effectiveDate: string;
  planRegistry: string;
  accommodation: string;
  coverage: string;
  contractor: string;

  // Body - Footer
  segmentation: string;
  partialCoverage: string;

  // === VERSO ===

  // Header
  gracePeriodTitle: string;
  planAnsNumber: string;

  // Body
  gracePeriodText: string;

  // Footer - ANS Operadora
  operatorLabel: string;
  operatorAnsNumber: string;

  // Footer - CNS
  regulatedPlanLabel: string;
  cnsNumber: string;

  // Footer - Contatos
  contacts: VIVESTContactInfo;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

/**
 * Props do componente principal VIVESTCardTemplate
 */
export interface VIVESTCardTemplateProps {
  /** Dados do cartao de reciprocidade da API */
  cardData: OracleReciprocidade;

  /** Dados do beneficiario logado */
  beneficiary: {
    full_name: string;
    company?: string;
    birth_date?: string;
    effective_date?: string;
    cns?: string;
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
 * Props do componente VIVESTHeader
 */
export interface VIVESTHeaderProps {
  /** Nome do plano para exibir no box */
  planName: string;
  /** Variante: frente mostra logo+plano, verso mostra titulo+ANS */
  variant: 'front' | 'back';
  /** Numero ANS (apenas para variant='back') */
  ansNumber?: string;
}

/**
 * Props do componente VIVESTBodyFront
 */
export interface VIVESTBodyFrontProps {
  registrationNumber: string;
  beneficiaryName: string;
  gridData: {
    birthDate: string;
    effectiveDate: string;
    planRegistry: string;
    accommodation: string;
    coverage: string;
    contractor: string;
  };
  segmentation: string;
  partialCoverage: string;
}

/**
 * Props do componente VIVESTBodyBack
 */
export interface VIVESTBodyBackProps {
  gracePeriodText: string;
  operatorAnsNumber: string;
  cnsNumber: string;
  contacts: VIVESTContactInfo;
}

/**
 * Props do componente VIVESTDecorativeLines
 */
export interface VIVESTDecorativeLinesProps {
  /** Posicao: superior-direito ou inferior-direito */
  position: 'top-right' | 'bottom-right';
  /** Largura do container pai */
  width: number;
  /** Altura do container pai */
  height: number;
}
