import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from '../../constants/tokens';

interface SectionLabelProps {
  children: string;
  style?: TextStyle;
  /** Highlight with primary color instead of dim */
  primary?: boolean;
}

export function SectionLabel({ children, style, primary }: SectionLabelProps) {
  return (
    <Text
      style={[
        styles.label,
        primary ? styles.primaryColor : styles.dimColor,
        style,
      ]}
    >
      {children.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: typography.fontLabel,
    fontSize: typography.size.xs,
    letterSpacing: typography.tracking.widest,
  },
  dimColor: { color: colors.textDim },
  primaryColor: { color: colors.primary },
});
