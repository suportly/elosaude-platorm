/**
 * UnimedFooter - Seção de rodapé da carteirinha Unimed
 *
 * Design:
 * - Fundo verde petróleo (#0B504B)
 * - Grid 2 colunas com datas e cobertura
 * - Nome da contratante
 * - Barra ANS com informações em fonte pequena
 * - Border-radius apenas na base
 * - Texto branco
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../config/theme';
import type { UnimedFooterProps } from '../../types/unimed';

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={styles.infoValue}
        numberOfLines={1}
        ellipsizeMode="tail"
        accessibilityLabel={`${label}: ${value}`}
      >
        {value}
      </Text>
    </View>
  );
}

export function UnimedFooter({
  birthDate,
  effectiveDate,
  partialCoverage,
  cardEdition,
  contractor,
  ansInfo,
}: UnimedFooterProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel="Informações adicionais da carteirinha"
    >
      {/* Grid de Datas */}
      <View style={styles.grid}>
        {/* Linha 1: Nascimento | Vigência */}
        <View style={styles.gridRow}>
          <InfoItem label="Nascimento" value={birthDate} />
          <InfoItem label="Vigência" value={effectiveDate} />
        </View>

        {/* Linha 2: Cob. Parcial Temp. | Via */}
        <View style={styles.gridRow}>
          <InfoItem label="Cob. Parcial Temp." value={partialCoverage} />
          <InfoItem label="Via" value={cardEdition} />
        </View>
      </View>

      {/* Contratante */}
      <Text
        style={styles.contractor}
        numberOfLines={1}
        ellipsizeMode="tail"
        accessibilityLabel={`Contratante: ${contractor}`}
      >
        Contratante: {contractor}
      </Text>

      {/* Barra ANS */}
      <View style={styles.ansBar}>
        <Text style={styles.ansInfo} accessibilityLabel={`Informações ANS: ${ansInfo}`}>
          {ansInfo}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cards.unimed.footer,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },
  grid: {
    marginBottom: Spacing.xs,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoItem: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  infoLabel: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.cards.unimed.textLight,
  },
  contractor: {
    fontSize: 9,
    color: Colors.cards.unimed.textLight,
    marginTop: Spacing.xs,
  },
  ansBar: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  ansInfo: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
});

export default UnimedFooter;
