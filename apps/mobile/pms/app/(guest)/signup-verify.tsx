import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { authApi } from '../../lib/api';
import { colors, typography, spacing } from '../../constants/tokens';

const OTP_LENGTH = 6;

export default function SignupVerifyScreen() {
  const { phone, devOtp } = useLocalSearchParams<{
    phone: string;
    devOtp: string;
  }>();

  const [digits,    setDigits]    = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [success,   setSuccess]   = useState(false);

  // Rate-limit state — populated from 429 response
  const [rateLimited,    setRateLimited]    = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);

  // Resend cooldown (60s between manual resends)
  const [resendCountdown, setResendCountdown] = useState(60);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  // Rate-limit countdown timer
  useEffect(() => {
    if (retryCountdown <= 0) {
      if (rateLimited) setRateLimited(false);
      return;
    }
    const t = setTimeout(() => setRetryCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [retryCountdown, rateLimited]);

  // Auto-fill dev OTP
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
    setError('');

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
      await authApi.signupVerify(phone, code);
      setSuccess(true);
      // Brief success pause, then redirect to login
      setTimeout(() => {
        router.replace('/(guest)/login');
      }, 1500);
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
    if (resendCountdown > 0 || rateLimited || resending) return;
    setResending(true);
    setError('');
    try {
      // We don't have the password here — we call a re-send endpoint.
      // The backend will reject if the rate limit (2/15min) is exceeded.
      // Note: signupRequestOtp requires password too; use a dedicated resend or pass password.
      // Since we don't store the password client-side, we redirect back to signup.
      router.replace('/(guest)/signup');
    } catch { /* silent */ } finally {
      setResending(false);
    }
  };

  const maskedPhone = phone?.length > 4
    ? phone.slice(0, phone.length - 4).replace(/\d/g, '•') + phone.slice(-4)
    : phone;

  // ── Success state ────────────────────────────────────────────────────────
  if (success) {
    return (
      <Screen>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Compte créé !</Text>
          <Text style={styles.successSub}>Redirection vers la connexion…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      {/* Gradient band — same as OTP/room-code screens */}
      <LinearGradient
        colors={['#b7094c', '#723c70', '#0091ad']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.band}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>

          {/* ── Header ── */}
          <View style={styles.top}>
            <SectionLabel primary>Vérification du numéro</SectionLabel>
            <Text style={styles.headline}>Code envoyé.</Text>
            <Text style={styles.sub}>
              Entrez le code à 6 chiffres envoyé au{'\n'}
              <Text style={styles.phone}>{maskedPhone}</Text>
            </Text>
          </View>

          {/* ── OTP boxes ── */}
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

          {/* ── Loading ── */}
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Vérification…</Text>
            </View>
          )}

          {/* ── Error ── */}
          {!!error && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── Rate-limit warning ── */}
          {rateLimited && retryCountdown > 0 && (
            <View style={styles.rateLimitRow}>
              <Ionicons name="time-outline" size={14} color={colors.statusProgress} />
              <Text style={styles.rateLimitText}>
                Limite atteinte. Vous pourrez renvoyer le code dans{' '}
                {Math.ceil(retryCountdown / 60)} min.
              </Text>
            </View>
          )}

          {/* ── Resend ── */}
          <View style={styles.resendRow}>
            {resendCountdown > 0 ? (
              <Text style={styles.countdownText}>
                Renvoyer dans {resendCountdown}s
              </Text>
            ) : rateLimited ? (
              <Text style={styles.rateLimitedText}>
                Renvoyer (limite atteinte)
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text style={styles.resendText}>
                  {resending ? 'Envoi…' : '← Modifier le numéro / renvoyer'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>← Retour</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  band:    { height: 6 },

  content: {
    flex: 1,
    padding: spacing.lg,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  top: {
    marginTop: spacing.xxl,
    gap: 10,
    marginBottom: spacing.xxl,
  },
  headline: {
    fontFamily: typography.fontDisplay,
    fontSize: 36,
    color: colors.textPrimary,
    marginTop: 8,
  },
  sub: {
    fontFamily: typography.fontBody,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  phone: {
    fontFamily: typography.fontSemiBold,
    color: colors.textPrimary,
  },

  // ── OTP boxes ──────────────────────────────────────────────────────────────
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
    fontSize: 28,
    color: colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.dangerMuted,
  },

  // ── Loading ────────────────────────────────────────────────────────────────
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.md,
  },
  loadingText: {
    fontFamily: typography.fontBody,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // ── Error ──────────────────────────────────────────────────────────────────
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
    backgroundColor: colors.dangerMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  errorText: {
    fontFamily: typography.fontBody,
    fontSize: 12,
    color: colors.danger,
    flex: 1,
  },

  // ── Rate limit ─────────────────────────────────────────────────────────────
  rateLimitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255,136,0,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  rateLimitText: {
    fontFamily: typography.fontBody,
    fontSize: 12,
    color: colors.statusProgress,
    flex: 1,
  },

  // ── Resend ─────────────────────────────────────────────────────────────────
  resendRow: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  countdownText: {
    fontFamily: typography.fontBody,
    fontSize: 12,
    color: colors.textDim,
  },
  resendText: {
    fontFamily: typography.fontLabel,
    fontSize: 12,
    color: colors.secondary,
  },
  rateLimitedText: {
    fontFamily: typography.fontBody,
    fontSize: 12,
    color: colors.textDim,
  },

  // ── Back ───────────────────────────────────────────────────────────────────
  backLink: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  backLinkText: {
    fontFamily: typography.fontLabel,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // ── Success ────────────────────────────────────────────────────────────────
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.statusDone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: typography.fontDisplay,
    fontSize: 28,
    color: colors.textPrimary,
  },
  successSub: {
    fontFamily: typography.fontBody,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
