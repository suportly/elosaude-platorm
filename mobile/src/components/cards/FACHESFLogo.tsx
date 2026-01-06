/**
 * FACHESFLogo - Logo da Fachesf Saude
 *
 * Usa imagem local do logo Fachesf.
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const logoImage = require('../../../assets/images/LogoFachesf.png');

interface FACHESFLogoProps {
  /** Largura do logo */
  width?: number;
  /** Altura do logo */
  height?: number;
}

export function FACHESFLogo({ width = 80, height = 40 }: FACHESFLogoProps) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={logoImage}
        style={[styles.logo, { width, height }]}
        resizeMode="contain"
        accessibilityLabel="Logo Fachesf Saude"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    // Logo com fundo branco, sem necessidade de ajustes
  },
});

export default FACHESFLogo;
