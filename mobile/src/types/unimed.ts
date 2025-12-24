/**
 * Tipos para o template de carteirinha Unimed
 * Baseado em data-model.md
 */

import type { ViewStyle } from 'react-native';
import type { OracleUnimed } from './oracle';

/**
 * Dados formatados para exibição no template Unimed
 * Combina OracleUnimed + Beneficiary + valores derivados
 */
export interface UnimedCardData {
  // Header
  contractType: string;

  // Body - Identificação
  cardNumber: string;
  beneficiaryName: string;

  // Body - Grid Principal
  accommodation: string;
  validity: string;
  planType: string;
  networkCode: string;
  coverage: string;
  serviceCode: string;

  // Body - Segmentação
  assistanceSegmentation: string;

  // Footer - Datas
  birthDate: string;
  effectiveDate: string;

  // Footer - Cobertura
  partialCoverage: string;
  cardEdition: string;

  // Footer - Contratante
  contractor: string;

  // Footer - ANS
  ansInfo: string;
}

/**
 * Props do componente principal UnimedCardTemplate
 */
export interface UnimedCardTemplateProps {
  /** Dados do cartão Unimed da API */
  cardData: OracleUnimed;

  /** Dados do beneficiário logado */
  beneficiary: {
    full_name: string;
    company?: string;
    birth_date?: string;
    effective_date?: string;
  };

  /** Callback quando o card é pressionado (opcional) */
  onPress?: () => void;

  /** Mostrar QR Code (opcional) */
  showQRCode?: boolean;

  /** Estilo customizado do container (opcional) */
  style?: ViewStyle;
}

/**
 * Props do componente UnimedHeader
 */
export interface UnimedHeaderProps {
  /** Tipo de contrato (ex: "COLETIVO EMPRESARIAL") */
  contractType: string;
}

/**
 * Props do componente UnimedBody
 */
export interface UnimedBodyProps {
  /** Número da carteirinha formatado */
  cardNumber: string;

  /** Nome do beneficiário */
  beneficiaryName: string;

  /** Grid de informações */
  gridData: {
    accommodation: string;
    validity: string;
    planType: string;
    networkCode: string;
    coverage: string;
    serviceCode: string;
  };

  /** Texto de segmentação assistencial */
  assistanceSegmentation: string;
}

/**
 * Props do componente UnimedFooter
 */
export interface UnimedFooterProps {
  /** Data de nascimento formatada */
  birthDate: string;

  /** Data de vigência formatada */
  effectiveDate: string;

  /** Cobertura parcial temporária */
  partialCoverage: string;

  /** Via/Edição do cartão */
  cardEdition: string;

  /** Nome da contratante */
  contractor: string;

  /** Informações ANS */
  ansInfo: string;
}
