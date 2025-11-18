/**
 * Oracle Integration Types
 * Types for Oracle database cards (DBAPS views)
 */

/**
 * Carteirinha Elosaúde (ESAU_V_APP_CARTEIRINHA)
 */
export interface OracleCarteirinha {
  CONTRATO: number;
  MATRICULA_SOUL: number;
  NR_CPF: number;
  NOME_DO_BENEFICIARIO: string;
  MATRICULA: string;
  CD_PLANO: number;
  PRIMARIO: string;
  SEGMENTACAO: string;
  NR_CNS: string;
  NASCTO: string; // Date format: DD/MM/YYYY
  NM_SOCIAL: string;
  SN_ATIVO: string; // 'S' or 'N'
  DT_INICIO_VIGENCIA?: string;
  DT_FIM_VIGENCIA?: string;
  TP_BENEFICIARIO?: string;
  CD_TIPO_BENEFICIARIO?: number;
  NR_SEQUENCIA?: number;
}

/**
 * Carteirinha Unimed (ESAU_V_APP_UNIMED)
 */
export interface OracleUnimed {
  MATRICULA_UNIMED: string;
  PLANO: string;
  ABRANGENCIA: string;
  ACOMODACAO: string;
  Validade: string; // Date ISO format
  CPF?: number;
  NOME?: string;
  DATA_NASCIMENTO?: string;
  sn_ativo?: string; // Note: case sensitivity issue
  SN_ATIVO?: string;
}

/**
 * Carteirinha Reciprocidade (ESAU_V_APP_RECIPROCIDADE)
 */
export interface OracleReciprocidade {
  CD_MATRICULA_RECIPROCIDADE: string;
  PRESTADOR_RECIPROCIDADE: string;
  DT_VALIDADE_CARTEIRA: string; // Date ISO format
  PLANO_ELOSAUDE: string;
  NR_CPF?: number;
  NOME_BENEFICIARIO?: string;
  DT_NASCIMENTO?: string;
  SN_ATIVO?: string;
}

/**
 * Response from /api/oracle-cards/my_oracle_cards/
 */
export interface OracleCardsResponse {
  carteirinha: OracleCarteirinha[];
  unimed: OracleUnimed[];
  reciprocidade: OracleReciprocidade[];
  total_cards: number;
}

/**
 * Card type enum for rendering
 */
export enum OracleCardType {
  ELOSAUDE = 'elosaude',
  UNIMED = 'unimed',
  RECIPROCIDADE = 'reciprocidade',
}

/**
 * Generic Oracle card props for component
 */
export interface OracleCardProps {
  type: OracleCardType;
  data: OracleCarteirinha | OracleUnimed | OracleReciprocidade;
  onPress?: () => void;
}

/**
 * Test connection response
 */
export interface OracleTestConnectionResponse {
  status: 'connected' | 'error';
  database?: string;
  active_records?: {
    carteirinha: number;
    unimed: number;
    reciprocidade: number;
    total: number;
  };
  error?: string;
}
