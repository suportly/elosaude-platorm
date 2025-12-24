/**
 * UnimedHeader - Seção de cabeçalho da carteirinha Unimed
 *
 * Design:
 * - Fundo verde Unimed (#00995D)
 * - Logo Unimed SC à esquerda
 * - Logo "somos coop" à direita
 * - Texto "COLETIVO EMPRESARIAL" em caixa alta
 * - Border-radius apenas no topo
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SomosCoopLogo } from '../../assets/images/SomosCoopLogo';
import { UnimedLogo } from '../../assets/images/UnimedLogo';
import { BorderRadius, Colors, Spacing } from '../../config/theme';
import type { UnimedHeaderProps } from '../../types/unimed';

export function UnimedHeader({ contractType }: UnimedHeaderProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="header"
      accessibilityLabel={`Carteirinha Unimed - ${contractType}`}
    >
      {/* Linha dos logos */}
      <View style={styles.logoRow}>
        <UnimedLogo color={Colors.cards.unimed.textLight} />
        <SomosCoopLogo color={Colors.cards.unimed.textLight} />
      </View>

      {/* Tipo de contrato */}
      <Text style={styles.contractType} accessibilityLabel={`Tipo de contrato: ${contractType}`}>
        {contractType}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cards.unimed.header,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  contractType: {
    color: Colors.cards.unimed.textLight,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default UnimedHeader;
