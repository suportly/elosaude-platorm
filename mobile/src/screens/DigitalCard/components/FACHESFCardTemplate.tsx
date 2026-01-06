/**
 * FACHESFCardTemplate - Template principal da carteirinha Fachesf
 *
 * Design oficial Fachesf:
 * - Header curvo verde com gradiente
 * - Badge "ESPECIAL" branco no header verde
 * - Hierarquia de texto invertida (valor acima do label)
 * - Grid de informacoes com bordas rosas
 * - Rodape com contatos e logo
 * - ANS vertical na lateral direita
 * - SEM flip animation (cartao de lado unico)
 */

import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { FACHESFBody } from '../../../components/cards/FACHESFBody';
import { FACHESFFooter } from '../../../components/cards/FACHESFFooter';
import { FACHESFHeader } from '../../../components/cards/FACHESFHeader';
import { BorderRadius, Shadows, Spacing, Typography } from '../../../config/theme';
import type { FACHESFCardTemplateProps } from '../../../types/fachesf';
import { FACHESF_COLORS } from '../../../types/fachesf';
import { extractFACHESFCardData } from '../../../utils/cardUtils';

const CARD_ASPECT_RATIO = 1.13;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Altura do header curvo como porcentagem da altura do cartao
const HEADER_HEIGHT_RATIO = 0.18;

// Cores do gradiente verde (3 tons mais claros)
const GREEN_GRADIENT = {
  start: '#b8e6ca', // Verde claro (esquerda)
  end: '#2cbc7e', // Verde médio (direita)
};

/**
 * Header curvo verde com gradiente
 */
function CurvedHeader({ width, height }: { width: number; height: number }) {
  const headerHeight = height * HEADER_HEIGHT_RATIO;
  const svgHeight = headerHeight * 1.8;

  // Curva suave da esquerda (mais alta) para direita (mais baixa)
  const curveStartY = headerHeight * 0.2;
  const curveEndY = headerHeight * 1;
  const controlX = width * 0.6;
  const controlY = headerHeight * 0.2;

  const path = `
    M 0,0
    L ${width},0
    L ${width},${curveEndY}
    Q ${controlX},${controlY} 0,${curveStartY}
    Z
  `;

  return (
    <Svg width={width} height={svgHeight} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient
          id="greenGradient"
          x1="0"
          y1="0"
          x2={width}
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={GREEN_GRADIENT.start} />
          <Stop offset="1" stopColor={GREEN_GRADIENT.end} />
        </LinearGradient>
      </Defs>
      <Path d={path} fill="url(#greenGradient)" />
    </Svg>
  );
}

/**
 * Badge "ESPECIAL" dentro do header verde
 */
function HeaderBadge({ planType }: { planType: string }) {
  return (
    <View style={styles.headerBadge}>
      <Text style={styles.headerBadgeText}>{planType}</Text>
    </View>
  );
}

export function FACHESFCardTemplate({
  cardData,
  beneficiary,
  onPress,
  style,
}: FACHESFCardTemplateProps) {
  // Card dimensions - must match CARD_WIDTH in DigitalCardScreen
  const cardWidth = SCREEN_WIDTH - Spacing.screenPadding * 2;
  const cardHeight = cardWidth + 2;

  // Extract and format data for display
  const displayData = useMemo(
    () => extractFACHESFCardData(cardData, beneficiary),
    [cardData, beneficiary]
  );

  return (
    <View style={[styles.container, { width: cardWidth }, style]}>
      <View
        style={[styles.card, { height: cardHeight }]}
        accessibilityLabel={`Carteirinha Fachesf de ${displayData.beneficiaryName}`}
        accessibilityRole="image"
      >
        {/* Curved green header background */}
        <CurvedHeader width={cardWidth} height={cardHeight} />

        {/* Badge "ESPECIAL" positioned in the green header */}
        <HeaderBadge planType={displayData.planType} />

        {/* Content area below curved header */}
        <View
          style={[styles.contentWrapper, { marginTop: cardHeight * HEADER_HEIGHT_RATIO * 1.1 }]}
        >
          {/* Header with name (below curved area) */}
          <FACHESFHeader
            beneficiaryName={displayData.beneficiaryName}
            planType={displayData.planType}
          />

          {/* Body with info grid */}
          <FACHESFBody
            registrationCode={displayData.registrationCode}
            validityDate={displayData.validityDate}
            cnsNumber={displayData.cnsNumber}
            accommodation={displayData.accommodation}
            coverage={displayData.coverage}
          />

          {/* Footer with contacts and logo */}
          <FACHESFFooter
            contactsTitle={displayData.contactsTitle}
            contacts={displayData.contacts}
            legalText={displayData.legalText}
          />
        </View>

        {/* Vertical ANS text on right edge */}
        <View style={styles.ansContainer}>
          <Text style={styles.ansText}>ANS {displayData.ansNumber}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: FACHESF_COLORS.cardBackground,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: FACHESF_COLORS.cardBackground,
  },
  headerBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.md,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerBadgeText: {
    color: FACHESF_COLORS.textWhite,
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
  },
  ansContainer: {
    position: 'absolute',
    right: -45,
    top: '85%',
    transform: [{ rotate: '-90deg' }, { translateY: -10 }],
    width: 120,
    alignItems: 'center',
  },
  ansText: {
    fontSize: Typography.sizes.caption - 5,
    fontWeight: Typography.weights.medium,
    color: FACHESF_COLORS.textLabel,
    letterSpacing: 0.5,
  },
});

export default FACHESFCardTemplate;
