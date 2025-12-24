/**
 * UnimedBody - Seção do corpo principal da carteirinha Unimed
 *
 * Design:
 * - Fundo verde lima (#C4D668)
 * - Número da carteirinha em destaque
 * - Nome do beneficiário em caixa alta
 * - Grid 2 colunas com informações do plano
 * - Segmentação assistencial no rodapé
 * - Texto em cinza escuro (#333)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';
import type { UnimedBodyProps } from '../../types/unimed';

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel} accessibilityRole="text">
        {label}
      </Text>
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

export function UnimedBody({
  cardNumber,
  beneficiaryName,
  gridData,
  assistanceSegmentation,
}: UnimedBodyProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel="Dados do beneficiário"
    >
      {/* Número da Carteirinha */}
      <Text
        style={styles.cardNumber}
        accessibilityLabel={`Número da carteirinha: ${cardNumber}`}
      >
        {cardNumber}
      </Text>

      {/* Nome do Beneficiário */}
      <Text
        style={styles.beneficiaryName}
        numberOfLines={1}
        ellipsizeMode="tail"
        accessibilityLabel={`Beneficiário: ${beneficiaryName}`}
      >
        {beneficiaryName}
      </Text>
      <Text style={styles.nameLabel}>Nome do Beneficiário</Text>

      {/* Grid de Informações */}
      <View style={styles.grid}>
        {/* Linha 1: Acomodação | Validade */}
        <View style={styles.gridRow}>
          <InfoItem label="Acomodação" value={gridData.accommodation} />
          <InfoItem label="Validade" value={gridData.validity} />
        </View>

        {/* Linha 2: Plano | Rede de Atendimento */}
        <View style={styles.gridRow}>
          <InfoItem label="Plano" value={gridData.planType} />
          <InfoItem label="Rede de Atendimento" value={gridData.networkCode} />
        </View>

        {/* Linha 3: Abrangência | Atend. */}
        <View style={styles.gridRow}>
          <InfoItem label="Abrangência" value={gridData.coverage} />
          <InfoItem label="Atend." value={gridData.serviceCode} />
        </View>
      </View>

      {/* Segmentação Assistencial */}
      <View style={styles.segmentationContainer}>
        <Text
          style={styles.segmentationText}
          accessibilityLabel={`Segmentação: ${assistanceSegmentation}`}
        >
          {assistanceSegmentation}
        </Text>
        <Text style={styles.segmentationLabel}>Segmentação Assistencial do Plano</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cards.unimed.body,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.cards.unimed.textDark,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  beneficiaryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.cards.unimed.textDark,
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
  },
  nameLabel: {
    fontSize: 9,
    color: '#666666',
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  grid: {
    marginTop: Spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  infoItem: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  infoLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.cards.unimed.textDark,
    textTransform: 'uppercase',
  },
  segmentationContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(51, 51, 51, 0.2)',
  },
  segmentationText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.cards.unimed.textDark,
  },
  segmentationLabel: {
    fontSize: 8,
    color: '#666666',
    marginTop: 2,
  },
});

export default UnimedBody;
