/**
 * DigitalCardScreen - Carteirinhas Digitais
 *
 * Redesign UX/UI otimizado para usuários 35-65 anos:
 * - Carrossel de carteirinhas com navegação clara
 * - QR Code grande e acessível
 * - Informações legíveis com fontes grandes
 * - Feedback visual para navegação
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentSizes,
} from '../../config/theme';
import { Button, ErrorState, LoadingSpinner } from '../../components/ui';
import { useGetOracleCardsQuery } from '../../store/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = Spacing.md;
const CARD_WIDTH = SCREEN_WIDTH - (Spacing.screenPadding * 2);
const CARD_ITEM_WIDTH = CARD_WIDTH + CARD_MARGIN;

// =============================================================================
// CARD TYPE CONFIG
// =============================================================================

const CARD_TYPE_CONFIG = {
  CARTEIRINHA: {
    title: 'Elosaúde',
    icon: 'shield-check',
    primaryColor: Colors.cards.elosaude.primary,
    secondaryColor: Colors.cards.elosaude.secondary,
    accentColor: Colors.cards.elosaude.accent,
  },
  UNIMED: {
    title: 'Unimed',
    icon: 'hospital-box',
    primaryColor: Colors.cards.unimed.primary,
    secondaryColor: Colors.cards.unimed.secondary,
    accentColor: Colors.cards.unimed.accent,
  },
  RECIPROCIDADE: {
    title: 'Reciprocidade',
    icon: 'handshake',
    primaryColor: Colors.cards.reciprocidade.primary,
    secondaryColor: Colors.cards.reciprocidade.secondary,
    accentColor: Colors.cards.reciprocidade.accent,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatCPF = (cpf: string | number | null | undefined): string => {
  if (!cpf) return 'N/A';
  const numbers = String(cpf).padStart(11, '0');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const extractCardInfo = (item: any, cardType: string) => {
  if (cardType === 'CARTEIRINHA') {
    return {
      name: item.NOME_DO_BENEFICIARIO || item.NM_SOCIAL || 'N/A',
      registration: item.MATRICULA,
      plan: item.PRIMARIO || item.SEGMENTACAO,
      cpf: formatCPF(item.NR_CPF),
      cns: item.NR_CNS,
      birthDate: item.NASCTO,
      company: item.EMPRESA,
      validity: item.VALIDADE,
      segmentation: item.SEGMENTACAO,
    };
  } else if (cardType === 'UNIMED') {
    return {
      name: item.NOME_DO_BENEFICIARIO || item.nm_social || 'N/A',
      registration: item.MATRICULA_UNIMED,
      plan: item.PLANO || item.SEGMENTACAO,
      cpf: formatCPF(item.CPF),
      cns: item.NR_CNS,
      birthDate: item.nascto,
      coverage: item.ABRANGENCIA,
      accommodation: item.ACOMODACAO,
      network: item.Rede_Atendimento,
      validity: item.Validade,
      segmentation: item.SEGMENTACAO,
    };
  } else {
    return {
      name: item.NOME_BENEFICIARIO || item.NM_SOCIAL || 'N/A',
      registration: item.CD_MATRICULA_RECIPROCIDADE,
      plan: item.PLANO_ELOSAUDE,
      cpf: formatCPF(item.NR_CPF),
      cns: item.NR_CNS,
      birthDate: item.NASCTO,
      provider: item.PRESTADOR_RECIPROCIDADE,
      adhesionDate: item.DT_ADESAO,
      validity: item.DT_VALIDADE_CARTEIRA,
    };
  }
};

// =============================================================================
// INFO ROW COMPONENT
// =============================================================================

interface InfoRowProps {
  label: string;
  value: string | null | undefined;
  icon?: string;
  color?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon, color = Colors.text.primary }) => {
  if (!value || value === 'N/A') return null;

  return (
    <View style={infoRowStyles.container}>
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={Colors.text.tertiary}
          style={infoRowStyles.icon}
        />
      )}
      <View style={infoRowStyles.content}>
        <Text style={infoRowStyles.label}>{label}</Text>
        <Text style={[infoRowStyles.value, { color }]}>{value}</Text>
      </View>
    </View>
  );
};

const infoRowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  icon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.tertiary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
  },
});

// =============================================================================
// DIGITAL CARD COMPONENT
// =============================================================================

interface DigitalCardProps {
  item: any;
  showQR: boolean;
  width: number;
}

const DigitalCard: React.FC<DigitalCardProps> = ({ item, showQR, width }) => {
  const cardType = item._type as keyof typeof CARD_TYPE_CONFIG;
  const config = CARD_TYPE_CONFIG[cardType] || CARD_TYPE_CONFIG.CARTEIRINHA;
  const cardInfo = extractCardInfo(item, cardType);

  const qrData = JSON.stringify({
    type: cardType,
    name: cardInfo.name,
    registration: cardInfo.registration,
    cpf: cardInfo.cpf,
    cns: cardInfo.cns,
  });

  return (
    <View style={[cardStyles.container, { width }]}>
      {/* Card Header */}
      <View style={[cardStyles.header, { backgroundColor: config.primaryColor }]}>
        <View style={cardStyles.headerContent}>
          <MaterialCommunityIcons
            name={config.icon as any}
            size={32}
            color={Colors.text.inverse}
          />
          <View style={cardStyles.headerText}>
            <Text style={cardStyles.headerTitle}>{config.title}</Text>
            <Text style={cardStyles.headerSubtitle}>Carteirinha Digital</Text>
          </View>
        </View>
        {cardInfo.validity && (
          <View style={cardStyles.validityBadge}>
            <Text style={cardStyles.validityText}>
              Válido até {cardInfo.validity}
            </Text>
          </View>
        )}
      </View>

      {/* Card Body */}
      <View style={cardStyles.body}>
        {/* Beneficiary Name */}
        <View style={cardStyles.nameSection}>
          <Text style={cardStyles.nameLabel}>BENEFICIÁRIO</Text>
          <Text style={cardStyles.nameValue} numberOfLines={2}>
            {cardInfo.name}
          </Text>
        </View>

        {/* Info Grid */}
        <View style={cardStyles.infoGrid}>
          <View style={cardStyles.infoColumn}>
            <InfoRow
              label="Matrícula"
              value={cardInfo.registration}
              icon="card-account-details"
              color={config.primaryColor}
            />
            <InfoRow
              label="CPF"
              value={cardInfo.cpf}
              icon="account"
            />
            {cardInfo.cns && (
              <InfoRow
                label="CNS"
                value={cardInfo.cns}
                icon="numeric"
              />
            )}
          </View>
          <View style={cardStyles.infoColumn}>
            <InfoRow
              label="Plano"
              value={cardInfo.plan}
              icon="shield"
            />
            <InfoRow
              label="Nascimento"
              value={cardInfo.birthDate}
              icon="calendar"
            />
            {cardInfo.segmentation && (
              <InfoRow
                label="Segmentação"
                value={cardInfo.segmentation}
                icon="tag"
              />
            )}
          </View>
        </View>

        {/* Type-specific info */}
        {cardType === 'UNIMED' && cardInfo.coverage && (
          <View style={cardStyles.extraInfo}>
            <InfoRow label="Abrangência" value={cardInfo.coverage} icon="earth" />
            {cardInfo.accommodation && (
              <InfoRow label="Acomodação" value={cardInfo.accommodation} icon="bed" />
            )}
          </View>
        )}

        {cardType === 'RECIPROCIDADE' && cardInfo.provider && (
          <View style={cardStyles.extraInfo}>
            <InfoRow label="Prestador" value={cardInfo.provider} icon="domain" />
          </View>
        )}

        {/* QR Code */}
        {showQR && (
          <View style={cardStyles.qrSection}>
            <View style={cardStyles.qrDivider} />
            <View style={cardStyles.qrContainer}>
              <QRCode
                value={qrData}
                size={160}
                color={Colors.text.primary}
                backgroundColor={Colors.surface.card}
              />
            </View>
            <Text style={cardStyles.qrHint}>
              Apresente este QR Code nos prestadores credenciados
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    marginHorizontal: CARD_MARGIN / 2,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface.card,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  header: {
    padding: Spacing.cardPadding,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.bold,
    color: Colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  validityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  validityText: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.inverse,
    fontWeight: Typography.weights.medium,
  },
  body: {
    padding: Spacing.cardPadding,
  },
  nameSection: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  nameLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  nameValue: {
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  infoGrid: {
    flexDirection: 'row',
  },
  infoColumn: {
    flex: 1,
  },
  extraInfo: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  qrSection: {
    marginTop: Spacing.md,
  },
  qrDivider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginBottom: Spacing.lg,
  },
  qrContainer: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface.muted,
    borderRadius: BorderRadius.md,
  },
  qrHint: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
});

