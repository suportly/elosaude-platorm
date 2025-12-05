/**
 * Elosaúde Design System
 *
 * Sistema de design otimizado para usuários 35-65 anos
 * Foco em acessibilidade, legibilidade e usabilidade
 *
 * Princípios:
 * - Fontes grandes e legíveis (mínimo 16px para corpo)
 * - Alto contraste (WCAG AA 4.5:1)
 * - Touch targets generosos (mínimo 48x48dp)
 * - Espaçamento confortável
 * - Feedback visual claro
 */

import { Platform, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// CORES
// =============================================================================

export const Colors = {
  // Primárias - Azul saúde confiável
  primary: {
    main: '#2563EB',        // Azul principal - confiança e saúde
    light: '#3B82F6',       // Hover states
    dark: '#1D4ED8',        // Pressed states
    lighter: '#DBEAFE',     // Backgrounds sutis
    contrast: '#FFFFFF',    // Texto sobre primário
  },

  // Secundárias - Verde bem-estar
  secondary: {
    main: '#10B981',        // Verde - sucesso, saúde, bem-estar
    light: '#34D399',       // Hover states
    dark: '#059669',        // Pressed states
    lighter: '#D1FAE5',     // Backgrounds sutis
    contrast: '#FFFFFF',    // Texto sobre secundário
  },

  // Superfícies
  surface: {
    background: '#F8FAFC',  // Fundo geral (leve, não branco puro)
    card: '#FFFFFF',        // Cards e containers
    elevated: '#FFFFFF',    // Elementos elevados
    muted: '#F1F5F9',       // Áreas de destaque sutil
  },

  // Texto - Alto contraste para legibilidade
  text: {
    primary: '#1E293B',     // Texto principal (alto contraste)
    secondary: '#64748B',   // Texto secundário
    tertiary: '#94A3B8',    // Texto terciário/placeholder
    disabled: '#CBD5E1',    // Texto desabilitado
    inverse: '#FFFFFF',     // Texto sobre cores escuras
    link: '#2563EB',        // Links
  },

  // Feedback
  feedback: {
    success: '#10B981',     // Verde sucesso
    successLight: '#D1FAE5',
    warning: '#F59E0B',     // Amarelo alerta
    warningLight: '#FEF3C7',
    error: '#EF4444',       // Vermelho erro
    errorLight: '#FEE2E2',
    info: '#3B82F6',        // Azul informação
    infoLight: '#DBEAFE',
  },

  // Bordas e divisores
  border: {
    light: '#E2E8F0',       // Bordas sutis
    medium: '#CBD5E1',      // Bordas visíveis
    dark: '#94A3B8',        // Bordas de foco
    focus: '#2563EB',       // Borda de foco/ativo
  },

  // Status (guias, reembolsos, etc.)
  status: {
    approved: '#10B981',
    pending: '#F59E0B',
    rejected: '#EF4444',
    underReview: '#3B82F6',
    draft: '#94A3B8',
    cancelled: '#64748B',
  },

  // Gradientes
  gradient: {
    primary: ['#2563EB', '#1D4ED8'],
    secondary: ['#10B981', '#059669'],
    card: ['#FFFFFF', '#F8FAFC'],
  },

  // Cards específicos (carteirinhas)
  cards: {
    elosaude: {
      primary: '#2563EB',
      secondary: '#1D4ED8',
      accent: '#60A5FA',
    },
    unimed: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#34D399',
    },
    reciprocidade: {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      accent: '#A78BFA',
    },
  },

  // =========================================================================
  // ALIASES DE COMPATIBILIDADE (para código legado)
  // =========================================================================
  // Cores de status e feedback como strings diretas
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Cores de texto como strings diretas
  textSecondary: '#64748B',
  textLight: '#94A3B8',

  // Cores de superfície como strings diretas
  background: '#F8FAFC',
  divider: '#E2E8F0',
};

// =============================================================================
// TIPOGRAFIA
// =============================================================================

