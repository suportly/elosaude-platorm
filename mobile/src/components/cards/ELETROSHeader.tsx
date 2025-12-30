/**
 * ELETROSHeader - Header da carteirinha Eletros-Saude
 *
 * Duas variantes:
 * - front: Logo branco sobre header azul curvo + ANS tag preta
 * - back: Logo colorido sobre fundo branco + ANS tag preta
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../config/theme';
import { ELETROS_COLORS, ELETROS_STATIC_INFO } from '../../types/eletros';
import type { ELETROSHeaderProps } from '../../types/eletros';
import { ELETROSLogo } from './ELETROSLogo';

function ANSTag() {
  return (
    <View style={styles.ansTag}>
      <Text style={styles.ansTagText}>{ELETROS_STATIC_INFO.ansNumber}</Text>
    </View>
  );
}

export function ELETROSHeader({ variant }: ELETROSHeaderProps) {
  const isFront = variant === 'front';

  return (
    <View style={[styles.container, isFront ? styles.containerFront : styles.containerBack]}>
      <ELETROSLogo variant={isFront ? 'white' : 'colored'} width={160} height={56} />
      <ANSTag />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    zIndex: 10,
  },
  containerFront: {
    // Transparent because it sits on top of the curved background
    backgroundColor: 'transparent',
  },
  containerBack: {
    backgroundColor: ELETROS_COLORS.cardBackground,
  },
  ansTag: {
    backgroundColor: ELETROS_COLORS.ansTagBackground,
    borderWidth: 1,
    borderColor: ELETROS_COLORS.ansTagBorder,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  ansTagText: {
    color: ELETROS_COLORS.textWhite,
    fontSize: Typography.sizes.caption - 1,
    fontWeight: Typography.weights.semibold,
  },
});

export default ELETROSHeader;
