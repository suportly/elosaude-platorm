/**
 * ELETROSBodyFront - Corpo frontal da carteirinha Eletros-Saude
 *
 * Conteudo:
 * - Label "Identificacao do usuario"
 * - Matricula Reciprocidade (box com borda vermelha)
 * - Nome Completo (box com borda vermelha)
 * - Grid 3 colunas: Nascimento | Validade | Plano
 * - Texto legal em italico
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Spacing, Typography } from '../../config/theme';
import type { ELETROSBodyFrontProps } from '../../types/eletros';
import { ELETROS_COLORS } from '../../types/eletros';

export function ELETROSBodyFront({
  registrationNumber,
  beneficiaryName,
  gridData,
  legalText,
}: ELETROSBodyFrontProps) {
  return (
    <View style={styles.container}>
      {/* Identificacao Label */}
      <Text style={styles.sectionLabel}>Identificacao do usuario</Text>

      {/* Matricula - Campo destacado com borda vermelha */}
      <View style={styles.gridContainer}>
        <View style={styles.gridColumn}>
          <Text style={styles.fieldLabel}>Matricula Reciprocidade</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>
            {registrationNumber}
          </Text>
        </View>
      </View>

      {/* Nome - Campo destacado com borda vermelha */}
      <View style={styles.gridContainer}>
        <View style={styles.gridColumn}>
          <Text style={styles.fieldLabel}>Nome Completo</Text>
          <Text style={styles.fieldValueLarge} numberOfLines={2}>
            {beneficiaryName}
          </Text>
        </View>
      </View>

      {/* Grid 2 colunas */}
      <View style={styles.gridContainer}>
        <View style={styles.gridColumn}>
          <Text style={styles.gridLabel}>Nascimento</Text>
          <Text style={styles.dateValue}>{gridData.birthDate}</Text>
        </View>
        <View style={styles.gridColumn}>
          <Text style={styles.gridLabel}>Validade</Text>
          <Text style={styles.dateValue}>{gridData.validityDate}</Text>
        </View>
      </View>

      <View style={styles.gridContainer}>
        <View style={[styles.gridColumn, styles.gridColumnLarge]}>
          <Text style={styles.gridLabel}>Plano</Text>
          <Text style={styles.planValue} numberOfLines={2}>
            {gridData.planName}
          </Text>
        </View>
      </View>

      {/* Texto legal em italico */}
      <Text style={styles.legalText}>{legalText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    // Transparent to show the white card background beneath
  },
  sectionLabel: {
    fontSize: Typography.sizes.caption,
    color: ELETROS_COLORS.textGray,
    marginBottom: Spacing.xs,
  },
  highlightedField: {
    padding: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  fieldLabel: {
    fontSize: Typography.sizes.caption - 1,
    color: ELETROS_COLORS.textGray,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: Typography.sizes.body,
    color: ELETROS_COLORS.textDark,
    fontWeight: Typography.weights.medium,
  },
  fieldValueLarge: {
    fontSize: Typography.sizes.body,
    color: ELETROS_COLORS.textDark,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
  },
  gridContainer: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  gridColumn: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  gridColumnLarge: {
    flex: 1.5,
    marginRight: 0,
  },
  gridLabel: {
    fontSize: Typography.sizes.caption - 1,
    color: ELETROS_COLORS.textGray,
    marginBottom: 2,
  },
  dateBox: {
    borderWidth: 1,
    borderColor: ELETROS_COLORS.highlightRed,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  dateValue: {
    fontSize: Typography.sizes.bodySmall,
    color: ELETROS_COLORS.textDark,
    fontWeight: Typography.weights.medium,
  },
  planValue: {
    fontSize: Typography.sizes.bodySmall,
    color: ELETROS_COLORS.textDark,
    fontWeight: Typography.weights.medium,
  },
  legalText: {
    fontSize: Typography.sizes.caption - 1,
    color: ELETROS_COLORS.textGray,
    fontStyle: 'italic',
    lineHeight: Typography.sizes.caption * 1.3,
  },
});

export default ELETROSBodyFront;
