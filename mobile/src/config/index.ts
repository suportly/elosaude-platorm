/**
 * Config exports
 *
 * Central export point for all config modules
 */

// Theme exports
export {
  Colors,
  DarkColors,
  Typography,
  TextStyles,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentSizes,
  Animations,
  Breakpoints,
  ZIndex,
  CommonStyles,
  responsiveSpacing,
  responsiveFontSize,
  getStatusColor,
  getStatusBackgroundColor,
  isSmallDevice,
  isTablet,
} from './theme';

// Theme Context exports
export {
  ThemeProvider,
  useTheme,
  useColors,
  useIsDark,
} from './ThemeContext';
export type { ThemeMode } from './ThemeContext';

// API config
export { API_URL, API_TIMEOUT } from './api';