export const Typography = {
  // Família de fontes (usa fonte do sistema para familiaridade)
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },

  // Escala de tamanhos (otimizada para 35-65 anos)
  // Mínimo 16px para corpo, títulos maiores
  sizes: {
    h1: 28,         // Títulos de tela
    h2: 24,         // Subtítulos principais
    h3: 20,         // Seções
    h4: 18,         // Subseções
    body: 17,       // Texto corpo (maior que padrão 14-16)
    bodySmall: 15,  // Texto secundário
    caption: 13,    // Labels e captions (mínimo legível)
    button: 17,     // Texto de botões
    buttonSmall: 15,
    input: 17,      // Texto em inputs
    label: 14,      // Labels de campos
    badge: 12,      // Badges e tags
  },

  // Line heights generosos para legibilidade
  lineHeight: {
    tight: 1.2,     // Títulos
    normal: 1.5,    // Corpo
    relaxed: 1.75,  // Texto longo
  },

  // Pesos de fonte
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Estilos de texto pré-definidos (para uso direto)
export const TextStyles = {
  h1: {
    fontSize: Typography.sizes.h1,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes.h1 * Typography.lineHeight.tight,
    color: Colors.text.primary,
    letterSpacing: Typography.letterSpacing.tight,
  },
  h2: {
    fontSize: Typography.sizes.h2,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes.h2 * Typography.lineHeight.tight,
    color: Colors.text.primary,
  },
  h3: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.sizes.h3 * Typography.lineHeight.tight,
    color: Colors.text.primary,
  },
  h4: {
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.sizes.h4 * Typography.lineHeight.normal,
    color: Colors.text.primary,
  },
  body: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.body * Typography.lineHeight.normal,
    color: Colors.text.primary,
  },
  bodySecondary: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.body * Typography.lineHeight.normal,
    color: Colors.text.secondary,
  },
  bodySmall: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.bodySmall * Typography.lineHeight.normal,
    color: Colors.text.secondary,
  },
  caption: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.sizes.caption * Typography.lineHeight.normal,
    color: Colors.text.tertiary,
  },
  button: {
    fontSize: Typography.sizes.button,
    fontWeight: Typography.weights.semibold,
    letterSpacing: Typography.letterSpacing.wide,
  },
  label: {
    fontSize: Typography.sizes.label,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
    letterSpacing: Typography.letterSpacing.wide,
    textTransform: 'uppercase' as const,
  },
};

// Legado (para compatibilidade)
export const FontSizes = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
};

export const FontWeights = Typography.weights;

// =============================================================================
// ESPAÇAMENTO
// =============================================================================

export const Spacing = {
  // Escala base
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Padding padrão de telas
  screenPadding: 20,
  screenPaddingHorizontal: 20,
  screenPaddingVertical: 16,

  // Espaço entre cards/seções
  sectionGap: 24,

  // Espaço entre elementos em lista
  listItemGap: 12,

  // Padding interno de componentes
  cardPadding: 20,
  buttonPadding: 16,
  inputPadding: 16,

  // Margem entre elementos
  elementGap: 12,
};

// =============================================================================
// RAIOS DE BORDA
// =============================================================================

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,

  // Componentes específicos
  button: 12,
  card: 16,
  input: 12,
  chip: 20,
  avatar: 999,
  bottomSheet: 24,
};

// =============================================================================
// SOMBRAS
// =============================================================================

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },

  // Sombras específicas
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomNav: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
};

// =============================================================================
// DIMENSÕES DE COMPONENTES
// =============================================================================

