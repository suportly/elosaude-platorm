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
  Colors as StaticColors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentSizes,
} from '../../config/theme';
import { useColors } from '../../config';
import { Button, ErrorState, LoadingSpinner } from '../../components/ui';
import { useGetOracleCardsQuery } from '../../store/services/api';
import { useAppSelector } from '../../store';
import { UnimedCardTemplate } from './components/UnimedCardTemplate';
import { ElosaúdeCardTemplate } from './components/ElosaúdeCardTemplate';
import { VIVESTCardTemplate } from './components/VIVESTCardTemplate';
import { ELETROSCardTemplate } from './components/ELETROSCardTemplate';
import { isVIVESTEligible, isELETROSEligible } from '../../utils/cardUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = Spacing.md;
const CARD_WIDTH = SCREEN_WIDTH - (Spacing.screenPadding * 2);
const CARD_ITEM_WIDTH = CARD_WIDTH + CARD_MARGIN;

// =============================================================================
// CARD TYPE CONFIG
// =============================================================================

const getCardTypeConfig = (colors: typeof StaticColors) => ({
  CARTEIRINHA: {
    title: 'Elosaúde',
    icon: 'shield-check',
    primaryColor: colors.cards.elosaude.primary,
    secondaryColor: colors.cards.elosaude.secondary,
    accentColor: colors.cards.elosaude.accent,
  },
  UNIMED: {
    title: 'Unimed',
    icon: 'hospital-box',
    primaryColor: colors.cards.unimed.primary,
    secondaryColor: colors.cards.unimed.secondary,
    accentColor: colors.cards.unimed.accent,
  },
  RECIPROCIDADE: {
    title: 'Reciprocidade',
    icon: 'handshake',
    primaryColor: colors.cards.reciprocidade.primary,
    secondaryColor: colors.cards.reciprocidade.secondary,
    accentColor: colors.cards.reciprocidade.accent,
  },
});

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
  colors: typeof StaticColors;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon, color, colors }) => {
  if (!value || value === 'N/A') return null;

  const iconAccessibilityLabels: Record<string, string> = {
    'card-account-details': 'Ícone de matrícula',
    'account': 'Ícone de CPF',
    'numeric': 'Ícone de CNS',
    'shield': 'Ícone de plano',
    'calendar': 'Ícone de data',
    'tag': 'Ícone de segmentação',
    'earth': 'Ícone de abrangência',
    'bed': 'Ícone de acomodação',
    'domain': 'Ícone de prestador',
  };

  return (
    <View
      style={infoRowStyles.container}
      accessible
      accessibilityLabel={`${label}: ${value}`}
      accessibilityRole="text"
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={colors.text.tertiary}
          style={infoRowStyles.icon}
          accessible
          accessibilityLabel={iconAccessibilityLabels[icon] || `Ícone de ${label}`}
        />
      )}
      <View style={infoRowStyles.content}>
        <Text style={[infoRowStyles.label, { color: colors.text.tertiary }]}>{label}</Text>
        <Text style={[infoRowStyles.value, { color: color || colors.text.primary }]}>{value}</Text>
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
  colors: typeof StaticColors;
  beneficiary?: any;
}

