/**
 * ElosaúdeCardTemplate - Template principal da carteirinha EloSaude
 *
 * Design oficial EloSaude:
 * - Header branco com logo EloSaude
 * - Body teal (#32A898) com dados do beneficiário
 * - Footer branco com informações ANS
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Shadows, Spacing } from '../../../config/theme';
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
}

export function ElosaúdeCardTemplate({
  cardData,
  beneficiary,
  onPress,
  style,
}: ElosaúdeCardTemplateProps) {
  // Calcula dimensões do cartão mantendo proporção
  const cardWidth = SCREEN_WIDTH - (Spacing.screenPadding * 2);
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  // Extrai e formata dados para exibição
  const displayData = useMemo(
    () => extractElosaúdeCardData(cardData, beneficiary),
    [cardData, beneficiary]
  );

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
});

export default ElosaúdeCardTemplate;