// =============================================================================
// MAIN SCREEN COMPONENT
// =============================================================================

const DigitalCardScreen = () => {
  const insets = useSafeAreaInsets();
  const { data: oracleCards, isLoading, error, refetch } = useGetOracleCardsQuery();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showQR, setShowQR] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Combine all Oracle cards
  const allCards = oracleCards
    ? [
        ...oracleCards.carteirinha.map((card: any) => ({ ...card, _type: 'CARTEIRINHA' })),
        ...oracleCards.unimed.map((card: any) => ({ ...card, _type: 'UNIMED' })),
        ...oracleCards.reciprocidade.map((card: any) => ({ ...card, _type: 'RECIPROCIDADE' })),
      ]
    : [];

  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_ITEM_WIDTH);
    if (index !== currentCardIndex && index >= 0 && index < allCards.length) {
      setCurrentCardIndex(index);
    }
  }, [currentCardIndex, allCards.length]);

  const scrollToCard = useCallback((index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * CARD_ITEM_WIDTH,
      animated: true,
    });
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner message="Carregando suas carteirinhas..." />
      </View>
    );
  }

  // Error state
  if (error || !oracleCards || allCards.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ErrorState
          message={
            allCards.length === 0
              ? 'Nenhuma carteirinha encontrada para seu cadastro'
              : 'Não foi possível carregar suas carteirinhas'
          }
          onRetry={refetch}
        />
      </View>
    );
  }

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Suas Carteirinhas</Text>
        <Text style={styles.subtitle}>
          {currentCardIndex + 1} de {allCards.length} • Deslize para ver mais
        </Text>
      </View>

      {/* Cards Carousel */}
      <FlatList
        ref={flatListRef}
        data={allCards}
        renderItem={({ item }) => (
          <DigitalCard item={item} showQR={showQR} width={CARD_WIDTH} />
        )}
        keyExtractor={(item, index) => `${item._type}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={CARD_ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
      />

      {/* Page Indicators */}
      {allCards.length > 1 && (
        <View style={styles.indicatorContainer}>
          {allCards.map((card, index) => {
            const config = CARD_TYPE_CONFIG[card._type as keyof typeof CARD_TYPE_CONFIG];
            const isActive = index === currentCardIndex;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToCard(index)}
                style={[
                  styles.indicator,
                  isActive && [
                    styles.activeIndicator,
                    { backgroundColor: config?.primaryColor || Colors.primary.main },
                  ],
                ]}
                accessibilityLabel={`Carteirinha ${index + 1} de ${allCards.length}`}
                accessibilityRole="button"
              />
            );
          })}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title={showQR ? 'Ocultar QR Code' : 'Mostrar QR Code'}
          onPress={() => setShowQR(!showQR)}
          variant="outline"
          icon={showQR ? 'qrcode-remove' : 'qrcode'}
          size="medium"
        />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <MaterialCommunityIcons
            name="information"
            size={24}
            color={Colors.primary.main}
          />
          <Text style={styles.infoTitle}>Informações Importantes</Text>
        </View>
        <View style={styles.infoList}>
          <InfoItem text="Sempre apresente a carteirinha adequada nos prestadores" />
          <InfoItem text="Mantenha seus dados cadastrais atualizados" />
          <InfoItem text="Em caso de perda ou roubo, entre em contato imediatamente" />
          <InfoItem text="Estas carteirinhas são pessoais e intransferíveis" />
        </View>
      </View>
    </ScrollView>
  );
};

// Info Item component
const InfoItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.infoItem}>
    <MaterialCommunityIcons
      name="check-circle"
      size={20}
      color={Colors.secondary.main}
    />
    <Text style={styles.infoItemText}>{text}</Text>
  </View>
);

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface.background,
  },

  // Header
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.h2,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    color: Colors.text.secondary,
  },

  // Carousel
  carouselContent: {
    paddingHorizontal: Spacing.screenPadding - (CARD_MARGIN / 2),
  },

  // Indicators
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border.medium,
  },
  activeIndicator: {
    width: 28,
  },

  // Actions
  actionsContainer: {
    paddingHorizontal: Spacing.screenPadding,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },

  // Info Card
  infoCard: {
    margin: Spacing.screenPadding,
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary.lighter,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    borderWidth: 1,
    borderColor: Colors.primary.light,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.dark,
    marginLeft: Spacing.sm,
  },
  infoList: {
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoItemText: {
    flex: 1,
    fontSize: Typography.sizes.bodySmall,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
    lineHeight: Typography.sizes.bodySmall * Typography.lineHeight.normal,
  },
});

export default DigitalCardScreen;
