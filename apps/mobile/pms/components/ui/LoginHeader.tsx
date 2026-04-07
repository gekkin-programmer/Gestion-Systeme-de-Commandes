import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, ClipPath, Image as SvgImage } from 'react-native-svg';

const DESIGN_W = 393;
const DESIGN_H = 495;

// Blob path from Figma — extends to y=-132 (outside viewBox, clips naturally)
const BLOB =
  'M91.7334 317.798C55.8933 313.667 0 328.727 0 328.727V-132H393V396.599C393 396.599 370.542 407.525 355.404 411.554C322.986 420.185 302.62 420.112 270.188 411.554C226.572 400.046 210 370 171.436 344.832C143.64 326.692 124.385 321.562 91.7334 317.798Z';

export function LoginHeader() {
  const { width } = useWindowDimensions();
  const scale  = width / DESIGN_W;
  // Reduce height so it doesn't look compacted against the form
  const height = DESIGN_H * scale * 0.75;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height,
        // Layered pink drop shadow (approximated from Figma filter)
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
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Defs>
          <ClipPath id="loginBlobClip">
            <Path d={BLOB} />
          </ClipPath>
        </Defs>

        {/* Solid coral fill */}
        <Path d={BLOB} fill="#FF8383" />

        {/* Topo texture overlay at 20% opacity, clipped to blob */}
        <SvgImage
          href={require('../../assets/images/typosvg.jpg')}
          x={0}
          y={0}
          width={DESIGN_W}
          height={DESIGN_H}
          preserveAspectRatio="xMidYMid slice"
          opacity={0.2}
          clipPath="url(#loginBlobClip)"
        />
      </Svg>
    </View>
  );
}
