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
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentSizes,
} from '../../config/theme';
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
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon,
  color,
  backgroundColor,
  onPress,
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
        style={styles.moduleCard}
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
        <Text style={styles.moduleTitle} numberOfLines={2}>
          {title}
        </Text>
        {description && (
          <Text style={styles.moduleDescription} numberOfLines={1}>
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

const QuickAction: React.FC<QuickActionProps> = ({ title, icon, onPress }) => {
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
        style={styles.quickAction}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityLabel={title}
        accessibilityRole="button"
      >
        <View style={styles.quickActionIcon}>
          <MaterialCommunityIcons
            name={icon as any}
            size={24}
            color={Colors.primary.main}
          />
        </View>
        <Text style={styles.quickActionText} numberOfLines={2}>
          {title}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={Colors.text.tertiary}
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
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + Spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary.main}
          colors={[Colors.primary.main]}
        />
      }
    >
      {/* Welcome Header */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {firstName}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            accessibilityLabel="Ver perfil"
            accessibilityRole="button"
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
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
          style={styles.planCard}
          onPress={() => navigation.navigate('PlanDetails')}
          activeOpacity={0.9}
          accessibilityLabel={`Plano ${beneficiary?.health_plan || 'Básico'}, Status ${beneficiary?.status === 'ACTIVE' ? 'Ativo' : beneficiary?.status}`}
          accessibilityRole="button"
          accessibilityHint="Toque para ver detalhes do plano"
        >
          <View style={styles.planCardHeader}>
            <View style={styles.planIconContainer}>
              <MaterialCommunityIcons
                name="shield-check"
                size={28}
                color={Colors.secondary.main}
              />
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planName} numberOfLines={1}>
                {beneficiary?.health_plan || 'Plano Elosaúde'}
              </Text>
              <Text style={styles.planRegistration}>
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
          <View style={styles.planCardFooter}>
            <Text style={styles.planDetailsText}>Ver detalhes do plano</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={Colors.primary.main}
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
            color={Colors.primary.main}
            backgroundColor={Colors.primary.lighter}
            onPress={() => navigation.navigate('DigitalCard')}
          />
          <ModuleCard
            title="Rede Credenciada"
            description="Médicos e hospitais"
            icon="hospital-building"
            color={Colors.secondary.main}
            backgroundColor={Colors.secondary.lighter}
            onPress={() => navigation.navigate('Network')}
          />
          <ModuleCard
            title="Guias Médicas"
            description="Solicitar autorizações"
            icon="file-document-multiple"
            color={Colors.feedback.warning}
            backgroundColor={Colors.feedback.warningLight}
            onPress={() => navigation.navigate('Guides')}
          />
          <ModuleCard
            title="Minha Saúde"
            description="Histórico de saúde"
            icon="heart-pulse"
            color="#E91E63"
            backgroundColor="#FCE4EC"
            onPress={() => navigation.navigate('HealthRecords')}
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
          <QuickAction
            title="2ª Via de Boleto"
            icon="file-download-outline"
            onPress={() => navigation.navigate('Invoices')}
          />
          <QuickAction
            title="Informe de IR"
            icon="file-chart-outline"
            onPress={() => navigation.navigate('TaxStatements')}
          />
          <QuickAction
            title="Dependentes"
            icon="account-group"
            onPress={() => navigation.navigate('Dependents')}
          />
          <QuickAction
            title="Alterar Senha"
            icon="lock-reset"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>
      </View>

      {/* Help Card */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.helpCard}
          onPress={() => navigation.navigate('Contact')}
          activeOpacity={0.9}
          accessibilityLabel="Central de Ajuda"
          accessibilityHint="Toque para entrar em contato com nossa equipe"
          accessibilityRole="button"
        >
          <View style={styles.helpIconContainer}>
            <MaterialCommunityIcons
              name="headset"
              size={32}
              color={Colors.primary.main}
            />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Precisa de Ajuda?</Text>
            <Text style={styles.helpSubtitle}>
              Nossa equipe está pronta para atendê-lo
            </Text>
          </View>
          <View style={styles.helpButtonContainer}>
            <View style={styles.helpButton}>
              <Text style={styles.helpButtonText}>Falar com Atendimento</Text>
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
    backgroundColor: Colors.surface.background,
  },
  contentContainer: {
    flexGrow: 1,
  },

  // Welcome Section
  welcomeSection: {
    backgroundColor: Colors.primary.main,
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
    color: Colors.primary.contrast,
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
    color: Colors.primary.contrast,
  },

  // Section
  section: {
    paddingHorizontal: Spacing.screenPadding,
    marginTop: Spacing.lg,
  },

  // Plan Card
  planCard: {
    backgroundColor: Colors.surface.card,
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
    backgroundColor: Colors.secondary.lighter,
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
    color: Colors.text.primary,
  },
  planRegistration: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  planCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  planDetailsText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.primary.main,
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
    backgroundColor: Colors.surface.card,
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
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xxs,
  },
  moduleDescription: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.secondary,
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
    backgroundColor: Colors.surface.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: ComponentSizes.touchTarget,
    ...Shadows.xs,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary.lighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  quickActionText: {
    flex: 1,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
  },

  // Help Card
  helpCard: {
    backgroundColor: Colors.primary.lighter,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    borderWidth: 1,
    borderColor: Colors.primary.light,
  },
  helpIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface.card,
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
    color: Colors.text.primary,
    marginBottom: Spacing.xxs,
  },
  helpSubtitle: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  helpButtonContainer: {
    alignItems: 'center',
  },
  helpButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.button,
    ...Shadows.button,
  },
  helpButtonText: {
    fontSize: Typography.sizes.button,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.contrast,
  },
});
