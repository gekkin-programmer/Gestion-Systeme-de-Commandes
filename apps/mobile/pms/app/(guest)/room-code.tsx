import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { stayApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, radius, shadows } from '../../constants/tokens';

const CODE_LENGTH = 6;

export default function RoomCodeScreen() {
  const { phone, roomNumber } = useLocalSearchParams<{
    phone: string;
    roomNumber: string;
  }>();

  const setGuestSession = useAuthStore((s) => s.setGuestSession);

  const [chars,   setChars]   = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Shake animation for wrong code
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChar = (text: string, index: number) => {
    // Uppercase, letters + digits only
    const char = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(-1);
    const updated = [...chars];
    updated[index] = char;
    setChars(updated);
    setError('');

    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (updated.every(Boolean)) {
      submit(updated.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !chars[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submit = async (code: string) => {
    if (code.length !== CODE_LENGTH) return;
    setLoading(true);
    setError('');
    try {
      const res = await stayApi.startStay(code, phone);
      const stay = res.data.data;
      setGuestSession({
        stayToken:  stay.stayToken,
        roomId:     stay.roomId,
        hotelId:    stay.room.hotelId,
        roomNumber: stay.room.roomNumber,
        phone,
      });
      router.replace(`/(guest)/${stay.stayToken}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Code invalide. Vérifiez et réessayez.';
      setError(msg);
      setChars(Array(CODE_LENGTH).fill(''));
      shake();
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const code = chars.join('');
    if (code.length === CODE_LENGTH) submit(code);
  };

  const isComplete = chars.every(Boolean);

  return (
    <Screen noPadding>
      {/* Top gradient band — matches OTP screen */}
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
            <SectionLabel primary>Accès à la chambre</SectionLabel>
            <Text style={styles.headline}>Code d'accès.</Text>
            <Text style={styles.sub}>
              Entrez le code à 6 caractères{'\n'}
              affiché sur la carte de bienvenue{'\n'}
              de votre chambre{roomNumber ? ` (Chambre ${roomNumber})` : ''}.
            </Text>
          </View>

          {/* ── Code boxes ── */}
          <Animated.View
            style={[styles.codeRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {chars.map((char, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputRefs.current[i] = ref; }}
                style={[
                  styles.codeBox,
                  char        ? styles.codeBoxFilled  : null,
                  loading     ? styles.codeBoxDisabled : null,
                ]}
                value={char}
                onChangeText={(t) => handleChar(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                autoCapitalize="characters"
                maxLength={1}
                selectTextOnFocus
                autoFocus={i === 0}
                editable={!loading}
              />
            ))}
          </Animated.View>

          {/* ── Loading indicator ── */}
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Vérification…</Text>
            </View>
          )}

          {/* ── Error message ── */}
          {!!error && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── Confirm button ── */}
          <TouchableOpacity
            style={[styles.btn, (!isComplete || loading) && styles.btnDisabled]}
            onPress={handleConfirm}
            disabled={!isComplete || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : (
                <View style={styles.btnInner}>
                  <Text style={styles.btnText}>Accéder à ma chambre</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.white} />
                </View>
              )
            }
          </TouchableOpacity>

          {/* ── Help hint ── */}
          <View style={styles.hintRow}>
            <Ionicons name="information-circle-outline" size={14} color={colors.textDim} />
            <Text style={styles.hintText}>
              Le code se trouve sur la carte remise à la réception.
            </Text>
          </View>

          {/* ── Back link ── */}
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>← Retour</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  band: { height: 6 },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  top: {
    marginTop: spacing.xxl,
    gap: 10,
    marginBottom: spacing.xl,
  },
  headline: {
    fontFamily: typography.fontDisplay,
    fontSize: typography.size.display,
    color: colors.textPrimary,
    marginTop: 8,
  },
  sub: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // ── Code boxes ────────────────────────────────────────────────────────────
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: spacing.xl,
  },
  codeBox: {
    flex: 1,
    aspectRatio: 0.85,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontFamily: typography.fontDisplay,
    fontSize: typography.size.xl,
    color: colors.textPrimary,
    letterSpacing: 1,
    ...shadows.soft,
  },
  codeBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.dangerMuted,
  },
  codeBoxDisabled: {
    opacity: 0.5,
  },

  // ── Loading ───────────────────────────────────────────────────────────────
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  loadingText: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },

  // ── Error ─────────────────────────────────────────────────────────────────
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
    backgroundColor: colors.dangerMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  errorText: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.sm,
    color: colors.danger,
    flex: 1,
  },

  // ── Button ────────────────────────────────────────────────────────────────
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.cardGlow,
  },
  btnDisabled: {
    backgroundColor: colors.silver,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnText: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.size.base,
    color: colors.white,
    letterSpacing: 0.3,
  },

  // ── Hint ──────────────────────────────────────────────────────────────────
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: spacing.xl,
  },
  hintText: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.xs,
    color: colors.textDim,
    flex: 1,
    lineHeight: 16,
  },

  // ── Back ──────────────────────────────────────────────────────────────────
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    fontFamily: typography.fontLabel,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
});
