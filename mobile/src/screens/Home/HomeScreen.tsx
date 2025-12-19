/**
 * HomeScreen - Tela Inicial
 *
 * Redesign UX/UI otimizado para usuários 35-65 anos:
 * - Hierarquia visual clara
 * - Touch targets de 56px mínimo
 * - Fontes grandes e legíveis (17px corpo)
 * - Cores com alto contraste
 * - Fluxo intuitivo com CTAs óbvios
 */

import React, { useCallback, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  Animated,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../store/hooks';
import {
  useColors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentSizes,
} from '../../config';
import { SectionHeader } from '../../components/ui';
import { StatusBadge } from '../../components/ui/StatusBadge';

// =============================================================================
// MODULE CARD COMPONENT
// =============================================================================

interface ModuleCardProps {
  title: string;
  description?: string;
  icon: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  cardBackgroundColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon,
  color,
  backgroundColor,
  onPress,
  cardBackgroundColor,
  textPrimaryColor,
  textSecondaryColor,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[styles.moduleCardContainer, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={[
          styles.moduleCard,
          cardBackgroundColor && { backgroundColor: cardBackgroundColor },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityLabel={title}
        accessibilityHint={description || `Acessar ${title}`}
        accessibilityRole="button"
      >
        <View style={[styles.moduleIconContainer, { backgroundColor }]}>
          <MaterialCommunityIcons name={icon as any} size={32} color={color} />
        </View>
        <Text
          style={[
            styles.moduleTitle,
            textPrimaryColor && { color: textPrimaryColor },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={[
              styles.moduleDescription,
              textSecondaryColor && { color: textSecondaryColor },
            ]}
            numberOfLines={1}
          >
            {description}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// =============================================================================
// QUICK ACTION COMPONENT
// =============================================================================

interface QuickActionProps {
  title: string;
  icon: string;
  onPress: () => void;
}

interface QuickActionInternalProps extends QuickActionProps {
  primaryColor: string;
  primaryLighter: string;
  textPrimary: string;
  textTertiary: string;
  surfaceCard: string;
}

const QuickActionInternal: React.FC<QuickActionInternalProps> = ({
  title,
  icon,
  onPress,
  primaryColor,
  primaryLighter,
  textPrimary,
  textTertiary,
  surfaceCard,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[styles.quickActionContainer, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={[styles.quickAction, { backgroundColor: surfaceCard }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityLabel={title}
        accessibilityHint={`Toque para acessar ${title}`}
        accessibilityRole="button"
      >
        <View style={[styles.quickActionIcon, { backgroundColor: primaryLighter }]}>
          <MaterialCommunityIcons
            name={icon as any}
            size={24}
            color={primaryColor}
          />
        </View>
        <Text style={[styles.quickActionText, { color: textPrimary }]} numberOfLines={2}>
          {title}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={textTertiary}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { beneficiary } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Get first name for personalized greeting
  const firstName = beneficiary?.full_name?.split(' ')[0] || 'Beneficiário';

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.surface.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + Spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary.main}
          colors={[colors.primary.main]}
        />
      }
    >
      {/* Welcome Header */}
      <View style={[styles.welcomeSection, { backgroundColor: colors.primary.main }]}>
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={[styles.userName, { color: colors.primary.contrast }]} numberOfLines={1}>
              {firstName}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            accessibilityLabel="Ver perfil"
            accessibilityHint="Toque para acessar seu perfil pessoal"
            accessibilityRole="button"
          >
            <View style={styles.avatarContainer}>
              <Text style={[styles.avatarText, { color: colors.primary.contrast }]}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeSubtext}>
          Gerencie seu plano de saúde com facilidade
        </Text>
      </View>

      {/* Plan Status Card */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.planCard, { backgroundColor: colors.surface.card }]}
          onPress={() => navigation.navigate('PlanDetails')}
          activeOpacity={0.9}
          accessibilityLabel={`Plano ${beneficiary?.health_plan || 'Básico'}, Status ${beneficiary?.status === 'ACTIVE' ? 'Ativo' : beneficiary?.status}`}
          accessibilityRole="button"
          accessibilityHint="Toque para ver detalhes do plano"
        >
          <View style={styles.planCardHeader}>
            <View style={[styles.planIconContainer, { backgroundColor: colors.secondary.lighter }]}>
              <MaterialCommunityIcons
                name="shield-check"
                size={28}
                color={colors.secondary.main}
              />
            </View>
            <View style={styles.planInfo}>
              <Text style={[styles.planName, { color: colors.text.primary }]} numberOfLines={1}>
                {beneficiary?.health_plan || 'Plano Elosaúde'}
              </Text>
              <Text style={[styles.planRegistration, { color: colors.text.secondary }]}>
                Matrícula: {beneficiary?.registration_number || '---'}
              </Text>
            </View>
            <StatusBadge
              status={beneficiary?.status === 'ACTIVE' ? 'approved' : 'pending'}
              label={beneficiary?.status === 'ACTIVE' ? 'Ativo' : beneficiary?.status || 'Ativo'}
              size="small"
              showIcon={false}
            />
          </View>
          <View style={[styles.planCardFooter, { borderTopColor: colors.border.light }]}>
            <Text style={[styles.planDetailsText, { color: colors.primary.main }]}>Ver detalhes do plano</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={colors.primary.main}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Modules */}
      <View style={styles.section}>
        <SectionHeader
          title="Acesso Rápido"
          subtitle="Seus principais serviços"
          icon="view-grid"
        />
        <View style={styles.modulesGrid}>
          <ModuleCard
            title="Carteirinha Digital"
            description="Sua carteirinha virtual"
            icon="card-account-details"
            color={colors.primary.main}
            backgroundColor={colors.primary.lighter}
            onPress={() => navigation.navigate('DigitalCard')}
            cardBackgroundColor={colors.surface.card}
            textPrimaryColor={colors.text.primary}
            textSecondaryColor={colors.text.secondary}
          />
          <ModuleCard
            title="Rede Credenciada"
            description="Médicos e hospitais"
            icon="hospital-building"
            color={colors.secondary.main}
            backgroundColor={colors.secondary.lighter}
            onPress={() => navigation.navigate('Network')}
            cardBackgroundColor={colors.surface.card}
            textPrimaryColor={colors.text.primary}
            textSecondaryColor={colors.text.secondary}
          />
          <ModuleCard
            title="Guias Médicas"
            description="Solicitar autorizações"
            icon="file-document-multiple"
            color={colors.feedback.warning}
            backgroundColor={colors.feedback.warningLight}
            onPress={() => navigation.navigate('Guides')}
            cardBackgroundColor={colors.surface.card}
            textPrimaryColor={colors.text.primary}
            textSecondaryColor={colors.text.secondary}
          />
          <ModuleCard
            title="Minha Saúde"
            description="Histórico de saúde"
            icon="heart-pulse"
            color="#E91E63"
            backgroundColor="#FCE4EC"
            onPress={() => navigation.navigate('HealthRecords')}
            cardBackgroundColor={colors.surface.card}
            textPrimaryColor={colors.text.primary}
            textSecondaryColor={colors.text.secondary}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <SectionHeader
          title="Serviços"
          subtitle="Outras opções disponíveis"
          icon="cog"
        />
        <View style={styles.quickActionsGrid}>
          <QuickActionInternal
            title="2ª Via de Boleto"
            icon="file-download-outline"
            onPress={() => navigation.navigate('Invoices')}
            primaryColor={colors.primary.main}
            primaryLighter={colors.primary.lighter}
            textPrimary={colors.text.primary}
            textTertiary={colors.text.tertiary}
            surfaceCard={colors.surface.card}
          />
          <QuickActionInternal
            title="Informe de IR"
            icon="file-chart-outline"
            onPress={() => navigation.navigate('TaxStatements')}
            primaryColor={colors.primary.main}
            primaryLighter={colors.primary.lighter}
            textPrimary={colors.text.primary}
            textTertiary={colors.text.tertiary}
            surfaceCard={colors.surface.card}
          />
          <QuickActionInternal
            title="Dependentes"
            icon="account-group"
            onPress={() => navigation.navigate('Dependents')}
            primaryColor={colors.primary.main}
            primaryLighter={colors.primary.lighter}
            textPrimary={colors.text.primary}
            textTertiary={colors.text.tertiary}
            surfaceCard={colors.surface.card}
          />
          <QuickActionInternal
            title="Alterar Senha"
            icon="lock-reset"
            onPress={() => navigation.navigate('ChangePassword')}
            primaryColor={colors.primary.main}
            primaryLighter={colors.primary.lighter}
            textPrimary={colors.text.primary}
            textTertiary={colors.text.tertiary}
            surfaceCard={colors.surface.card}
          />
        </View>
      </View>

      {/* Help Card */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.helpCard,
            {
              backgroundColor: colors.primary.lighter,
              borderColor: colors.primary.light,
            },
          ]}
          onPress={() => navigation.navigate('Contact')}
          activeOpacity={0.9}
          accessibilityLabel="Central de Ajuda"
          accessibilityHint="Toque para entrar em contato com nossa equipe"
          accessibilityRole="button"
        >
          <View style={[styles.helpIconContainer, { backgroundColor: colors.surface.card }]}>
            <MaterialCommunityIcons
              name="headset"
              size={32}
              color={colors.primary.main}
            />
          </View>
          <View style={styles.helpContent}>
            <Text style={[styles.helpTitle, { color: colors.text.primary }]}>Precisa de Ajuda?</Text>
            <Text style={[styles.helpSubtitle, { color: colors.text.secondary }]}>
              Nossa equipe está pronta para atendê-lo
            </Text>
          </View>
          <View style={styles.helpButtonContainer}>
            <View style={[styles.helpButton, { backgroundColor: colors.primary.main }]}>
              <Text style={[styles.helpButtonText, { color: colors.primary.contrast }]}>Falar com Atendimento</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: Typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: Typography.weights.medium,
  },
  userName: {
    fontSize: Typography.sizes.h2,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  welcomeSubtext: {
    fontSize: Typography.sizes.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: Spacing.xs,
  },
  profileButton: {
    marginLeft: Spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.bold,
  },

  // Section
  section: {
    paddingHorizontal: Spacing.screenPadding,
    marginTop: Spacing.lg,
  },

  // Plan Card
  planCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    ...Shadows.md,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
  planRegistration: {
    fontSize: Typography.sizes.bodySmall,
    marginTop: 2,
  },
  planCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  planDetailsText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
  },

  // Modules Grid
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  moduleCardContainer: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  moduleCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 140,
    ...Shadows.sm,
  },
  moduleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  moduleTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    marginBottom: Spacing.xxs,
  },
  moduleDescription: {
    fontSize: Typography.sizes.caption,
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsGrid: {
    marginTop: Spacing.sm,
  },
  quickActionContainer: {
    marginBottom: Spacing.sm,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: ComponentSizes.touchTarget,
    ...Shadows.xs,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  quickActionText: {
    flex: 1,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
  },

  // Help Card
  helpCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    borderWidth: 1,
  },
  helpIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  helpContent: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  helpTitle: {
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xxs,
  },
  helpSubtitle: {
    fontSize: Typography.sizes.bodySmall,
    textAlign: 'center',
  },
  helpButtonContainer: {
    alignItems: 'center',
  },
  helpButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.button,
    ...Shadows.button,
  },
  helpButtonText: {
    fontSize: Typography.sizes.button,
    fontWeight: Typography.weights.semibold,
  },
});
