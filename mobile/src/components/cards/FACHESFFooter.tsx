/**
 * FACHESFFooter - Rodape da carteirinha Fachesf
 *
 * Design:
 * - Linha divisoria cinza no topo
 * - Texto legal em italico
 * - Secao de contatos (CREDENCIADO, BENEFICIARIO)
 * - Logo Fachesf a direita
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spacing, Typography } from '../../config/theme';
import type { FACHESFFooterProps } from '../../types/fachesf';
import { FACHESF_COLORS } from '../../types/fachesf';
import { FACHESFLogo } from './FACHESFLogo';

interface ContactItemProps {
  label: string;
  phone: string;
}

function ContactItem({ label, phone }: ContactItemProps) {
  return (
    <View style={styles.contactItem}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactPhone}>{phone}</Text>
    </View>
  );
}

export function FACHESFFooter({ contactsTitle, contacts, legalText }: FACHESFFooterProps) {
  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.divider} />

      {/* Legal text */}
      <Text style={styles.legalText}>{legalText}</Text>

      <View style={styles.divider} />

      {/* Contacts and Logo row */}
      <View style={styles.contactsRow}>
        {/* Contacts section */}
        <View style={styles.contactsSection}>
          <Text style={styles.contactsTitle}>{contactsTitle}</Text>
          <View style={styles.contactsList}>
            <ContactItem label={contacts.credenciado.label} phone={contacts.credenciado.phone} />
            <ContactItem label={contacts.beneficiario.label} phone={contacts.beneficiario.phone} />
          </View>
        </View>

        {/* Logo on the right */}
        <View style={styles.logoContainer}>
          <FACHESFLogo width={90} height={65} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    backgroundColor: FACHESF_COLORS.cardBackground,
  },
  divider: {
    height: 1,
    backgroundColor: FACHESF_COLORS.divider,
    marginBottom: Spacing.sm,
  },
  legalText: {
    fontSize: Typography.sizes.caption - 1,
    fontStyle: 'italic',
    color: FACHESF_COLORS.textLabel,
    marginBottom: Spacing.sm,
    lineHeight: 14,
  },
  contactsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  contactsSection: {
    flex: 1,
  },
  contactsTitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: FACHESF_COLORS.textValue,
    marginBottom: Spacing.xs,
  },
  contactsList: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  contactItem: {
    marginRight: Spacing.md,
  },
  contactLabel: {
    fontSize: Typography.sizes.caption - 1,
    fontWeight: Typography.weights.bold,
    fontStyle: 'italic',
    color: FACHESF_COLORS.accent,
  },
  contactPhone: {
    fontSize: Typography.sizes.caption - 1,
    color: FACHESF_COLORS.textLabel,
  },
  logoContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginRight: 30,
  },
});

export default FACHESFFooter;
