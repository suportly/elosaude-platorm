/**
 * ELETROSLogo - Logo da Eletros-Saude usando imagem PNG
 *
 * Duas variantes:
 * - white: Logo branco para uso sobre fundo azul (header frente)
 * - colored: Logo colorido para uso sobre fundo branco (header verso)
 */

import React from 'react';
import { Image, StyleSheet } from 'react-native';
import type { ELETROSLogoProps } from '../../types/eletros';

const logoImage = require('../../../assets/images/LogoEletrosSaude.png');

export function ELETROSLogo({ variant, width = 140, height = 50 }: ELETROSLogoProps) {
  return (
    <Image
      source={logoImage}
      style={[styles.logo, { width, height }, variant === 'white' && styles.whiteLogo]}
      resizeMode="contain"
      accessibilityLabel="Logo Eletros-Saude"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    // Logo colorido (cores originais)
  },
  whiteLogo: {
    // Aplica tintColor branco para o header azul
    tintColor: '#FFFFFF',
  },
});

export default ELETROSLogo;
