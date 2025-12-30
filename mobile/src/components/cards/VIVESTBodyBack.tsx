/**
 * VIVESTBodyBack - Corpo do verso da carteirinha Vivest
 *
 * Conteudo:
 * - Texto de carencias
 * - Secao ANS operadora
 * - Numero CNS
 * - Grid de contatos (telefones e sites)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Spacing, Typography } from '../../config/theme';
import type { VIVESTBodyBackProps } from '../../types/vivest';
import { VIVEST_COLORS } from '../../types/vivest';

/**
 * Icone de telefone
 */
function PhoneIcon({ size = 14, color = VIVEST_COLORS.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Icone de globo (website)
 */
function GlobeIcon({ size = 14, color = VIVEST_COLORS.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Path
        d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function VIVESTBodyBack({
  gracePeriodText,
  operatorAnsNumber,
  cnsNumber,
  contacts,
}: VIVESTBodyBackProps) {
  return (
    <View style={styles.container}>
      {/* Texto de Carencias */}
      <View style={styles.gracePeriodSection}>
        <Text
          style={styles.gracePeriodText}
          accessibilityLabel={`Carências: ${gracePeriodText}`}
          accessibilityRole="text"
        >
          {gracePeriodText}
        </Text>
      </View>

      {/* Secao ANS Operadora */}
      <View style={styles.ansSection}>
        <Text style={styles.ansLabel}>
          {contacts.passwordRelease.label.toUpperCase() || 'OPERADORA CONTRATADA'}
        </Text>
        <View style={styles.ansTag}>
          <Text
            style={styles.ansTagText}
            accessibilityLabel={`Número ANS da operadora: ${operatorAnsNumber}`}
          >
            {operatorAnsNumber}
          </Text>
        </View>
      </View>

      {/* Secao CNS */}
      <View style={styles.cnsSection}>
        <Text style={styles.cnsLabel}>Plano Regulamentado</Text>
        <Text style={styles.cnsNumber} accessibilityLabel={`Número CNS: ${cnsNumber}`}>
          CNS: {cnsNumber || '-'}
        </Text>
      </View>

      {/* Grid de Contatos */}
      <View style={styles.contactsContainer}>
        {/* Linha 1: Liberacao de Senha + Disque-Vivest */}
        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <View style={styles.contactHeader}>
              <PhoneIcon size={12} />
              <Text style={styles.contactLabel}>{contacts.passwordRelease.label}</Text>
            </View>
            {contacts.passwordRelease.phones.map((phone, index) => (
              <Text
                key={index}
                style={styles.contactValue}
                accessibilityLabel={`${contacts.passwordRelease.label}: ${phone}`}
              >
                {phone}
              </Text>
            ))}
          </View>
          <View style={styles.contactItem}>
            <View style={styles.contactHeader}>
              <PhoneIcon size={12} />
              <Text style={styles.contactLabel}>{contacts.disqueVivest.label}</Text>
            </View>
            {contacts.disqueVivest.phones.map((phone, index) => (
              <Text
                key={index}
                style={styles.contactValue}
                accessibilityLabel={`${contacts.disqueVivest.label}: ${phone}`}
              >
                {phone}
              </Text>
            ))}
          </View>
        </View>

        {/* Linha 2: ANS + Websites */}
        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <View style={styles.contactHeader}>
              <PhoneIcon size={12} />
              <Text style={styles.contactLabel}>{contacts.ans.label}</Text>
            </View>
            <Text
              style={styles.contactValue}
              accessibilityLabel={`Telefone ANS: ${contacts.ans.phone}`}
            >
              {contacts.ans.phone}
            </Text>
          </View>
          <View style={styles.contactItem}>
            <View style={styles.contactHeader}>
              <GlobeIcon size={12} />
              <Text style={styles.contactLabel}>Sites</Text>
            </View>
            <Text
              style={styles.contactValue}
              accessibilityLabel={`Site Vivest: ${contacts.websites.vivest}`}
            >
              {contacts.websites.vivest}
            </Text>
            <Text
              style={styles.contactValue}
              accessibilityLabel={`Site ANS: ${contacts.websites.ans}`}
            >
              {contacts.websites.ans}
            </Text>
          </View>
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

  // Carencias
  gracePeriodSection: {
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  gracePeriodText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    color: VIVEST_COLORS.text,
    textAlign: 'center',
  },

  // ANS Operadora
  ansSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  ansLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: VIVEST_COLORS.textMuted,
    flex: 1,
  },
  ansTag: {
    backgroundColor: VIVEST_COLORS.tagBackground,
    borderRadius: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  ansTagText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: VIVEST_COLORS.text,
  },

  // CNS
  cnsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  cnsLabel: {
    fontSize: Typography.sizes.caption,
    color: VIVEST_COLORS.textMuted,
  },
  cnsNumber: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: VIVEST_COLORS.text,
  },

  // Contatos
  contactsContainer: {
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  contactItem: {
    flex: 1,
    paddingRight: Spacing.xs,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.medium,
    color: VIVEST_COLORS.textMuted,
    marginLeft: 4,
  },
  contactValue: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: VIVEST_COLORS.text,
    marginLeft: 18,
  },
});

export default VIVESTBodyBack;
