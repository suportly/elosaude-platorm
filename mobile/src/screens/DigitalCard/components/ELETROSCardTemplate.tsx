/**
 * ELETROSCardTemplate - Template principal da carteirinha Eletros-Saude com flip animation
 *
 * Design oficial Eletros-Saude:
 * - Header curvo azul (frente) com logo branco
 * - Header branco (verso) com logo colorido
 * - Flip 3D entre frente e verso
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { ELETROSBodyBack } from '../../../components/cards/ELETROSBodyBack';
import { ELETROSBodyFront } from '../../../components/cards/ELETROSBodyFront';
import { ELETROSHeader } from '../../../components/cards/ELETROSHeader';
import { BorderRadius, Shadows, Spacing, Typography } from '../../../config/theme';
import type { ELETROSCardTemplateProps } from '../../../types/eletros';
import { ELETROS_COLORS } from '../../../types/eletros';
import { extractELETROSCardData } from '../../../utils/cardUtils';

const CARD_ASPECT_RATIO = 0.88;
const FLIP_DURATION = 400;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// PARAMETROS DE AJUSTE DO HEADER - Modifique estes valores para ajustar as formas
// ============================================================================

// Altura do header como porcentagem da altura do cartao (0.28 = 28%)
const HEADER_HEIGHT_RATIO = 0.28;

// --- FORMA AZUL (camada de fundo) ---
const BLUE_SHAPE = {
  // Swoosh inferior: altura do lado esquerdo (mais baixo) como multiplicador do headerHeight
  bottomLeftY: 0.8,
  // Swoosh inferior: altura do lado direito (mais alto) como multiplicador do headerHeight
  bottomRightY: 0.85,
  // Ponto de controle da curva: posicao X (0-1, onde 0.5 = centro)
  curveControlX: 0.5,
  // Ponto de controle da curva: ajuste de Y (multiplicador de bottomLeftY)
  curveControlYFactor: 0.4,
};

// --- FORMA VERDE (sobrepoe o azul da direita) ---
const GREEN_SHAPE = {
  // Ponto inicial no topo: posicao X como porcentagem da largura (0.38 = 38% da esquerda)
  startX: 0,
  // Curva S - Primeiro ponto de controle (vai para ESQUERDA)
  curve1: {
    x: 3, // posicao X (quanto menor, mais para esquerda "invade" o azul)
    y: -8, // posicao Y como multiplicador do headerHeight
  },
  // Curva S - Segundo ponto de controle
  curve2: {
    x: 0, // posicao X
    y: -1, // posicao Y como multiplicador do headerHeight
  },
  // Ponto final da curva S (volta para DIREITA)
  curveEnd: {
    x: 0, // posicao X
    y: 0, // posicao Y como multiplicador do headerHeight
  },
  // Curva quadratica final ate o canto direito
  bottomCurve: {
    controlX: 0.6, // ponto de controle X
    controlYFactor: 0.1, // multiplicador de bottomLeftY do azul
  },
};

// ============================================================================
// COMPONENTE CURVEDHEADER
// ============================================================================
function CurvedHeader({ width, height }: { width: number; height: number }) {
  const headerHeight = height * HEADER_HEIGHT_RATIO;
  const svgHeight = headerHeight * 1.5;

  // Calculos da forma AZUL
  const blueBottomLeftY = headerHeight * BLUE_SHAPE.bottomLeftY;
  const blueBottomRightY = headerHeight * BLUE_SHAPE.bottomRightY;
  const blueCurveControlX = width * BLUE_SHAPE.curveControlX;
  const blueCurveControlY = blueBottomLeftY * BLUE_SHAPE.curveControlYFactor;

  const bluePath = `
    M 0,0
    L ${width},0
    L ${width},${blueBottomRightY}
    Q ${blueCurveControlX},${blueCurveControlY} 0,${blueBottomLeftY}
    Z
  `;

  // Calculos da forma VERDE
  const greenStartX = width * GREEN_SHAPE.startX;
  const greenCurve1X = width * GREEN_SHAPE.curve1.x;
  const greenCurve1Y = headerHeight * GREEN_SHAPE.curve1.y;
  const greenCurve2X = width * GREEN_SHAPE.curve2.x;
  const greenCurve2Y = headerHeight * GREEN_SHAPE.curve2.y;
  const greenCurveEndX = width * GREEN_SHAPE.curveEnd.x;
  const greenCurveEndY = headerHeight * GREEN_SHAPE.curveEnd.y;
  const greenBottomControlX = width * GREEN_SHAPE.bottomCurve.controlX;
  const greenBottomControlY = blueBottomLeftY * GREEN_SHAPE.bottomCurve.controlYFactor;

  const greenPath = `
    M ${greenStartX},0
    C ${greenCurve1X},${greenCurve1Y} ${greenCurve2X},${greenCurve2Y} ${greenCurveEndX},${greenCurveEndY}
    Q ${greenBottomControlX},${greenBottomControlY} ${width},${blueBottomRightY}
    L ${width},0
    Z
  `;

  return (
    <Svg width={width} height={svgHeight} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient
          id="blueGradient"
          x1="0"
          y1="0"
          x2={width}
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={ELETROS_COLORS.headerBlueStart} />
          <Stop offset="1" stopColor={ELETROS_COLORS.headerBlueEnd} />
        </LinearGradient>
        <LinearGradient
          id="greenGradient"
          x1="0"
          y1="0"
          x2={width}
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={ELETROS_COLORS.headerGreenStart} />
          <Stop offset="1" stopColor={ELETROS_COLORS.headerGreenEnd} />
        </LinearGradient>
      </Defs>
      {/* Azul - camada de fundo */}
      <Path d={bluePath} fill="url(#blueGradient)" />
      {/* Verde - sobrepoe da direita */}
      <Path d={greenPath} fill="url(#greenGradient)" />
    </Svg>
  );
}

