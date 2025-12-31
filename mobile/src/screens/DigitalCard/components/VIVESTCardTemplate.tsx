/**
 * VIVESTCardTemplate - Template principal da carteirinha Vivest com flip animation
 *
 * Design oficial Vivest:
 * - Fundo azul marinho profundo (#003366)
 * - Linhas decorativas brancas e vermelhas
 * - Flip 3D entre frente e verso
 * - Proporcao de cartao de credito (1.586:1)
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
import { VIVESTBodyBack } from '../../../components/cards/VIVESTBodyBack';
import { VIVESTBodyFront } from '../../../components/cards/VIVESTBodyFront';
import { VIVESTDecorativeLines } from '../../../components/cards/VIVESTDecorativeLines';
import { VIVESTHeader } from '../../../components/cards/VIVESTHeader';
import { BorderRadius, Shadows, Spacing, Typography } from '../../../config/theme';
import type { VIVESTCardTemplateProps } from '../../../types/vivest';
import { VIVEST_COLORS } from '../../../types/vivest';
import { extractVIVESTCardData } from '../../../utils/cardUtils';

const CARD_ASPECT_RATIO = 1.13;
const FLIP_DURATION = 400;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function VIVESTCardTemplate({
  cardData,
  beneficiary,
  onPress,
  style,
  initialFlipped = false,
}: VIVESTCardTemplateProps) {
  // Card dimensions - must match CARD_WIDTH in DigitalCardScreen
  const cardWidth = SCREEN_WIDTH - (Spacing.screenPadding * 2);
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  // Flip state
  const [isFlipped, setIsFlipped] = useState(initialFlipped);
  const [isAnimating, setIsAnimating] = useState(false);
  const rotation = useSharedValue(initialFlipped ? 180 : 0);

  // Extract and format data for display
  const displayData = useMemo(
    () => extractVIVESTCardData(cardData, beneficiary),
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

    // Update state after animation starts
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
          accessibilityLabel={`Carteirinha Vivest de ${displayData.beneficiaryName}, lado frontal`}
          accessibilityRole="image"
        >
          <VIVESTHeader planName={displayData.planName} variant="front" />
          <VIVESTDecorativeLines position="top-right" width={cardWidth} height={cardHeight} />
          <VIVESTBodyFront
            registrationNumber={displayData.registrationNumber}
            beneficiaryName={displayData.beneficiaryName}
            gridData={{
              birthDate: displayData.birthDate,
              effectiveDate: displayData.effectiveDate,
              planRegistry: displayData.planRegistry,
              accommodation: displayData.accommodation,
              coverage: displayData.coverage,
              contractor: displayData.contractor,
            }}
            segmentation={displayData.segmentation}
            partialCoverage={displayData.partialCoverage}
          />
        </Animated.View>

        {/* Back Card */}
        <Animated.View
          style={[styles.card, styles.cardBack, { height: cardHeight }, backAnimatedStyle]}
          accessibilityLabel={`Carteirinha Vivest de ${displayData.beneficiaryName}, lado verso`}
          accessibilityRole="image"
        >
          <VIVESTHeader
            planName={displayData.planName}
            variant="back"
            ansNumber={displayData.planAnsNumber}
          />
          <VIVESTDecorativeLines position="bottom-right" width={cardWidth} height={cardHeight} />
          <VIVESTBodyBack
            gracePeriodText={displayData.gracePeriodText}
            operatorAnsNumber={displayData.operatorAnsNumber}
            cnsNumber={displayData.cnsNumber}
            contacts={displayData.contacts}
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
          <MaterialCommunityIcons name="rotate-3d-variant" size={20} color={VIVEST_COLORS.text} />
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
    backgroundColor: VIVEST_COLORS.primary,
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
  flipButton: {
    marginTop: Spacing.md,
    backgroundColor: VIVEST_COLORS.primaryLight,
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
    color: VIVEST_COLORS.text,
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.xs,
  },
});

export default VIVESTCardTemplate;
