/**
 * ELETROSBodyBack - Corpo verso da carteirinha Eletros-Saude
 *
 * Conteudo:
 * - Linha divisoria verde
 * - Lista de dados tecnicos (bold label + valor)
 * - Linha UTI Movel | CPT
 * - Bloco de contatos
 * - Nota de intransferibilidade
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spacing, Typography } from '../../config/theme';
import { ELETROS_COLORS } from '../../types/eletros';
import type { ELETROSBodyBackProps } from '../../types/eletros';

interface DataRowProps {
  label: string;
  value: string;
}

function DataRow({ label, value }: DataRowProps) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

export function ELETROSBodyBack({
  technicalData,
  contacts,
  transferabilityNote,
}: ELETROSBodyBackProps) {
  return (
    <View style={styles.container}>
      {/* Linha divisoria verde */}
      <View style={styles.greenDivider} />

      {/* Dados tecnicos */}
      <View style={styles.technicalSection}>
        <DataRow
          label="Segmentacao Assistencial do Plano:"
          value={technicalData.segmentation}
        />
        <DataRow
          label="Padrao de Acomodacao:"
          value={technicalData.accommodation}
        />
        <DataRow
          label="Area de Abrangencia Geografia:"
          value={technicalData.coverage}
        />
        <DataRow
          label="Tipo de Contratacao:"
          value={technicalData.contractType}
        />

        {/* Linha UTI Movel | CPT */}
        <View style={styles.inlineRow}>
          <View style={styles.inlineItem}>
            <Text style={styles.dataLabel}>Vida UTI Movel:</Text>
            <Text style={styles.dataValue}> {technicalData.utiMobile}</Text>
          </View>
          <View style={styles.inlineItem}>
            <Text style={styles.dataLabel}>CPT:</Text>
            <Text style={styles.dataValue}> {technicalData.cpt}</Text>
          </View>
        </View>
      </View>

      {/* Bloco de contatos */}
      <View style={styles.contactsSection}>
        {/* Eletros-Saude */}
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>{contacts.eletrosSaude.label}</Text>
          <Text style={styles.contactValue}>
            {contacts.eletrosSaude.phone} | {contacts.eletrosSaude.website}
          </Text>
        </View>

        {/* Plantao Emergencial */}
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>{contacts.emergencyService.label}</Text>
          <Text style={styles.contactValue}>
            {contacts.emergencyService.phones.join(' ou ')}
          </Text>
          <Text style={styles.contactHours}>{contacts.emergencyService.hours}</Text>
        </View>

        {/* Disque ANS */}
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>{contacts.ans.label}</Text>
          <Text style={styles.contactValue}>
            {contacts.ans.phone} | {contacts.ans.website}
          </Text>
        </View>
      </View>

      {/* Nota de intransferibilidade */}
      <View style={styles.noteSection}>
        <Text style={styles.noteText}>{transferabilityNote}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ELETROS_COLORS.cardBackground,
  },
  greenDivider: {
    height: 3,
    backgroundColor: ELETROS_COLORS.dividerGreen,
    width: '100%',
  },
  technicalSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  dataRow: {
    marginBottom: Spacing.xs,
  },
  dataLabel: {
    fontSize: Typography.sizes.caption,
    color: ELETROS_COLORS.textDark,
    fontWeight: Typography.weights.bold,
  },
  dataValue: {
    fontSize: Typography.sizes.caption,
    color: ELETROS_COLORS.textDark,
    fontWeight: Typography.weights.regular,
  },
  inlineRow: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  inlineItem: {
    flexDirection: 'row',
    marginRight: Spacing.lg,
  },
  contactsSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: ELETROS_COLORS.textGray + '30',
  },
  contactRow: {
    marginBottom: Spacing.xs,
  },
  contactLabel: {
    fontSize: Typography.sizes.caption - 1,
    color: ELETROS_COLORS.textDark,
    fontWeight: Typography.weights.bold,
  },
  contactValue: {
    fontSize: Typography.sizes.caption - 1,
    color: ELETROS_COLORS.textDark,
  },
  contactHours: {
    fontSize: Typography.sizes.caption - 2,
    color: ELETROS_COLORS.textGray,
    fontStyle: 'italic',
  },
  noteSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  noteText: {
    fontSize: Typography.sizes.caption - 2,
    color: ELETROS_COLORS.textGray,
    fontStyle: 'italic',
    textAlign: 'right',
  },
});

export default ELETROSBodyBack;
