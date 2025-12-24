/**
 * ANSLogo - Logo da ANS (Agência Nacional de Saúde Suplementar)
 *
 * Placeholder - substituir pelo SVG oficial quando disponível
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ANSLogoProps {
  width?: number;
  height?: number;
  color?: string;
}

export function ANSLogo({
  width = 50,
  height = 24,
  color = '#006633',
}: ANSLogoProps) {
  return (
    <View
      style={[styles.container, { width, height }]}
      accessibilityLabel="Logo ANS - Agência Nacional de Saúde Suplementar"
    >
      <Text style={[styles.text, { color }]}>ANS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#006633',
    borderRadius: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ANSLogo;
