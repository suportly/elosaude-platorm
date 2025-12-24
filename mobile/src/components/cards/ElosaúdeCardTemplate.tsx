/**
 * ElosaúdeCardTemplate - Template completo da carteirinha EloSaude
 *
 * Combina Header (branco), Body (teal) e Footer (ANS) em um único componente
 */

import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { BorderRadius, Shadows } from '../../config/theme';
import type { ElosaúdeCardTemplateProps } from '../../types/elosaude';
import { ElosaúdeBody } from './ElosaúdeBody';
import { ElosaúdeFooter } from './ElosaúdeFooter';
import { ElosaúdeHeader } from './ElosaúdeHeader';

export function ElosaúdeCardTemplate({
  cardData,
  onPress,
  style,
}: ElosaúdeCardTemplateProps) {
  const containerStyle: ViewStyle[] = [styles.container, style as ViewStyle];

  const content = (
    <>
      <ElosaúdeHeader logoUrl={cardData.logoUrl} />
      <ElosaúdeBody
        beneficiaryName={cardData.beneficiaryName}
        identificationData={{
          cardNumber: cardData.cardNumber,
          birthDate: cardData.birthDate,
          cpf: cardData.cpf,
          cns: cardData.cns,
        }}
        planData={{
          segmentation: cardData.segmentation,
          cpt: cardData.cpt,
          plans: cardData.plans,
          contractType: cardData.contractType,
          holderName: cardData.holderName,
          validity: cardData.validity,
        }}
        warnings={{
          attentionText: cardData.attentionText,
          warningText: cardData.warningText,
        }}
      />
      <ElosaúdeFooter ansRegistry={cardData.ansRegistry} />
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={containerStyle}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Carteirinha EloSaude - Toque para ver detalhes"
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={containerStyle} accessibilityLabel="Carteirinha EloSaude">
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.card,
  },
});

export default ElosaúdeCardTemplate;
