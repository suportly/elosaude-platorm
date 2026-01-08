/**
 * ElosaúdeCardTemplate - Template principal da carteirinha EloSaude
 *
 * Design oficial EloSaude:
 * - Header branco com logo EloSaude
 * - Body teal (#32A898) com dados do beneficiário
 * - Footer branco com informações ANS
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Shadows, Spacing, BorderRadius, Typography } from '../../../config/theme';
import { useColors } from '../../../config';
import { ElosaúdeHeader } from '../../../components/cards/ElosaúdeHeader';
import { ElosaúdeBody } from '../../../components/cards/ElosaúdeBody';
import { ElosaúdeFooter } from '../../../components/cards/ElosaúdeFooter';
import { extractElosaúdeCardData } from '../../../utils/cardUtils';
import type { OracleCarteirinha } from '../../../types/oracle';

const CARD_ASPECT_RATIO = 1.586;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ElosaúdeCardTemplateProps {
  cardData: OracleCarteirinha;
  beneficiary: {
    full_name: string;
    company?: string;
    birth_date?: string;
    effective_date?: string;
  };
  onPress?: () => void;
  style?: any;
  showQR?: boolean;
}

export function ElosaúdeCardTemplate({
  cardData,
  beneficiary,
  onPress,
  style,
  showQR = true,
}: ElosaúdeCardTemplateProps) {
  const colors = useColors();
  // Calcula dimensões do cartão mantendo proporção
  const cardWidth = SCREEN_WIDTH - (Spacing.screenPadding * 2);
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  // Extrai e formata dados para exibição
  const displayData = useMemo(
    () => extractElosaúdeCardData(cardData, beneficiary),
    [cardData, beneficiary]
  );

  // QR Code data
  const qrData = JSON.stringify({
    type: 'CARTEIRINHA',
    name: displayData.beneficiaryName,
    registration: displayData.cardNumber,
    cpf: displayData.cpf,
    cns: displayData.cns,
  });

  const content = (
    <View
      style={[
        styles.card,
        { width: cardWidth, minHeight: cardHeight },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Carteirinha EloSaude de ${displayData.beneficiaryName}`}
    >
      {/* Header - Branco */}
      <ElosaúdeHeader logoUrl={displayData.logoUrl} />

      {/* Body - Teal */}
      <ElosaúdeBody
        beneficiaryName={displayData.beneficiaryName}
        identificationData={{
          cardNumber: displayData.cardNumber,
          birthDate: displayData.birthDate,
          cpf: displayData.cpf,
          cns: displayData.cns,
        }}
        planData={{
          segmentation: displayData.segmentation,
          cpt: displayData.cpt,
          plans: displayData.plans,
          contractType: displayData.contractType,
          holderName: displayData.holderName,
          validity: displayData.validity,
        }}
        warnings={{
          attentionText: displayData.attentionText,
          warningText: displayData.warningText,
        }}
      />

      {/* Footer - Branco com ANS */}
      <ElosaúdeFooter ansRegistry={displayData.ansRegistry} />

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

export default ElosaúdeCardTemplate;
