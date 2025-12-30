/**
 * VIVESTHeader - Cabecalho da carteirinha Vivest
 *
 * Duas variantes:
 * - front: Logo Vivest a esquerda + box de plano a direita
 * - back: Titulo "Carencias" a esquerda + tag ANS a direita
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spacing, Typography } from '../../config/theme';
import type { VIVESTHeaderProps } from '../../types/vivest';
import { VIVEST_COLORS } from '../../types/vivest';
import { VIVESTLogo } from './VIVESTLogo';

export function VIVESTHeader({ planName, variant, ansNumber }: VIVESTHeaderProps) {
  if (variant === 'back') {
    return (
      <View style={styles.headerBack}>
        <Text
          style={styles.backTitle}
          accessibilityRole="header"
          accessibilityLabel="Seção de carências"
        >
          Carências
        </Text>
        {ansNumber && (
          <View style={styles.ansTag}>
            <Text style={styles.ansTagText}>{ansNumber}</Text>
          </View>
        )}
      </View>
    );
  }

  // variant === 'front'
  return (
    <View style={styles.headerFront}>
      <View style={styles.logoContainer}>
        {/* Logo Vivest oficial */}
        <VIVESTLogo width={100} height={22} />
      </View>

      <View style={styles.planBox}>
        <Text style={styles.planName} numberOfLines={2} accessibilityLabel={`Plano: ${planName}`}>
          {planName}
        </Text>
        <Text style={styles.planLabel}>Plano</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Front variant
  headerFront: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planBox: {
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    maxWidth: '50%',
    alignItems: 'flex-end',
  },
  planName: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.bold,
    color: VIVEST_COLORS.text,
    textAlign: 'right',
  },
  planLabel: {
    fontSize: Typography.sizes.caption,
    color: VIVEST_COLORS.textMuted,
    marginTop: 2,
  },

  // Back variant
  headerBack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backTitle: {
    fontSize: Typography.sizes.h3,
    fontWeight: Typography.weights.bold,
    color: VIVEST_COLORS.text,
  },
  ansTag: {
    backgroundColor: VIVEST_COLORS.tagBackground,
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  ansTagText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: VIVEST_COLORS.text,
  },
});

export default VIVESTHeader;
