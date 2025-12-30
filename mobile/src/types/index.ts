/**
 * Exportações de tipos
 */

export type {
  UnimedCardData,
  UnimedCardTemplateProps,
  UnimedHeaderProps,
  UnimedBodyProps,
  UnimedFooterProps,
} from './unimed';

export type {
  VIVESTCardData,
  VIVESTContactInfo,
  VIVESTCardTemplateProps,
  VIVESTHeaderProps,
  VIVESTBodyFrontProps,
  VIVESTBodyBackProps,
  VIVESTDecorativeLinesProps,
  VIVESTEligiblePlan,
} from './vivest';

export {
  VIVEST_ELIGIBLE_PLANS,
  VIVEST_COLORS,
  VIVEST_STATIC_INFO,
} from './vivest';

// Re-export existing types
export * from './oracle';
