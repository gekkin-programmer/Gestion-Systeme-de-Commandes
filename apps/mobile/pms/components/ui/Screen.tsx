import React from 'react';
import { View, ViewStyle, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { colors } from '../../constants/tokens';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Don't add horizontal padding (full-bleed layouts) */
  noPadding?: boolean;
  /** Transparent bg for gradient screens */
  transparent?: boolean;
}

export function Screen({ children, style, noPadding, transparent }: ScreenProps) {
  return (
    <SafeAreaView
      style={[styles.safe, transparent && { backgroundColor: 'transparent' }]}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={[styles.container, !noPadding && styles.padded, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  padded: {
    paddingHorizontal: 20,
  },
});
