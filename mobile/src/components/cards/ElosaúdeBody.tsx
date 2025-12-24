/**
 * ElosaúdeBody - Seção do corpo principal da carteirinha EloSaude
 *
 * Design:
 * - Fundo teal (#32A898)
 * - Nome do beneficiário em destaque
 * - Grids 2 colunas para dados pareados
 * - Lista de planos
 * - Campos individuais (Contratação, Titular, Validade)
 * - Box de atenção com borda
 * - Texto em branco
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../../config/theme';
import type { ElosaúdeBodyProps } from '../../types/elosaude';

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
        numberOfLines={2}
        ellipsizeMode="tail"
        accessibilityLabel={`${label}: ${value}`}
      >
        {value}
      </Text>
    </View>
  );
}

interface SingleFieldProps {
  label: string;
  value: string;
}

function SingleField({ label, value }: SingleFieldProps) {
  return (
    <View style={styles.singleField}>
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

export function ElosaúdeBody({
  beneficiaryName,
  identificationData,
  planData,
  warnings,
}: ElosaúdeBodyProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel="Dados do beneficiário"
    >
      {/* Nome do Beneficiário */}
      <View style={styles.beneficiarySection}>
        <Text style={styles.beneficiaryLabel}>Beneficiário</Text>
        <Text
          style={styles.beneficiaryName}
          numberOfLines={1}
          ellipsizeMode="tail"
          accessibilityLabel={`Beneficiário: ${beneficiaryName}`}
        >
          {beneficiaryName}
        </Text>
      </View>

      {/* Grid: Matrícula | Nascimento */}
      <View style={styles.gridRow}>
        <InfoItem label="Matrícula" value={identificationData.cardNumber} />
        <InfoItem label="Nascimento" value={identificationData.birthDate} />
      </View>

      {/* Grid: CPF | CNS */}
      <View style={styles.gridRow}>
        <InfoItem label="CPF" value={identificationData.cpf} />
        <InfoItem label="CNS" value={identificationData.cns} />
      </View>

      {/* Grid: Segmentação | CPT */}
      <View style={styles.gridRow}>
        <InfoItem label="Segmentação" value={planData.segmentation} />
        <InfoItem label="CPT" value={planData.cpt} />
      </View>

      {/* Plano(s) */}
      <View style={styles.planSection}>
        <Text style={styles.infoLabel}>Plano</Text>
        {planData.plans.map((plan, index) => (
          <Text
            key={index}
            style={styles.planItem}
            accessibilityLabel={`Plano: ${plan}`}
          >
            {plan}
          </Text>
        ))}
      </View>

      {/* Contratação */}
      <SingleField label="Contratação" value={planData.contractType} />

      {/* Titular */}
      <SingleField label="Titular" value={planData.holderName} />

      {/* Validade */}
      <SingleField label="Validade" value={planData.validity} />

      {/* Atenção */}
      <View style={styles.attentionSection}>
        <Text style={styles.attentionLabel}>Atenção</Text>
        <Text style={styles.attentionText}>{warnings.attentionText}</Text>
      </View>

      {/* Warning Box */}
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>{warnings.warningText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cards.elosaude.body,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  beneficiarySection: {
    marginBottom: Spacing.md,
  },
  beneficiaryLabel: {
    fontSize: 9,
    color: Colors.cards.elosaude.labelText,
    marginBottom: 2,
  },
  beneficiaryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.cards.elosaude.textLight,
    textTransform: 'uppercase',
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  infoItem: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  infoLabel: {
    fontSize: 9,
    color: Colors.cards.elosaude.labelText,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.cards.elosaude.textLight,
    textTransform: 'uppercase',
  },
  planSection: {
    marginBottom: Spacing.sm,
  },
  planItem: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.cards.elosaude.textLight,
    marginTop: 2,
  },
  singleField: {
    marginBottom: Spacing.sm,
  },
  attentionSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  attentionLabel: {
    fontSize: 9,
    color: Colors.cards.elosaude.labelText,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  attentionText: {
    fontSize: 10,
    color: Colors.cards.elosaude.textLight,
    lineHeight: 14,
  },
  warningBox: {
    borderWidth: 1,
    borderColor: Colors.cards.elosaude.textLight,
    borderRadius: 4,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  warningText: {
    fontSize: 9,
    color: Colors.cards.elosaude.textLight,
    textAlign: 'center',
    lineHeight: 13,
  },
});

export default ElosaúdeBody;
