/**
 * FACHESFHeader - Header da carteirinha Fachesf
 *
 * Design:
 * - Nome do beneficiario em caixa com borda rosa
 * - Badge "ESPECIAL" agora esta no header curvo verde (FACHESFCardTemplate)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spacing, Typography } from '../../config/theme';
import { FACHESF_COLORS } from '../../types/fachesf';
import type { FACHESFHeaderProps } from '../../types/fachesf';

export function FACHESFHeader({ beneficiaryName }: FACHESFHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Beneficiary name */}
      <View style={styles.nameContainer}>
        <Text style={styles.beneficiaryName} numberOfLines={2}>
          {beneficiaryName}
        </Text>
        <Text style={styles.beneficiaryLabel}>BENEFICIARIO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: FACHESF_COLORS.cardBackground,
  },
  nameContainer: {
    // Content-sized, no flex
  },
  beneficiaryName: {
    fontSize: Typography.sizes.h4,
    fontWeight: Typography.weights.bold,
    color: FACHESF_COLORS.textDark,
    marginBottom: 2,
    minHeight: 24,
  },
  beneficiaryLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: FACHESF_COLORS.textLabel,
    letterSpacing: 0.5,
  },
});

export default FACHESFHeader;
