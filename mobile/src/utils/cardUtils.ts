/**
 * Funções utilitárias para formatação de dados das carteirinhas
 */

import type { OracleCarteirinha, OracleUnimed, OracleReciprocidade } from '../types/oracle';
import type { ElosaúdeCardData } from '../types/elosaude';
import type { UnimedCardData } from '../types/unimed';
import type { VIVESTCardData } from '../types/vivest';
import { VIVEST_ELIGIBLE_PLANS, VIVEST_STATIC_INFO } from '../types/vivest';

/**
 * Formata número da carteirinha com espaços
 * Ex: "0025076959600008" -> "0 025 076959600000 8"
 */
export function formatCardNumber(number: string | undefined): string {
  if (!number) return '-';

  // Remove espaços existentes
  const cleaned = number.replace(/\s/g, '');

  // Se o número tiver 16+ dígitos, formata no padrão Unimed
  if (cleaned.length >= 16) {
    return cleaned.replace(/^(.)(.{3})(.{11,12})(.)$/, '$1 $2 $3 $4');
  }

  // Para números menores, apenas adiciona espaços a cada 4 dígitos
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Formata data para DD/MM/YYYY
 */
export function formatDate(date: string | undefined): string {
  if (!date) return '-';

  try {
    // Tenta parsear diferentes formatos
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      // Se já estiver no formato DD/MM/YYYY, retorna como está
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        return date;
      }
      return '-';
    }

    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

/**
 * Deriva código de rede a partir do nome do plano
 */
export function deriveNetworkCode(plano: string | undefined): string {
  if (!plano) return 'N/A';

  const planoUpper = plano.toUpperCase();

  // Mapear códigos conhecidos baseados no nome do plano
  if (planoUpper.includes('BASICO') || planoUpper.includes('BÁSICO')) {
    return 'NA05 BASICO';
  }
  if (planoUpper.includes('ESPECIAL')) {
    return 'NA01 ESPECIAL';
  }
  if (planoUpper.includes('EXECUTIVO')) {
    return 'NA02 EXECUTIVO';
  }
  if (planoUpper.includes('PREMIUM')) {
    return 'NA03 PREMIUM';
  }

  return 'N/A';
}

/**
 * Extrai código de serviço dos primeiros 4 dígitos da matrícula
 */
export function extractServiceCode(matricula: string | undefined): string {
  if (!matricula) return '-';

  const cleaned = matricula.replace(/\s/g, '');
  return cleaned.substring(0, 4) || '-';
}

/**
 * Transforma dados da API em formato para exibição no template
 */
export function extractUnimedCardData(
  oracleData: OracleUnimed,
  beneficiary: {
    full_name: string;
    company?: string;
    birth_date?: string;
    effective_date?: string;
  }
): UnimedCardData {
  return {
    // Header
    contractType: 'COLETIVO EMPRESARIAL',

    // Body - Identificação
    cardNumber: formatCardNumber(oracleData.MATRICULA_UNIMED),
    beneficiaryName: (oracleData.NOME || beneficiary.full_name || '-').toUpperCase(),

    // Body - Grid
    accommodation: oracleData.ACOMODACAO || 'Não informado',
    validity: formatDate(oracleData.Validade),
    planType: oracleData.PLANO || '-',
    networkCode: deriveNetworkCode(oracleData.PLANO),
    coverage: oracleData.ABRANGENCIA || '-',
    serviceCode: extractServiceCode(oracleData.MATRICULA_UNIMED),

    // Body - Segmentação
    assistanceSegmentation: 'AMBULATORIAL + HOSPITALAR COM OBSTETRÍCIA',

    // Footer - Datas
    birthDate: formatDate(beneficiary.birth_date),
    effectiveDate: formatDate(beneficiary.effective_date),

    // Footer - Cobertura
    partialCoverage: 'NÃO HÁ',
    cardEdition: 'Única',

    // Footer - Contratante
    contractor: beneficiary.company || '-',

    // Footer - ANS
    ansInfo: 'ANS 000000 | www.unimedsc.com.br',
  };
}

/**
 * Formata CPF com pontuação
 * Ex: "12345678900" -> "123.456.789-00"
 */
export function formatCPF(cpf: string | number | undefined): string {
  if (!cpf) return '-';
  const cleaned = String(cpf).padStart(11, '0').replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Transforma dados da API em formato para exibição no template EloSaude
 */
export function extractElosaúdeCardData(
  oracleData: OracleCarteirinha,
  beneficiary: {
    full_name: string;
    company?: string;
    birth_date?: string;
    effective_date?: string;
  }
): ElosaúdeCardData {
  return {
    // Header
    logoUrl: undefined,

    // Body - Identificação Principal
    beneficiaryName: (oracleData.NOME_DO_BENEFICIARIO || oracleData.NM_SOCIAL || beneficiary.full_name || '-').toUpperCase(),
    cardNumber: oracleData.MATRICULA || '-',
    birthDate: oracleData.NASCTO || formatDate(beneficiary.birth_date) || '-',

    // Body - Documentos
    cpf: formatCPF(oracleData.NR_CPF),
    cns: oracleData.NR_CNS || '-',

    // Body - Plano
    segmentation: oracleData.SEGMENTACAO || 'AMBULATORIAL + HOSPITALAR C/ OBSTETRÍCIA',
    cpt: 'NÃO',
    plans: oracleData.PRIMARIO ? [oracleData.PRIMARIO] : [],

    // Body - Contrato
    contractType: 'COLETIVO EMPRESARIAL',
    holderName: (oracleData.NOME_DO_BENEFICIARIO || beneficiary.full_name || '-').toUpperCase(),
    validity: oracleData.DT_FIM_VIGENCIA ? formatDate(oracleData.DT_FIM_VIGENCIA) : 'INDETERMINADA',

    // Body - Avisos
    attentionText: 'Carteira provisória. Apresentar documento de identidade com foto.',
    warningText: 'O USO INDEVIDO DESTA CARTEIRA CONSTITUI CRIME (LEI Nº 9.656/98)',

    // Footer - ANS
    ansRegistry: '418650',
  };
}

/**
 * Verifica se um cartao de reciprocidade e elegivel para template Vivest
 * Condicoes: PRESTADOR_RECIPROCIDADE = 'VIVEST' E PLANO_ELOSAUDE na lista de planos elegiveis
 */
export function isVIVESTEligible(card: OracleReciprocidade): boolean {
  return (
    card.PRESTADOR_RECIPROCIDADE === 'VIVEST' &&
    VIVEST_ELIGIBLE_PLANS.includes(card.PLANO_ELOSAUDE as typeof VIVEST_ELIGIBLE_PLANS[number])
  );
}

/**
 * Transforma dados da API em formato para exibicao no template Vivest
 */
export function extractVIVESTCardData(
  oracleData: OracleReciprocidade,
  beneficiary: {
    full_name: string;
    company?: string;
    birth_date?: string;
    effective_date?: string;
    cns?: string;
  }
): VIVESTCardData {
  return {
    // === FRENTE ===

    // Header
    planName: oracleData.PLANO_ELOSAUDE || '-',

    // Body - Identificacao
    registrationNumber: oracleData.CD_MATRICULA_RECIPROCIDADE || '-',
    beneficiaryName: (oracleData.NOME_BENEFICIARIO || beneficiary.full_name || '-').toUpperCase(),

    // Body - Grid Principal
    birthDate: formatDate(oracleData.DT_NASCIMENTO || beneficiary.birth_date),
    effectiveDate: formatDate(beneficiary.effective_date),
    planRegistry: '0',
    accommodation: 'APARTAMENTO',
    coverage: 'ESTADUAL',
    contractor: beneficiary.company || 'ELOS',

    // Body - Footer
    segmentation: 'AMBULAT. + HOSP. C/ OBSTETRÍCIA',
    partialCoverage: 'NÃO HÁ',

    // === VERSO ===

    // Header
    gracePeriodTitle: VIVEST_STATIC_INFO.gracePeriodTitle,
    planAnsNumber: VIVEST_STATIC_INFO.planAnsNumber,

    // Body
    gracePeriodText: VIVEST_STATIC_INFO.gracePeriodText,

    // Footer - ANS Operadora
    operatorLabel: VIVEST_STATIC_INFO.operatorLabel,
    operatorAnsNumber: VIVEST_STATIC_INFO.operatorAnsNumber,

    // Footer - CNS
    regulatedPlanLabel: VIVEST_STATIC_INFO.regulatedPlanLabel,
    cnsNumber: beneficiary.cns || '-',

    // Footer - Contatos
    contacts: VIVEST_STATIC_INFO.contacts,
  };
}
