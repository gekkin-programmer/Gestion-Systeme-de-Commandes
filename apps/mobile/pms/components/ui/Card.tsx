import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../../constants/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Show gradient top accent bar */
  accent?: boolean;
  padded?: boolean;
}

export function Card({ children, style, accent = false, padded = true }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {accent && (
        <LinearGradient
          colors={[colors.cherryRose, colors.royalPlum, colors.pacificCyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentBar}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  padded: {
    padding: spacing.md,
  },
  accentBar: {
    height: 2,
    width: '100%',
  },
});
