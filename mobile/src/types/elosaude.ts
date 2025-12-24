/**
 * Tipos para o template de carteirinha EloSaude
 * Design: Header branco com logo, body teal com dados, footer ANS
 */

import type { ViewStyle } from 'react-native';

/**
 * Dados formatados para exibição no template EloSaude
 */
export interface ElosaúdeCardData {
  // Header
  logoUrl?: string;

  // Body - Identificação Principal
  beneficiaryName: string;
  cardNumber: string; // Matrícula
  birthDate: string;

  // Body - Documentos
  cpf: string;
  cns: string; // Cartão Nacional de Saúde

  // Body - Plano
  segmentation: string; // Segmentação (ex: "AMBULATORIAL + HOSPITALAR C/ OBSTETRÍCIA")
  cpt: string; // Cobertura Parcial Temporária
  plans: string[]; // Lista de planos (ex: ["DENTAL EMPRESARIAL I"])

  // Body - Contrato
  contractType: string; // Contratação (ex: "COLETIVO EMPRESARIAL")
  holderName: string; // Titular
  validity: string; // Validade

  // Body - Avisos
  attentionText: string;
  warningText: string;

  // Footer - ANS
  ansRegistry: string;
}

/**
 * Props do componente principal ElosaúdeCardTemplate
 */
export interface ElosaúdeCardTemplateProps {
  /** Dados do cartão EloSaude */
  cardData: ElosaúdeCardData;

  /** Callback quando o card é pressionado (opcional) */
  onPress?: () => void;

  /** Mostrar QR Code (opcional) */
  showQRCode?: boolean;

  /** Estilo customizado do container (opcional) */
  style?: ViewStyle;
}

/**
 * Props do componente ElosaúdeHeader
 */
export interface ElosaúdeHeaderProps {
  /** URL do logo (opcional, usa padrão se não informado) */
  logoUrl?: string;
}

/**
 * Props do componente ElosaúdeBody
 */
export interface ElosaúdeBodyProps {
  /** Nome do beneficiário */
  beneficiaryName: string;

  /** Dados de identificação */
  identificationData: {
    cardNumber: string;
    birthDate: string;
    cpf: string;
    cns: string;
  };

  /** Dados do plano */
  planData: {
    segmentation: string;
    cpt: string;
    plans: string[];
    contractType: string;
    holderName: string;
    validity: string;
  };

  /** Textos de aviso */
  warnings: {
    attentionText: string;
    warningText: string;
  };
}

/**
 * Props do componente ElosaúdeFooter
 */
export interface ElosaúdeFooterProps {
  /** Registro ANS */
  ansRegistry: string;
}

/**
 * Grid item para pares de informação
 */
export interface GridItemProps {
  label: string;
  value: string;
  accessibilityLabel?: string;
}
