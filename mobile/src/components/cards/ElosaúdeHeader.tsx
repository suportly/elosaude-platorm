/**
 * ElosaúdeHeader - Seção de cabeçalho da carteirinha EloSaude
 *
 * Design:
 * - Fundo branco
 * - Logo EloSaude à esquerda
 * - Border-radius apenas no topo
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ElosaúdeLogo } from '../../assets/images/ElosaúdeLogo';
import { BorderRadius, Colors, Spacing } from '../../config/theme';
import type { ElosaúdeHeaderProps } from '../../types/elosaude';

export function ElosaúdeHeader(_props: ElosaúdeHeaderProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="header"
      accessibilityLabel="Carteirinha EloSaude"
    >
      <ElosaúdeLogo />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cards.elosaude.header,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    borderTopWidth: 6,
    borderTopColor: Colors.cards.elosaude.body,
  },
});

export default ElosaúdeHeader;
