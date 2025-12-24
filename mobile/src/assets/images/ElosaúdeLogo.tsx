/**
 * ElosaúdeLogo - Logo da EloSaude para carteirinha
 *
 * Usa o logo PNG oficial da aplicação
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface ElosaúdeLogoProps {
  width?: number;
  height?: number;
}

export function ElosaúdeLogo({
  width = 120,
  height = 35,
}: ElosaúdeLogoProps) {
  return (
    <View style={styles.container} accessibilityLabel="Logo EloSaude">
      <Image
        source={require('../../../assets/images/elosaude_logo.png')}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
});

export default ElosaúdeLogo;
