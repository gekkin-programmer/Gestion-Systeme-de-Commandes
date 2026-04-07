import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/tokens';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  rightIcon?: React.ReactNode;
  /** Phone-style large display (for OTP-adjacent fields) */
  prominent?: boolean;
}

export function Input({
  label,
  error,
  containerStyle,
  rightIcon,
  prominent,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label.toUpperCase()}</Text>
      )}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          prominent && styles.inputProminent,
        ]}
      >
        <TextInput
          placeholderTextColor={colors.textDim}
          style={[
            styles.input,
            prominent && styles.inputTextProminent,
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: typography.fontLabel,
    fontSize: typography.size.xs,
    color: colors.textDim,
    letterSpacing: typography.tracking.widest,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputProminent: {
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 2,
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    paddingHorizontal: 0,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: typography.fontBody,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  inputTextProminent: {
    fontSize: typography.size.xl,
    fontFamily: typography.fontSemiBold,
    letterSpacing: 2,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  error: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.xs,
    color: colors.danger,
  },
});
