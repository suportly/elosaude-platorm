import type { OperatorType, MedicalGuideConfig } from '../types/medicalGuide';

export const MEDICAL_GUIDE_CONFIGS: Record<OperatorType, MedicalGuideConfig> = {
  FACHESF: {
    operator: 'FACHESF',
    name: 'Fachesf',
    url: 'https://s008.fachesf.com.br/ConsultaCredenciadosRedeAtendimento/',
    icon: 'hospital-building',
    color: '#00B894',
  },
  VIVEST: {
    operator: 'VIVEST',
    name: 'Vivest',
    url: 'https://medhub.facilinformatica.com.br/provider-search',
    icon: 'hospital-building',
    color: '#0066CC',
  },
  UNIMED: {
    operator: 'UNIMED',
    name: 'Unimed',
    url: 'https://www.unimed.coop.br/site/web/guest/guia-medico#/',
    icon: 'hospital-building',
    color: '#00A651',
  },
  ELOSAUDE: {
    operator: 'ELOSAUDE',
    name: 'Elosaude',
    url: 'https://webprod.elosaude.com.br/#/guia-medico',
    icon: 'hospital-building',
    color: '#1A73E8',
  },
  ELETROS: {
    operator: 'ELETROS',
    name: 'Eletrossaude',
    url: 'https://eletrossaude.com.br/rede-credenciada/',
    icon: 'hospital-building',
    color: '#FF6B00',
  },
};

export function getMedicalGuideConfig(operator: OperatorType): MedicalGuideConfig | null {
  return MEDICAL_GUIDE_CONFIGS[operator] || null;
}
