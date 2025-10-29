/**
 * Elosaúde Theme Configuration
 * Main colors and styling constants
 */

export const Colors = {
  // Primary Brand Colors
  primary: '#20a490',      // Elosaúde Green (main brand color)
  primaryDark: '#188873',  // Darker shade for headers/emphasis
  primaryLight: '#5fc4b3', // Lighter shade for backgrounds

  // Secondary Colors
  secondary: '#1976D2',    // Blue (kept for compatibility)
  secondaryLight: '#E3F2FD',

  // Functional Colors
  success: '#4CAF50',      // Green for success states
  warning: '#FF9800',      // Orange for warnings
  error: '#F44336',        // Red for errors
  info: '#2196F3',         // Blue for info

  // Neutrals
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#E0E0E0',
  divider: '#EEEEEE',

  // Status Colors (for guides, reimbursements)
  approved: '#4CAF50',
  pending: '#FF9800',
  rejected: '#F44336',
  underReview: '#2196F3',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export default {
  Colors,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
};
