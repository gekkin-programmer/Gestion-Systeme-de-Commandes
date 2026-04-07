import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../constants/tokens';

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost' | 'gradient';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  size = 'md',
  style,
  textStyle,
  disabled,
  ...rest
}: ButtonProps) {
  const sizeStyle = sizeStyles[size];

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        {...rest}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={[colors.cherryRose, colors.royalPlum, colors.pacificCyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, sizeStyle.container, styles.gradientInner, disabled && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.text, styles.primaryText, sizeStyle.text, textStyle]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      {...rest}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        sizeStyle.container,
        variantStyles[variant].container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            sizeStyle.text,
            variantStyles[variant].text,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  fullWidth: { width: '100%' },
  gradientInner: { width: '100%' },
  disabled: { opacity: 0.4 },
  text: {
    fontFamily: typography.fontSemiBold,
    letterSpacing: 0.5,
  },
  primaryText: { color: '#fff' },
});

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: '#fff' },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    text: { color: colors.primary },
  },
  danger: {
    container: { backgroundColor: colors.dangerMuted, borderWidth: 1, borderColor: colors.danger },
    text: { color: colors.danger },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.textSecondary },
  },
  gradient: {
    container: {},
    text: { color: '#fff' },
  },
};

const sizeStyles: Record<
  'sm' | 'md' | 'lg',
  { container: ViewStyle; text: TextStyle }
> = {
  sm: {
    container: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
    text: { fontSize: typography.size.sm },
  },
  md: {
    container: { paddingVertical: 14, paddingHorizontal: spacing.lg },
    text: { fontSize: typography.size.md },
  },
  lg: {
    container: { paddingVertical: 18, paddingHorizontal: spacing.xl },
    text: { fontSize: typography.size.base },
  },
};
