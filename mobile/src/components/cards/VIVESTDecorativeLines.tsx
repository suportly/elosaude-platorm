/**
 * VIVESTDecorativeLines - Anéis entrelaçados decorativos para carteirinha Vivest
 *
 * Baseado nos anéis entrelaçados do logo oficial Vivest
 * Formato de cartão (retângulo arredondado) posicionado no canto com corte parcial
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import type { VIVESTDecorativeLinesProps } from '../../types/vivest';
import { VIVEST_COLORS } from '../../types/vivest';

export function VIVESTDecorativeLines({ position, width, height }: VIVESTDecorativeLinesProps) {
  // Tamanho dos cartões/anéis
  const cardWidth = width * 0.45;
  const cardHeight = cardWidth * 0.65; // Proporção cartão de crédito
  const borderRadius = 8;
  const strokeWidth = 7;

  // Container maior para permitir overflow
  const svgWidth = cardWidth * 1.5;
  const svgHeight = cardHeight * 1.8;

  // Offset para posicionar parcialmente fora da borda
  const offsetX = cardWidth * 0.4;
  const offsetY = cardHeight * 0.3;

  if (position === 'top-right') {
    return (
      <View style={[styles.container, styles.topRight]} pointerEvents="none">
        <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* Cartão 1 - branco/transparente - mais para fora */}
          <Rect
            x={offsetX + cardWidth * -0.03}
            y={-offsetY + 50}
            width={cardWidth}
            height={cardHeight}
            rx={borderRadius}
            ry={borderRadius}
            fill="none"
            stroke={VIVEST_COLORS.text}
            strokeWidth={strokeWidth}
            opacity={0.6}
            transform={`rotate(-25 ${offsetX + cardWidth * 0.25} ${cardHeight * 0.9 - offsetY})`}
          />
          {/* Cartão 2 - vermelho/accent - entrelaçado */}
          <Rect
            x={offsetX - cardWidth * -0.6}
            y={offsetY * 1.9}
            width={cardWidth}
            height={cardHeight}
            rx={borderRadius}
            ry={borderRadius}
            fill="none"
            stroke={VIVEST_COLORS.accent}
            strokeWidth={strokeWidth}
            opacity={0.6}
            transform={`rotate(+25 ${offsetX + cardWidth * 0.4} ${
              cardHeight * 0.5 + offsetY * 0.5
            })`}
          />
        </Svg>
      </View>
    );
  }

  // bottom-right
  return (
    <View style={[styles.container, styles.bottomRight]} pointerEvents="none">
      <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {/* Cartão 1 - branco/transparente */}
        <Rect
          x={offsetX + cardWidth * 0.15}
          y={svgHeight - cardHeight + offsetY}
          width={cardWidth}
          height={cardHeight}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={VIVEST_COLORS.text}
          strokeWidth={strokeWidth}
          opacity={0.6}
          transform={`rotate(25 ${offsetX + cardWidth * 0.65} ${
            svgHeight - cardHeight * 0.5 + offsetY
          })`}
        />
        {/* Cartão 2 - vermelho/accent - entrelaçado */}
        <Rect
          x={offsetX - cardWidth * -0.2}
          y={svgHeight - cardHeight - offsetY * 1.2}
          width={cardWidth}
          height={cardHeight}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={VIVEST_COLORS.accent}
          strokeWidth={strokeWidth}
          opacity={0.6}
          transform={`rotate(-25 ${offsetX + cardWidth * 0.4} ${
            svgHeight - cardHeight * 0.5 - offsetY * 0.5
          })`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'visible', // Permite que os cartões saiam parcialmente
  },
  topRight: {
    top: -10,
    right: -15,
  },
  bottomRight: {
    bottom: -10,
    right: -15,
  },
});

export default VIVESTDecorativeLines;
