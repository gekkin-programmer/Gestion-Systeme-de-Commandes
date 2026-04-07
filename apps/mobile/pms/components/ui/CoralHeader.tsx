import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../constants/tokens';

const { width } = Dimensions.get('window');

// Approximates the topographic contour lines from the mockup
const TOPO_LINES = [
  { w: 150, h: 110, top: -10, left: -30, rx: 75 },
  { w: 220, h: 155, top:  50, left: -50, rx: 90 },
  { w: 170, h: 125, top:  15, left:  90, rx: 85 },
  { w: 260, h: 180, top: 110, left: -60, rx: 110 },
  { w: 200, h: 140, top: 140, left:  80, rx: 95 },
  { w: 240, h: 165, top:  75, left: 130, rx: 100 },
  { w: 140, h:  95, top: 210, left: 170, rx: 70 },
  { w: 280, h: 190, top: 170, left: -30, rx: 120 },
  { w: 180, h: 120, top:  30, left: 200, rx: 80 },
  { w: 320, h: 220, top: 220, left: -80, rx: 140 },
];

interface CoralHeaderProps {
  height: number;
  children?: React.ReactNode;
}

export function CoralHeader({ height, children }: CoralHeaderProps) {
  return (
    <View style={[styles.header, { height }]}>
      {/* Topo contour lines */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {TOPO_LINES.map((l, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: l.w,
              height: l.h,
              borderRadius: l.rx,
              borderWidth: 1.2,
              borderColor: 'rgba(255,255,255,0.22)',
              top: l.top,
              left: l.left,
            }}
          />
        ))}
      </View>

      {children}

      {/* Wave bottom edge — white rounded panel sits over the coral */}
      <View style={[styles.wave, { width: width + 40 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.orange,
    width: '100%',
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    bottom: -46,
    left: -20,
    height: 90,
    backgroundColor: colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
});
