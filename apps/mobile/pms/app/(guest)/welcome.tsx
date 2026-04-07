import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { VectorHeader } from '../../components/ui/VectorHeader';
import { typography } from '../../constants/tokens';
import { useSettingsStore } from '../../store/settingsStore';
import { LanguageToggle } from '../../components/ui/LanguageToggle';

// Design canvas (Figma)
const DW = 393;  // design width
const DH = 852;  // design height

// ─── Continue button ──────────────────────────────────────────────────────────
function ContinueButton({ onPress }: { onPress: () => void }) {
  const isFr = useSettingsStore((s) => s.language === 'FR');
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.continueBtn}>
      <Text style={styles.continueBtnLabel}>{isFr ? 'Continuer' : 'Continue'}</Text>

      <View style={styles.arrowGroup}>
        <Svg width={46} height={36} viewBox="78 0 46 36" fill="none" style={{ position: 'absolute', right: 0, top: 0 }}>
          <Path
            d="M78.4 19.1278C78.4 18.5087 78.9029 18.0057 79.522 18.0057H88V20.25H79.522C78.9029 20.25 78.4 19.7471 78.4 19.1278Z"
            fill="#FF8383"
          />
          <Circle cx="106" cy="18" r="18" fill="#FF8383" />
          <Path d="M113.2 18H89.2" stroke="white" strokeWidth="2.25564" strokeLinecap="square" />
          <Path
            d="M109 13C114 15.6 114 18 114 18C114 18 114 20.4 109 23"
            stroke="white"
            strokeWidth="2.25564"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function WelcomeScreen() {
  const isFr = useSettingsStore((s) => s.language === 'FR');
  const { width, height } = useWindowDimensions();
  const sx = width / DW;          // horizontal scale
  const sy = height / DH;         // vertical scale (respects actual device height)
  const s  = Math.min(sx, sy);    // uniform scale — keeps proportions intact

  // Scaled position helper
  const p = (x: number, y: number) => ({ left: x * sx, top: y * sy });

  return (
    <View style={[styles.container, { width, height }]}>
      {/* ── Coral blob header ─────────────────────────────────────────────── */}
      <VectorHeader />

      {/* ── Welcome title  (left:24, top:575) ─────────────────────────────── */}
      <Text style={[styles.title, p(24, 575)]}>{isFr ? 'Bienvenue' : 'Welcome'}</Text>

      {/* ── Subtitle  (left:24, top:635, w:309) ───────────────────────────── */}
      <Text style={[styles.subtitle, p(24, 635), { width: 309 * sx }]}>
        {isFr 
          ? 'Bienvenue à Hotel Le Baobab.\nAccédez à tous nos services directement depuis votre chambre.'
          : 'Welcome to Hotel Le Baobab.\nAccess all our services directly from your room.'}
      </Text>

      {/* ── Continue button frame  (left:245, top:760) ────────────────────── */}
      <View style={[styles.continueBtnWrap, p(245, 760)]}>
        <ContinueButton onPress={() => router.push('/(guest)/login')} />
      </View>

      {/* Language Toggle mounted above the home indicator */}
      <LanguageToggle />

      {/* ── Home indicator  (bottom:0, height:34) ─────────────────────────── */}
      <Svg
        width={width}
        height={34 * sy}
        viewBox="0 0 393 34"
        style={styles.homeIndicator}
      >
        {/* pill: width 134, height 5, bottom 8, centered at 50%+0.5 */}
        <Rect x={130} y={21} width={134} height={5} rx={2.5} fill="#212121" />
      </Svg>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFCFC',
    overflow: 'hidden',
  },

  title: {
    position: 'absolute',
    fontFamily: typography.rubikSemiBold,
    fontSize: 40,
    lineHeight: 44,          // 110%
    color: '#424242',
  },

  subtitle: {
    position: 'absolute',
    fontFamily: typography.rubikMedium,
    fontSize: 14,
    lineHeight: 14 * 1.4,    // 140%
    letterSpacing: 0.2,
    color: '#BDBDBD',
  },

  continueBtnWrap: {
    position: 'absolute',
  },

  continueBtn: {
    width: 124,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },

  continueBtnLabel: {
    width: 64,
    height: 20,
    fontFamily: typography.rubikMedium,
    fontSize: 14,
    lineHeight: 14 * 1.4,
    letterSpacing: 0.2,
    color: '#9E9E9E',
  },

  arrowGroup: {
    width: 36,
    height: 36,
  },

  homeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