const DigitalCard: React.FC<DigitalCardProps> = ({ item, showQR, width, colors, beneficiary }) => {
  const CARD_TYPE_CONFIG = getCardTypeConfig(colors);
  const cardType = item._type as keyof typeof CARD_TYPE_CONFIG;
  const config = CARD_TYPE_CONFIG[cardType] || CARD_TYPE_CONFIG.CARTEIRINHA;
  const cardInfo = extractCardInfo(item, cardType);

  // Use template EloSaude especializado para cartões CARTEIRINHA
  if (cardType === 'CARTEIRINHA' && beneficiary) {
    return (
      <View style={{ marginHorizontal: CARD_MARGIN / 2 }}>
        <ElosaúdeCardTemplate
          cardData={item}
          beneficiary={{
            full_name: beneficiary.full_name || cardInfo.name,
            company: beneficiary.company,
            birth_date: beneficiary.birth_date || cardInfo.birthDate,
            effective_date: beneficiary.effective_date,
          }}
        />
      </View>
    );
  }

  // Use template Unimed especializado para cartões UNIMED
  if (cardType === 'UNIMED' && beneficiary) {
    return (
      <View style={{ marginHorizontal: CARD_MARGIN / 2 }}>
        <UnimedCardTemplate
          cardData={item}
          beneficiary={{
            full_name: beneficiary.full_name || cardInfo.name,
            company: beneficiary.company,
            birth_date: beneficiary.birth_date || cardInfo.birthDate,
            effective_date: beneficiary.effective_date,
          }}
        />
      </View>
    );
  }

  // Use template Eletros-Saude especializado para cartões RECIPROCIDADE elegíveis
  if (cardType === 'RECIPROCIDADE' && beneficiary && isELETROSEligible(item)) {
    return (
      <View style={{ marginHorizontal: CARD_MARGIN / 2 }}>
        <ELETROSCardTemplate
          cardData={item}
          beneficiary={{
            full_name: beneficiary.full_name || cardInfo.name,
            birth_date: beneficiary.birth_date || cardInfo.birthDate,
          }}
        />
      </View>
    );
  }

  // Use template Vivest especializado para cartões RECIPROCIDADE elegíveis
  if (cardType === 'RECIPROCIDADE' && beneficiary && isVIVESTEligible(item)) {
    return (
      <View style={{ marginHorizontal: CARD_MARGIN / 2 }}>
        <VIVESTCardTemplate
          cardData={item}
          beneficiary={{
            full_name: beneficiary.full_name || cardInfo.name,
            company: beneficiary.company,
            birth_date: beneficiary.birth_date || cardInfo.birthDate,
            effective_date: beneficiary.effective_date,
            cns: beneficiary.cns,
          }}
        />
      </View>
    );
  }

  const qrData = JSON.stringify({
    type: cardType,
    name: cardInfo.name,
    registration: cardInfo.registration,
    cpf: cardInfo.cpf,
    cns: cardInfo.cns,
  });

  return (
    <View style={[cardStyles.container, { width, backgroundColor: colors.surface.card }]}>
      {/* Card Header */}
      <View
        style={[cardStyles.header, { backgroundColor: config.primaryColor }]}
        accessible
        accessibilityLabel={`Carteirinha ${config.title} de ${cardInfo.name}`}
        accessibilityRole="header"
      >
        <View style={cardStyles.headerContent}>
          <MaterialCommunityIcons
            name={config.icon as any}
            size={32}
            color={colors.text.inverse}
            accessible
            accessibilityLabel={`Logotipo ${config.title}`}
          />
          <View style={cardStyles.headerText}>
            <Text style={[cardStyles.headerTitle, { color: colors.text.inverse }]}>{config.title}</Text>
            <Text style={cardStyles.headerSubtitle}>Cartão de Saúde Digital</Text>
          </View>
        </View>
        {cardInfo.validity && (
          <View
            style={cardStyles.validityBadge}
            accessible
            accessibilityLabel={`Validade até ${cardInfo.validity}`}
            accessibilityRole="text"
          >
            <Text style={[cardStyles.validityText, { color: colors.text.inverse }]}>
              Válido até {cardInfo.validity}
            </Text>
          </View>
        )}
      </View>

      {/* Card Body */}
      <View style={cardStyles.body}>
        {/* Beneficiary Name */}
        <View style={[cardStyles.nameSection, { borderBottomColor: colors.border.light }]}>
          <Text style={[cardStyles.nameLabel, { color: colors.text.tertiary }]}>BENEFICIÁRIO</Text>
          <Text style={[cardStyles.nameValue, { color: colors.text.primary }]} numberOfLines={2}>
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
              colors={colors}
            />
            <InfoRow
              label="CPF"
              value={cardInfo.cpf}
              icon="account"
              colors={colors}
            />
            {cardInfo.cns && (
              <InfoRow
                label="CNS"
                value={cardInfo.cns}
                icon="numeric"
                colors={colors}
              />
            )}
          </View>
          <View style={cardStyles.infoColumn}>
            <InfoRow
              label="Plano"
              value={cardInfo.plan}
              icon="shield"
              colors={colors}
            />
            <InfoRow
              label="Nascimento"
              value={cardInfo.birthDate}
              icon="calendar"
              colors={colors}
            />
            {cardInfo.segmentation && (
              <InfoRow
                label="Segmentação"
                value={cardInfo.segmentation}
                icon="tag"
                colors={colors}
              />
            )}
          </View>
        </View>

        {/* Type-specific info */}
        {cardType === 'UNIMED' && cardInfo.coverage && (
          <View style={[cardStyles.extraInfo, { borderTopColor: colors.border.light }]}>
            <InfoRow label="Abrangência" value={cardInfo.coverage} icon="earth" colors={colors} />
            {cardInfo.accommodation && (
              <InfoRow label="Acomodação" value={cardInfo.accommodation} icon="bed" colors={colors} />
            )}
          </View>
        )}

        {cardType === 'RECIPROCIDADE' && cardInfo.provider && (
          <View style={[cardStyles.extraInfo, { borderTopColor: colors.border.light }]}>
            <InfoRow label="Prestador" value={cardInfo.provider} icon="domain" colors={colors} />
          </View>
        )}

        {/* QR Code */}
        {showQR && (
          <View
            style={cardStyles.qrSection}
            accessible
            accessibilityLabel="Código QR da carteirinha"
            accessibilityRole="image"
            accessibilityHint="Use este código para apresentar sua carteirinha digital nos prestadores credenciados"
          >
            <View style={[cardStyles.qrDivider, { backgroundColor: colors.border.light }]} />
            <View style={[cardStyles.qrContainer, { backgroundColor: colors.surface.muted }]}>
              <QRCode
                value={qrData}
                size={160}
                color={colors.text.primary}
                backgroundColor={colors.surface.card}
              />
            </View>
            <Text style={[cardStyles.qrHint, { color: colors.text.tertiary }]}>
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
    fontWeight: Typography.weights.medium,
  },
  body: {
    padding: Spacing.cardPadding,
  },
  nameSection: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  nameLabel: {
    fontSize: Typography.sizes.caption,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  nameValue: {
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.weights.semibold,
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
  },
  qrSection: {
    marginTop: Spacing.md,
  },
  qrDivider: {
    height: 1,
    marginBottom: Spacing.lg,
  },
  qrContainer: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  qrHint: {
    fontSize: Typography.sizes.caption,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
});

// =============================================================================
// MAIN SCREEN COMPONENT
// =============================================================================

const DigitalCardScreen = () => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: oracleCards, isLoading, error, refetch } = useGetOracleCardsQuery();
  const { beneficiary } = useAppSelector((state) => state.auth);

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
      <View style={[styles.centerContainer, { backgroundColor: colors.surface.background }]}>
        <LoadingSpinner message="Carregando suas carteirinhas..." />
      </View>
    );
  }

  // Error state
  if (error || !oracleCards || allCards.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.surface.background }]}>
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
      {/* Header */}
      <View
        style={styles.header}
        accessible
        accessibilityLabel="Seção de cartões de saúde"
        accessibilityRole="header"
      >
        <Text style={[styles.title, { color: colors.text.primary }]}>Seus Cartões de Saúde</Text>
        <Text
          style={[styles.subtitle, { color: colors.text.secondary }]}
          accessible
          accessibilityLabel={`Exibindo cartão ${currentCardIndex + 1} de ${allCards.length}. Deslize para ver mais`}
          accessibilityRole="text"
        >
          {currentCardIndex + 1} de {allCards.length} • Deslize para ver mais
        </Text>
      </View>

      {/* Cards Carousel */}
      <FlatList
        ref={flatListRef}
        data={allCards}
        renderItem={({ item }) => (
          <DigitalCard item={item} showQR={showQR} width={CARD_WIDTH} colors={colors} beneficiary={beneficiary} />
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
            const CARD_TYPE_CONFIG = getCardTypeConfig(colors);
            const config = CARD_TYPE_CONFIG[card._type as keyof typeof CARD_TYPE_CONFIG];
            const isActive = index === currentCardIndex;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToCard(index)}
                style={[
                  styles.indicator,
                  { backgroundColor: colors.border.medium },
                  isActive && [
                    styles.activeIndicator,
                    { backgroundColor: config?.primaryColor || colors.primary.main },
                  ],
                ]}
                accessible
                accessibilityLabel={`Cartão ${index + 1} de ${allCards.length}`}
                accessibilityHint={isActive ? 'Cartão selecionado' : 'Toque para ver este cartão'}
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
          accessibilityLabel={showQR ? 'Botão ocultar código QR' : 'Botão mostrar código QR'}
          accessibilityHint={showQR ? 'Toque para ocultar o código QR da carteirinha' : 'Toque para exibir o código QR da carteirinha'}
          accessibilityRole="button"
        />
      </View>

      {/* Info Card */}
      <View
        style={[styles.infoCard, { backgroundColor: colors.primary.lighter, borderColor: colors.primary.light }]}
        accessible
        accessibilityLabel="Informações importantes sobre suas carteirinhas"
        accessibilityRole="list"
      >
        <View
          style={styles.infoHeader}
          accessible
          accessibilityLabel="Título: Informações Importantes"
          accessibilityRole="header"
        >
          <MaterialCommunityIcons
            name="information"
            size={24}
            color={colors.primary.main}
            accessible
            accessibilityLabel="Ícone de informações"
          />
          <Text style={[styles.infoTitle, { color: colors.primary.dark }]}>Informações Importantes</Text>
        </View>
        <View style={styles.infoList}>
          <InfoItem text="Sempre apresente a carteirinha adequada nos prestadores" colors={colors} />
          <InfoItem text="Mantenha seus dados cadastrais atualizados" colors={colors} />
          <InfoItem text="Em caso de perda ou roubo, entre em contato imediatamente" colors={colors} />
          <InfoItem text="Estas carteirinhas são pessoais e intransferíveis" colors={colors} />
        </View>
      </View>
    </ScrollView>
  );
};

// Info Item component
const InfoItem: React.FC<{ text: string; colors: typeof StaticColors }> = ({ text, colors }) => (
  <View
    style={styles.infoItem}
    accessible
    accessibilityLabel={text}
    accessibilityRole="text"
  >
    <MaterialCommunityIcons
      name="check-circle"
      size={20}
      color={colors.secondary.main}
      accessible
      accessibilityLabel="Ícone de informação confirmada"
    />
    <Text style={[styles.infoItemText, { color: colors.text.secondary }]}>{text}</Text>
  </View>
);

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
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
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.body,
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
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
    marginLeft: Spacing.sm,
    lineHeight: Typography.sizes.bodySmall * Typography.lineHeight.normal,
  },
});

export default DigitalCardScreen;
