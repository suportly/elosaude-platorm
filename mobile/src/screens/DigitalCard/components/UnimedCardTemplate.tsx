/**
 * UnimedCardTemplate - Template principal da carteirinha Unimed
 *
 * Design oficial Unimed Santa Catarina:
 * - Header verde (#00995D) com logos e tipo de contratação
 * - Body verde lima (#C4D668) com dados do beneficiário
 * - Footer verde petróleo (#0B504B) com informações complementares
 * - Proporção de cartão de crédito (1.586:1)
 * - Border-radius apenas nas extremidades
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Shadows, Spacing, BorderRadius, Typography } from '../../../config/theme';
import { useColors } from '../../../config';
import { UnimedHeader } from '../../../components/cards/UnimedHeader';
import { UnimedBody } from '../../../components/cards/UnimedBody';
import { UnimedFooter } from '../../../components/cards/UnimedFooter';
import { extractUnimedCardData } from '../../../utils/cardUtils';
import type { UnimedCardTemplateProps } from '../../../types/unimed';

const CARD_ASPECT_RATIO = 1.586;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function UnimedCardTemplate({
  cardData,
  beneficiary,
  onPress,
  style,
  showQR = true,
}: UnimedCardTemplateProps) {
  const colors = useColors();
  // Calcula dimensões do cartão mantendo proporção
  const cardWidth = SCREEN_WIDTH - (Spacing.screenPadding * 2);
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  // Extrai e formata dados para exibição
  const displayData = useMemo(
    () => extractUnimedCardData(cardData, beneficiary),
    [cardData, beneficiary]
  );

  // QR Code data
  const qrData = JSON.stringify({
    type: 'UNIMED',
    name: displayData.beneficiaryName,
    registration: displayData.cardNumber,
  });

  const content = (
    <View
      style={[
        styles.card,
        { width: cardWidth, minHeight: cardHeight },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Carteirinha Unimed de ${displayData.beneficiaryName}`}
    >
      {/* Header - Verde Unimed */}
      <UnimedHeader contractType={displayData.contractType} />

      {/* Body - Verde Lima */}
      <UnimedBody
        cardNumber={displayData.cardNumber}
        beneficiaryName={displayData.beneficiaryName}
        gridData={{
          accommodation: displayData.accommodation,
          validity: displayData.validity,
          planType: displayData.planType,
          networkCode: displayData.networkCode,
          coverage: displayData.coverage,
          serviceCode: displayData.serviceCode,
        }}
        assistanceSegmentation={displayData.assistanceSegmentation}
      />

      {/* Footer - Verde Petróleo */}
      <UnimedFooter
        birthDate={displayData.birthDate}
        effectiveDate={displayData.effectiveDate}
        partialCoverage={displayData.partialCoverage}
        cardEdition={displayData.cardEdition}
        contractor={displayData.contractor}
        ansInfo={displayData.ansInfo}
      />

      {/* QR Code */}
      {showQR && (
        <View
          style={styles.qrSection}
          accessible
          accessibilityLabel="Código QR da carteirinha"
          accessibilityRole="image"
        >
          <View style={[styles.qrContainer, { backgroundColor: colors.surface.muted }]}>
            <QRCode
              value={qrData}
              size={140}
              color={colors.text.primary}
              backgroundColor={colors.surface.card}
            />
          </View>
          <Text style={[styles.qrHint, { color: colors.text.tertiary }]}>
            Apresente este QR Code nos prestadores credenciados
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityHint="Toque para ver detalhes da carteirinha"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...Shadows.lg,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  qrSection: {
    padding: Spacing.md,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  qrContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  qrHint: {
    fontSize: Typography.sizes.caption,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});

export default UnimedCardTemplate;