export const ComponentSizes = {
  // Touch targets mínimos (48x48 WCAG)
  touchTarget: 48,
  touchTargetSmall: 44,

  // Botões
  button: {
    height: 56,
    heightSmall: 44,
    heightLarge: 64,
    minWidth: 120,
    iconSize: 24,
  },

  // Inputs
  input: {
    height: 56,
    heightMultiline: 120,
    iconSize: 24,
  },

  // Cards
  card: {
    minHeight: 80,
    imageHeight: 160,
  },

  // Header
  header: {
    height: 56,
    heightLarge: 64,
    iconSize: 24,
  },

  // Bottom Navigation
  bottomNav: {
    height: 64,
    iconSize: 24,
    labelSize: 12,
  },

  // Avatars
  avatar: {
    xs: 32,
    sm: 40,
    md: 48,
    lg: 64,
    xl: 80,
  },

  // Icons
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },

  // Badges
  badge: {
    size: 20,
    minWidth: 20,
  },

  // Chips
  chip: {
    height: 36,
    iconSize: 18,
  },

  // List items
  listItem: {
    height: 72,
    heightCompact: 56,
    iconSize: 24,
    avatarSize: 48,
  },

  // FAB
  fab: {
    size: 56,
    sizeSmall: 44,
    iconSize: 24,
  },

  // Progress indicators
  progress: {
    height: 4,
    heightLarge: 8,
  },
};

// =============================================================================
// ANIMAÇÕES
// =============================================================================

export const Animations = {
  // Durações
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
  },

  // Easing (curvas de animação)
  easing: {
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: { damping: 15, stiffness: 150 },
  },

  // Escalas para feedback de toque
  scale: {
    pressed: 0.97,
    hover: 1.02,
  },
};

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const Breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

// Helpers para responsividade
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isTablet = SCREEN_WIDTH >= Breakpoints.tablet;

// =============================================================================
// Z-INDEX
// =============================================================================

export const ZIndex = {
  base: 0,
  card: 1,
  dropdown: 10,
  sticky: 100,
  modal: 1000,
  toast: 2000,
  tooltip: 3000,
};

// =============================================================================
// ESTILOS DE COMPONENTES PRÉ-DEFINIDOS
// =============================================================================

export const CommonStyles = {
  // Container de tela
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.surface.background,
  },

  // Container com scroll
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },

  // Card padrão
  card: {
    backgroundColor: Colors.surface.card,
    borderRadius: BorderRadius.card,
    padding: Spacing.cardPadding,
    ...Shadows.card,
  },

  // Linha horizontal
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  // Centralizado
  centered: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  // Divisor
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.md,
  },

  // Input container
  inputContainer: {
    marginBottom: Spacing.md,
  },

  // Espaçamento entre seções
  section: {
    marginBottom: Spacing.sectionGap,
  },

  // Header de seção
  sectionHeader: {
    marginBottom: Spacing.md,
  },
};

// =============================================================================
// UTILITÁRIOS
// =============================================================================

// Função para criar espaçamento responsivo
export const responsiveSpacing = (base: number) => {
  if (isSmallDevice) return base * 0.85;
  if (isTablet) return base * 1.15;
  return base;
};

// Função para criar tamanho de fonte responsivo
export const responsiveFontSize = (base: number) => {
  if (isSmallDevice) return Math.max(base - 1, 12);
  if (isTablet) return base + 2;
  return base;
};

// Função para obter cor de status
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    approved: Colors.status.approved,
    pending: Colors.status.pending,
    rejected: Colors.status.rejected,
    under_review: Colors.status.underReview,
    draft: Colors.status.draft,
    cancelled: Colors.status.cancelled,
  };
  return statusMap[status.toLowerCase()] || Colors.text.secondary;
};

// Função para obter cor de status de fundo (mais clara)
export const getStatusBackgroundColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    approved: Colors.feedback.successLight,
    pending: Colors.feedback.warningLight,
    rejected: Colors.feedback.errorLight,
    under_review: Colors.feedback.infoLight,
    draft: Colors.surface.muted,
    cancelled: Colors.surface.muted,
  };
  return statusMap[status.toLowerCase()] || Colors.surface.muted;
};

// =============================================================================
// EXPORT DEFAULT
// =============================================================================

export default {
  Colors,
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
};
