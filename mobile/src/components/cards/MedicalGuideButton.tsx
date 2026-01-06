import React from 'react';
import { TouchableOpacity, StyleSheet, Linking, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { OperatorType } from '../../types/medicalGuide';
import { getMedicalGuideConfig } from '../../config/medicalGuides';

interface MedicalGuideButtonProps {
  operator: OperatorType;
  compact?: boolean;
}

export const MedicalGuideButton: React.FC<MedicalGuideButtonProps> = ({
  operator,
  compact = false,
}) => {
  const config = getMedicalGuideConfig(operator);

  if (!config) {
    return null;
  }

  const handlePress = async () => {
    const canOpen = await Linking.canOpenURL(config.url);
    if (canOpen) {
      await Linking.openURL(config.url);
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, { backgroundColor: config.color }]}
        onPress={handlePress}
        accessibilityLabel={`Abrir Guia Médico ${config.name}`}
        accessibilityRole="link"
        accessibilityHint="Abre o portal de rede credenciada no navegador"
      >
        <Icon name="hospital-building" size={16} color="#FFFFFF" />
        <Text style={styles.compactText}>Guia Médico</Text>
        <Icon name="open-in-new" size={14} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: config.color }]}
      onPress={handlePress}
      accessibilityLabel={`Abrir Guia Médico ${config.name}`}
      accessibilityRole="link"
      accessibilityHint="Abre o portal de rede credenciada no navegador"
    >
      <View style={styles.iconContainer}>
        <Icon name="hospital-building" size={20} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Rede Credenciada</Text>
        <Text style={styles.sublabel}>Guia Médico {config.name}</Text>
      </View>
      <Icon name="open-in-new" size={18} color="#FFFFFF" style={styles.externalIcon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sublabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  externalIcon: {
    opacity: 0.8,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  compactText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MedicalGuideButton;
