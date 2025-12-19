/**
 * UI Components Index
 *
 * Exporta todos os componentes de UI reutilizáveis
 * do sistema de design Elosaúde
 */

// Button
export { Button } from './Button';
export type { default as ButtonType } from './Button';

// Input
export { Input } from './Input';
export type { default as InputType } from './Input';

// Card
export { Card, CardHeader, CardContent, CardActions } from './Card';
export type { default as CardType } from './Card';

// Empty States
export {
  EmptyState,
  EmptyList,
  EmptySearch,
  ErrorState,
  OfflineState,
  EmptyNotifications,
  EmptyDocuments,
} from './EmptyState';
export type { default as EmptyStateType } from './EmptyState';

// Loading States
export {
  Skeleton,
  SkeletonCard,
  SkeletonList,
  LoadingSpinner,
  FullScreenLoading,
  LoadingOverlay,
  InlineLoading,
  RefreshLoading,
  ProgressBar,
} from './LoadingState';

// Status Badge
export { StatusBadge, DotBadge, CountBadge } from './StatusBadge';
export type { default as StatusBadgeType } from './StatusBadge';

// Section Header
export { SectionHeader, DividerHeader, CollapsibleHeader } from './SectionHeader';
export type { default as SectionHeaderType } from './SectionHeader';

// List Item
export { ListItem, ListDivider, ListSection } from './ListItem';
export type { default as ListItemType } from './ListItem';

// Toast (Feedback)
export { Toast, SuccessToast, ErrorToast, InfoToast, WarningToast } from './Toast';
export type { default as ToastType } from './Toast';
