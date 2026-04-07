import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/ui/Screen';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { authApi } from '../../lib/api';
import { colors, typography, spacing } from '../../constants/tokens';

const OTP_LENGTH = 6;

export default function GuestOtpScreen() {
  const { phone, roomNumber, hotelSlug, devOtp } = useLocalSearchParams<{
    phone: string;
    roomNumber: string;
    hotelSlug: string;
    devOtp: string;
  }>();

  // session is set by room-code screen after stay is created

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error,  setError]  = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-fill dev OTP if provided
  useEffect(() => {
    if (devOtp && devOtp.length === OTP_LENGTH) {
      const arr = devOtp.split('');
      setDigits(arr);
      verify(arr.join(''));
    }
  }, [devOtp]);

  const handleDigit = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...digits];
    updated[index] = digit;
    setDigits(updated);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (updated.every(Boolean)) {
      verify(updated.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verify = async (code: string) => {
    if (code.length !== OTP_LENGTH) return;
    setLoading(true);
    setError('');
    try {
      await authApi.verifyGuestOtp(phone, code, parseInt(roomNumber), hotelSlug);
      // OTP only proves phone ownership — room-code screen handles the actual check-in
      router.replace({
        pathname: '/(guest)/room-code',
        params: { phone, roomNumber },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Code incorrect. Réessayez.';
      setError(msg);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await authApi.requestGuestOtp(phone, parseInt(roomNumber), hotelSlug);
      setCountdown(60);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch { /* silent */ } finally {
      setResending(false);
    }
  };

  const maskedPhone = phone.length > 4
    ? phone.slice(0, phone.length - 4).replace(/\d/g, '•') + phone.slice(-4)
    : phone;

  return (
    <Screen noPadding>
      <LinearGradient
        colors={['#b7094c', '#723c70', '#0091ad']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.band}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>

          <View style={styles.top}>
            <SectionLabel primary>Vérification</SectionLabel>
            <Text style={styles.headline}>Code envoyé.</Text>
            <Text style={styles.sub}>
              Entrez le code à 6 chiffres envoyé au{'\n'}
              <Text style={styles.phone}>{maskedPhone}</Text>
            </Text>
            <Text style={styles.sub2}>Chambre {roomNumber}</Text>
          </View>

          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputRefs.current[i] = ref; }}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                value={digit}
                onChangeText={(t) => handleDigit(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={i === 0}
                editable={!loading}
              />
            ))}
          </View>

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Vérification…</Text>
            </View>
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}

          {/* Resend */}
          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>
                Renvoyer le code dans {countdown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text style={styles.resendText}>
                  {resending ? 'Envoi…' : 'Renvoyer le code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>← Modifier le numéro</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  band:    { height: 6 },
  content: { flex: 1, padding: spacing.lg },
  top:     { marginTop: spacing.xxl, gap: 10, marginBottom: spacing.xxl },
  headline: {
    fontFamily: typography.fontDisplay,
    fontSize: 36,
    color: colors.textPrimary,
    marginTop: 8,
  },
  sub: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sub2: {
    fontFamily: typography.fontLabel,
    fontSize: typography.size.sm,
    color: colors.secondary,
    letterSpacing: 1,
  },
  phone: {
    fontFamily: typography.fontSemiBold,
    color: colors.textPrimary,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: spacing.xl,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 0.85,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontFamily: typography.fontDisplay,
    fontSize: typography.size.xxl,
    color: colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceRaised,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.md,
  },
  loadingText: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  error: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.sm,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  resendRow: { alignItems: 'center', marginTop: spacing.md },
  countdownText: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.sm,
    color: colors.textDim,
  },
  resendText: {
    fontFamily: typography.fontLabel,
    fontSize: typography.size.sm,
    color: colors.secondary,
  },
  backLink:     { marginTop: spacing.xl, alignItems: 'center' },
  backLinkText: {
    fontFamily: typography.fontLabel,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
});
