/**
 * VIVESTBodyFront - Corpo frontal da carteirinha Vivest
 *
 * Conteudo:
 * - Numero de matricula (grande, espacado)
 * - Nome do beneficiario (bold, uppercase)
 * - Grid 3x2 com dados do plano
 * - Footer com segmentacao e cobertura parcial
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spacing, Typography } from '../../config/theme';
import type { VIVESTBodyFrontProps } from '../../types/vivest';
import { VIVEST_COLORS } from '../../types/vivest';

/**
 * Formata numero de matricula com espacamento para legibilidade
 * Ex: "123456789012" -> "1234 5678 9012"
 */
function formatRegistrationNumber(number: string): string {
  const cleaned = number.replace(/\s/g, '');
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

export function VIVESTBodyFront({
  registrationNumber,
  beneficiaryName,
  gridData,
  segmentation,
  partialCoverage,
}: VIVESTBodyFrontProps) {
  const formattedNumber = formatRegistrationNumber(registrationNumber);

  return (
    <View style={styles.container}>
      {/* Numero de Matricula */}
      <View style={styles.registrationSection}>
        <Text
          style={styles.registrationNumber}
          accessibilityLabel={`Número de matrícula: ${formattedNumber}`}
          accessibilityRole="text"
        >
          {formattedNumber}
        </Text>
      </View>

      {/* Nome do Beneficiario */}
      <View style={styles.nameSection}>
        <Text
          style={styles.beneficiaryName}
          numberOfLines={2}
          ellipsizeMode="tail"
          accessibilityLabel={`Nome do beneficiário: ${beneficiaryName}`}
          accessibilityRole="text"
        >
          {beneficiaryName.toUpperCase()}
        </Text>
        <Text style={styles.label}>Nome do Beneficiário</Text>
      </View>

      {/* Grid Principal - Linha 1 */}
      <View style={styles.gridRow}>
        <View style={styles.gridCell}>
          <Text
            style={styles.gridValue}
            accessibilityLabel={`Data de nascimento: ${gridData.birthDate}`}
          >
            {gridData.birthDate || '-'}
          </Text>
          <Text style={styles.gridLabel}>Nascimento</Text>
        </View>
        <View style={styles.gridCell}>
          <Text
            style={styles.gridValue}
            accessibilityLabel={`Data de vigência: ${gridData.effectiveDate}`}
          >
            {gridData.effectiveDate || '-'}
          </Text>
          <Text style={styles.gridLabel}>Vigência</Text>
        </View>
        <View style={styles.gridCell}>
          <Text
            style={styles.gridValue}
            accessibilityLabel={`Registro do plano: ${gridData.planRegistry}`}
          >
            {gridData.planRegistry || '-'}
          </Text>
          <Text style={styles.gridLabel}>Registro Plano</Text>
        </View>
      </View>

      {/* Grid Principal - Linha 2 */}
      <View style={styles.gridRow}>
        <View style={styles.gridCell}>
          <Text
            style={styles.gridValue}
            accessibilityLabel={`Acomodação: ${gridData.accommodation}`}
          >
            {gridData.accommodation || '-'}
          </Text>
          <Text style={styles.gridLabel}>Acomodação</Text>
        </View>
        <View style={styles.gridCell}>
          <Text style={styles.gridValue} accessibilityLabel={`Abrangência: ${gridData.coverage}`}>
            {gridData.coverage || '-'}
          </Text>
          <Text style={styles.gridLabel}>Abrangência</Text>
        </View>
        <View style={styles.gridCell}>
          <Text
            style={styles.gridValue}
            numberOfLines={2}
            ellipsizeMode="tail"
            accessibilityLabel={`Contratante: ${gridData.contractor}`}
          >
            {gridData.contractor || '-'}
          </Text>
          <Text style={styles.gridLabel}>Contratante</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text
            style={styles.footerValue}
            numberOfLines={2}
            ellipsizeMode="tail"
            accessibilityLabel={`Segmentação: ${segmentation}`}
          >
            {segmentation || '-'}
          </Text>
          <Text style={styles.footerLabel}>Segmentação</Text>
        </View>
        <View style={styles.footerRight}>
          <Text
            style={styles.footerValue}
            accessibilityLabel={`Cobertura parcial temporária: ${partialCoverage}`}
          >
            {partialCoverage || '-'}
          </Text>
          <Text style={styles.footerLabel}>Cob. Parcial Temp.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
  },

  // Numero de Matricula
  registrationSection: {
    marginBottom: Spacing.sm,
  },
  registrationNumber: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.bold,
    color: VIVEST_COLORS.text,
    letterSpacing: 2,
    textAlign: 'left',
  },

  // Nome do Beneficiario
  nameSection: {
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  beneficiaryName: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.bold,
    color: VIVEST_COLORS.text,
    marginBottom: 2,
  },
  label: {
    fontSize: Typography.sizes.caption,
    color: VIVEST_COLORS.textMuted,
  },

  // Grid
  gridRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  gridCell: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  gridValue: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: VIVEST_COLORS.text,
    marginBottom: 1,
  },
  gridLabel: {
    fontSize: 10,
    color: VIVEST_COLORS.textMuted,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  footerLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  footerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  footerValue: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: VIVEST_COLORS.text,
    marginBottom: 1,
  },
  footerLabel: {
    fontSize: 10,
    color: VIVEST_COLORS.textMuted,
  },
});

export default VIVESTBodyFront;