export function ELETROSCardTemplate({
  cardData,
  beneficiary,
  onPress,
  style,
  initialFlipped = false,
}: ELETROSCardTemplateProps) {
  // Card dimensions
  const cardWidth = SCREEN_WIDTH - Spacing.screenPadding * 3;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  // Flip state
  const [isFlipped, setIsFlipped] = useState(initialFlipped);
  const [isAnimating, setIsAnimating] = useState(false);
  const rotation = useSharedValue(initialFlipped ? 180 : 0);

  // Extract and format data for display
  const displayData = useMemo(
    () => extractELETROSCardData(cardData, beneficiary),
    [cardData, beneficiary]
  );

  // Handle flip animation
  const handleFlip = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    const toValue = isFlipped ? 0 : 180;

    rotation.value = withTiming(toValue, {
      duration: FLIP_DURATION,
      easing: Easing.inOut(Easing.ease),
    });

    setTimeout(() => {
      setIsFlipped(!isFlipped);
      setIsAnimating(false);
    }, FLIP_DURATION);
  }, [isFlipped, isAnimating, rotation]);

  // Front card animated style
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  // Back card animated style
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <View style={[styles.container, { width: cardWidth }, style]}>
      {/* Card Container */}
      <View style={[styles.cardContainer, { height: cardHeight }]} accessibilityRole="none">
        {/* Front Card */}
        <Animated.View
          style={[styles.card, styles.cardFront, { height: cardHeight }, frontAnimatedStyle]}
          accessibilityLabel={`Carteirinha Eletros-Saude de ${displayData.beneficiaryName}, lado frontal`}
          accessibilityRole="image"
        >
          {/* Curved gradient background */}
          <CurvedHeader width={cardWidth} height={cardHeight} />

          {/* Header with logo and ANS tag - positioned over curved area */}
          <View style={styles.headerWrapper}>
            <ELETROSHeader variant="front" />
          </View>

          {/* Body content - positioned below curved area */}
          <View style={[styles.bodyWrapper, { marginTop: cardHeight * 0.28 }]}>
            <ELETROSBodyFront
              registrationNumber={displayData.registrationNumber}
              beneficiaryName={displayData.beneficiaryName}
              gridData={{
                birthDate: displayData.birthDate,
                validityDate: displayData.validityDate,
                planName: displayData.planName,
              }}
              legalText={displayData.legalText}
            />
          </View>
        </Animated.View>

        {/* Back Card */}
        <Animated.View
          style={[styles.card, styles.cardBack, { height: cardHeight }, backAnimatedStyle]}
          accessibilityLabel={`Carteirinha Eletros-Saude de ${displayData.beneficiaryName}, lado verso`}
          accessibilityRole="image"
        >
          {/* Header with colored logo and ANS tag */}
          <ELETROSHeader variant="back" />
          {/* Body content */}
          <ELETROSBodyBack
            technicalData={{
              segmentation: displayData.segmentation,
              accommodation: displayData.accommodation,
              coverage: displayData.coverage,
              contractType: displayData.contractType,
              utiMobile: displayData.utiMobile,
              cpt: displayData.cpt,
            }}
            contacts={displayData.contacts}
            transferabilityNote={displayData.transferabilityNote}
          />
        </Animated.View>
      </View>

      {/* Flip Button */}
      <TouchableOpacity
        onPress={handleFlip}
        disabled={isAnimating}
        style={styles.flipButton}
        accessibilityRole="button"
        accessibilityLabel={isFlipped ? 'Ver frente da carteirinha' : 'Ver verso da carteirinha'}
        accessibilityHint="Toque duas vezes para virar a carteirinha"
        accessibilityState={{ disabled: isAnimating }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.flipButtonContent}>
          <MaterialCommunityIcons
            name="rotate-3d-variant"
            size={20}
            color={ELETROS_COLORS.headerBlueStart}
          />
          <Text style={styles.flipButtonText}>{isFlipped ? 'Ver Frente' : 'Ver Verso'}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    position: 'relative',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: ELETROS_COLORS.cardBackground,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bodyWrapper: {
    flex: 1,
  },
  flipButton: {
    marginTop: Spacing.md,
    backgroundColor: ELETROS_COLORS.headerBlueStart + '20',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flipButtonText: {
    color: ELETROS_COLORS.headerBlueStart,
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.xs,
  },
});

export default ELETROSCardTemplate;
