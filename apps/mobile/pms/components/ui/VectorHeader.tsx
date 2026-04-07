import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, ClipPath, Image as SvgImage } from 'react-native-svg';

const DESIGN_W = 393;
const DESIGN_H = 627;

const BLOB = "M91.7334 449.798C55.8933 445.667 0 460.727 0 460.727V0H393V528.599C393 528.599 370.542 539.525 355.404 543.554C322.986 552.185 302.62 552.112 270.188 543.554C226.572 532.046 210 502 171.436 476.832C143.64 458.692 124.385 453.562 91.7334 449.798Z";

interface VectorHeaderProps {
  children?: React.ReactNode;
}

export function VectorHeader({ children }: VectorHeaderProps) {
  const { width } = useWindowDimensions();
  const scale  = width / DESIGN_W;
  const height = DESIGN_H * scale;

  return (
    <View
      style={{
        width,
        height,
        // Layered pink drop shadow (approximated from Figma 4-layer filter)
        shadowColor: '#FFCCCC',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.05,
        shadowRadius: 22,
        elevation: 6,
      }}
    >
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Defs>
          <ClipPath id="welcomeBlobClip">
            <Path d={BLOB} />
          </ClipPath>
        </Defs>

        {/* Main coral blob */}
        <Path d={BLOB} fill="#FF8383" />

        {/* Topo pattern — typosvg.jpg clipped to blob at 20% opacity */}
        <SvgImage
          href={require('../../assets/images/typosvg.jpg')}
          x={0}
          y={0}
          width={DESIGN_W}
          height={DESIGN_H}
          preserveAspectRatio="xMidYMid slice"
          opacity={0.2}
          clipPath="url(#welcomeBlobClip)"
        />
      </Svg>

      {children}
    </View>
  );
}
