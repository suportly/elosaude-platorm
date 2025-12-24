/**
 * ElosaúdeFooter - Seção de rodapé da carteirinha EloSaude
 *
 * Design:
 * - Fundo branco
 * - Logo ANS à esquerda
 * - Registro ANS
 * - Border-radius apenas no bottom
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ANSLogo } from '../../assets/images/ANSLogo';
import { BorderRadius, Colors, Spacing } from '../../config/theme';
import type { ElosaúdeFooterProps } from '../../types/elosaude';

export function ElosaúdeFooter({ ansRegistry }: ElosaúdeFooterProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel="Informações ANS"
    >
      <View style={styles.content}>
        <ANSLogo width={50} height={24} />
        <View style={styles.registryContainer}>
          <Text style={styles.registryLabel}>Registro ANS</Text>
          <Text
            style={styles.registryValue}
            accessibilityLabel={`Registro ANS: ${ansRegistry}`}
          >
            {ansRegistry}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cards.elosaude.footer,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registryContainer: {
    marginLeft: Spacing.md,
  },
  registryLabel: {
    fontSize: 8,
    color: '#666666',
  },
  registryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.cards.elosaude.textDark,
  },
});

export default ElosaúdeFooter;
