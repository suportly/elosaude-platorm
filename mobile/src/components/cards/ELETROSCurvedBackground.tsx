/**
 * ELETROSCurvedBackground - Fundo curvo SVG para o header da carteirinha
 *
 * Cria um header azul com curva ondulada assimetrica na borda inferior,
 * similar ao design original da Eletros-Saude:
 * - Curva desce mais no lado esquerdo
 * - Sobe levemente no lado direito
 * - Gradiente horizontal de azul-petroleo escuro para claro
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import type { ELETROSCurvedBackgroundProps } from '../../types/eletros';
import { ELETROS_COLORS } from '../../types/eletros';

export function ELETROSCurvedBackground({ width, height }: ELETROSCurvedBackgroundProps) {
  // Header ocupa ~30% da altura do cartao
  const headerBaseHeight = height * 0.3;

  // Pontos da curva ondulada (assimetrica)
  // Lado direito: curva comeca mais alta
  const rightY = headerBaseHeight * 0.75;
  // Lado esquerdo: curva termina mais baixa
  const leftY = headerBaseHeight * 1.05;

  // Pontos de controle para curva cubica (bezier)
  // Controle 1: puxa a curva para baixo no centro-direita
  const control1X = width * 0.65;
  const control1Y = headerBaseHeight * 1.25;
  // Controle 2: puxa a curva para baixo no centro-esquerda
  const control2X = width * 0.35;
  const control2Y = headerBaseHeight * 1.35;

  // Path SVG com curva cubica bezier
  // M0,0 = inicio no canto superior esquerdo
  // L{width},0 = linha para canto superior direito
  // L{width},{rightY} = linha para baixo no lado direito
  // C{c1X},{c1Y} {c2X},{c2Y} 0,{leftY} = curva cubica para lado esquerdo
  // Z = fecha o path
  const pathD = `
    M0,0
    L${width},0
    L${width},${rightY}
    C${control1X},${control1Y} ${control2X},${control2Y} 0,${leftY}
    Z
  `;

  return (
    <Svg width={width} height={headerBaseHeight * 1.4} style={styles.container}>
      <Defs>
        <LinearGradient id="headerGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={ELETROS_COLORS.headerBlueStart} />
          <Stop offset="1" stopColor={ELETROS_COLORS.headerGreenEnd} />
        </LinearGradient>
      </Defs>
      <Path d={pathD} fill="url(#headerGradient)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default ELETROSCurvedBackground;
