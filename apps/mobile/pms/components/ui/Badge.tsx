import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../../constants/tokens';

type BadgeVariant = 'pending' | 'progress' | 'done' | 'cancelled' | 'accent' | 'dim';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantMap: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  pending: {
    bg: 'rgba(183, 9, 76, 0.15)',
    border: colors.cherryRose,
    text: colors.cherryRose,
  },
  progress: {
    bg: 'rgba(23, 128, 161, 0.15)',
    border: colors.cerulean,
    text: colors.cerulean,
  },
  done: {
    bg: 'rgba(0, 145, 173, 0.15)',
    border: colors.pacificCyan,
    text: colors.pacificCyan,
  },
  cancelled: {
    bg: 'rgba(107, 96, 122, 0.15)',
    border: colors.textDim,
    text: colors.textDim,
  },
  accent: {
    bg: 'rgba(114, 60, 112, 0.2)',
    border: colors.velvetPurple,
    text: colors.velvetPurple,
  },
  dim: {
    bg: colors.surfaceRaised,
    border: colors.line,
    text: colors.textSecondary,
  },
};

export function Badge({ label, variant = 'dim', style }: BadgeProps) {
  const v = variantMap[variant];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: v.bg, borderColor: v.border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: v.text }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 0,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: typography.fontLabel,
    fontSize: typography.size.xs,
    letterSpacing: typography.tracking.wider,
  },
});
