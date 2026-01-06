export type OperatorType =
  | 'FACHESF'
  | 'VIVEST'
  | 'UNIMED'
  | 'ELOSAUDE'
  | 'ELETROS';

export interface MedicalGuideConfig {
  operator: OperatorType;
  name: string;
  url: string;
  icon: string;
  color: string;
}
