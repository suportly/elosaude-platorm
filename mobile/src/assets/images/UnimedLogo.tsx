/**
 * Logo Unimed Santa Catarina
 * Uses the official PNG logo image
 */

import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface UnimedLogoProps {
  width?: number;
  height?: number;
  color?: string;
}

export function UnimedLogo({ width = 160, height = 45 }: UnimedLogoProps) {
  return (
    <Image
      source={require('./unimed-logo.png')}
      style={[styles.logo, { width, height }]}
      resizeMode="contain"
      accessibilityLabel="Logo Unimed Santa Catarina"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    // tintColor is not applied since we want the original colors
  },
});

export default UnimedLogo;
