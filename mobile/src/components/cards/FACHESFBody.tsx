/**
 * FACHESFBody - Grid de informacoes da carteirinha Fachesf
 *
 * Design:
 * - Hierarquia invertida: valor (maior, escuro) ACIMA do label (menor, cinza)
 * - Linha 1: Matricula, Validade, CNS (3 colunas)
 * - Linha 2: Acomodacao, Cobertura (2 colunas, cobertura ocupa mais espaco)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spacing, Typography } from '../../config/theme';
import { FACHESF_COLORS } from '../../types/fachesf';
import type { FACHESFBodyProps } from '../../types/fachesf';

interface LabeledFieldProps {
  value: string;
  label: string;
  flex?: number;
  showBorder?: boolean;
}

/**
 * Campo com hierarquia invertida: valor acima, label abaixo
 */
function LabeledField({ value, label, flex = 1 }: LabeledFieldProps) {
  return (
    <View style={[styles.field, { flex }]}>
      <Text style={styles.fieldValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.fieldLabel}>{label}</Text>
    </View>
  );
}

export function FACHESFBody({
  registrationCode,
  validityDate,
  cnsNumber,
  accommodation,
  coverage,
}: FACHESFBodyProps) {
  return (
    <View style={styles.container}>
      {/* Linha 1: Matricula, Validade, CNS */}
      <View style={styles.row}>
        <LabeledField value={registrationCode} label="CODIGO" />
        <LabeledField value={validityDate} label="VALIDADE" />
        <LabeledField value={cnsNumber} label="CNS" />
      </View>

      {/* Linha 2: Acomodacao, Cobertura */}
      <View style={styles.row}>
        <LabeledField value={accommodation} label="ACOMODACAO" />
        <LabeledField value={coverage} label="COBERTURA" flex={2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: FACHESF_COLORS.cardBackground,
  },
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  field: {
    marginRight: Spacing.sm,
  },
  fieldValue: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: FACHESF_COLORS.textValue,
  },
  fieldLabel: {
    fontSize: Typography.sizes.caption - 1,
    fontWeight: Typography.weights.medium,
    color: FACHESF_COLORS.textLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default FACHESFBody;
