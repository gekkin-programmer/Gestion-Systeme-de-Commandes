import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform, useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

const COUNTRIES = [
  { code: '🇨🇲', dialCode: '+237', name: 'Cameroon' },
  { code: '🇫🇷', dialCode: '+33', name: 'France' },
  { code: '🇺🇸', dialCode: '+1', name: 'USA' },
  { code: '🇨🇦', dialCode: '+1', name: 'Canada' },
  { code: '🇬🇧', dialCode: '+44', name: 'UK' },
  { code: '🇩🇪', dialCode: '+49', name: 'Germany' },
  { code: '🇮🇹', dialCode: '+39', name: 'Italy' },
  { code: '🇪🇸', dialCode: '+34', name: 'Spain' },
  { code: '🇨🇮', dialCode: '+225', name: "Côte d'Ivoire" },
  { code: '🇸🇳', dialCode: '+221', name: 'Senegal' },
  { code: '🇿🇦', dialCode: '+27', name: 'South Africa' },
  { code: '🇳🇬', dialCode: '+234', name: 'Nigeria' },
];
import { Ionicons } from '@expo/vector-icons';
import { LoginHeader } from '../../components/ui/LoginHeader';
import { authApi } from '../../lib/api';
import { colors, typography, spacing } from '../../constants/tokens';
import { useSettingsStore } from '../../store/settingsStore';
import { LanguageToggle } from '../../components/ui/LanguageToggle';

const DW = 393;
const DH = 852;

export default function GuestLoginScreen() {
  const isFr = useSettingsStore((s) => s.language === 'FR');
  const { width, height } = useWindowDimensions();
  // Safe uniform minimum scale so it always fits without overlapping
  const s = Math.min(width / DW, height / DH);
  
  const p = (x: number, y: number, w?: number, h?: number) => ({
    position: 'absolute' as const,
    left: x * s,
    top: y * s,
    ...(w ? { width: w * s } : {}),
    ...(h ? { height: h * s } : {}),
  });

  const fSize = (size: number) => ({
    fontSize: size * s,
    lineHeight: size * 1.4 * s,
  });

  const [phone,        setPhone]        = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [roomNumber,   setRoomNumber]   = useState('');
  const [hotelSlug]                     = useState('hotel-le-baobab');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const handleLogin = async () => {
    if (!phone) {
      setError(isFr ? 'Veuillez entrer un numéro de téléphone valide.' : 'Please enter a valid phone number.');
      return;
    }
    if (!roomNumber || isNaN(parseInt(roomNumber))) {
      setError(isFr ? 'Veuillez entrer votre numéro de chambre.' : 'Please enter your room number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullPhone = `${selectedCountry.dialCode}${phone}`;
      const res = await authApi.requestGuestOtp(fullPhone, parseInt(roomNumber) || 0, hotelSlug);
      const devOtp = res.data?.data?.otp;
      router.push({
        pathname: '/(guest)/otp',
        params: { phone: fullPhone, roomNumber, hotelSlug, devOtp: devOtp ?? '' },
      });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? (isFr ? 'Impossible de se connecter. Veuillez réessayer.' : 'Unable to sign in. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <LoginHeader />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, alignItems: 'center' }}>
          
          {/* ── Sign in title ── */}
          <Text style={[styles.title, p(24, 368, 345), { fontSize: 38 * s, lineHeight: 38 * 1.1 * s }]}>{isFr ? 'Se connecter' : 'Sign in'}</Text>
          <View style={[styles.titleUnderline, p(24, 418, 74, 3)]} />

          {/* ── Phone number field ── */}
          <View style={[styles.fieldWrap, p(25, 457, 343), { gap: 12 * s }]}>
            <Text style={[styles.fieldLabel, fSize(16)]}>{isFr ? 'Numéro de téléphone' : 'Phone no'}</Text>
            <View style={[styles.fieldInner, { gap: 8 * s }]}>
              <View style={[styles.inputRow, { gap: 8 * s }]}>
                <TouchableOpacity 
                  onPress={() => setShowCountryPicker(true)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 * s }}
                >
                  <Text style={[{ color: '#616161' }, fSize(18)]}>{selectedCountry.code}</Text>
                  <Text style={[{ color: '#424242', fontFamily: typography.rubikMedium }, fSize(14)]}>{selectedCountry.dialCode}</Text>
                  <Ionicons name="chevron-down" size={14 * s} color="#616161" />
                </TouchableOpacity>
                <View style={[styles.dividerDark, { height: 8 * s }]} />
                <TextInput
                  style={[styles.input, fSize(14)]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="678..."
                  placeholderTextColor="#616161"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.underlineCoral} />
            </View>
          </View>

          {/* ── Room number field ── */}
          <View style={[styles.fieldWrap, p(25, 563, 343), { gap: 12 * s }]}>
            <Text style={[styles.fieldLabel, fSize(16)]}>{isFr ? 'Numéro de chambre' : 'Room number'}</Text>
            <View style={[styles.fieldInner, { gap: 8 * s }]}>
              <View style={[styles.inputRow, { gap: 8 * s }]}>
                <Ionicons name="bed-outline" size={16 * s} color="#BDBDBD" />
                <View style={[styles.dividerGrey, { height: 8 * s }]} />
                <TextInput
                  style={[styles.input, styles.inputGrey, fSize(14)]}
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                  placeholder={isFr ? 'ex: 104' : 'e.g. 104'}
                  placeholderTextColor="#BDBDBD"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.underlineGrey} />
            </View>
          </View>

          {!!error && <Text style={[styles.error, p(25, 669, 343), fSize(12)]}>{error}</Text>}

          {/* ── Login button ── */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled, p(25, 731, 343, 49), { borderRadius: 12 * s }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#F8F8FF" />
              : <Text style={[styles.btnText, fSize(18)]}>{isFr ? 'Connexion' : 'Login'}</Text>
            }
          </TouchableOpacity>

          {/* ── Don't have an Account? ── */}
          <View style={[styles.signupRow, p(25, 800, 343), { gap: 4 * s }]}>
            <Text style={[styles.signupPrompt, fSize(14)]}>{isFr ? 'Vous n\'avez pas de compte ?' : "Don't have an Account ?"}</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(guest)/signup')}>
              <Text style={[styles.signupLink, fSize(14)]}>{isFr ? "S'inscrire" : 'Sign up'}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>

      {showCountryPicker && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, elevation: 999, justifyContent: 'flex-end' }}>
          <TouchableOpacity activeOpacity={1} onPress={() => setShowCountryPicker(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
          <View style={{ backgroundColor: '#FFF', padding: 20 * s, paddingBottom: 40 * s, borderTopLeftRadius: 24 * s, borderTopRightRadius: 24 * s }}>
            <View style={{ width: 40 * s, height: 5 * s, backgroundColor: '#E0E0E0', borderRadius: 3 * s, alignSelf: 'center', marginBottom: 20 * s }} />
            <Text style={{ fontFamily: typography.rubikMedium, fontSize: 18 * s, marginBottom: 15 * s, textAlign: 'center', color: '#424242' }}>
              {isFr ? 'Sélectionner le pays' : 'Select Country'}
            </Text>
            <ScrollView style={{ maxHeight: 350 * s }} showsVerticalScrollIndicator={false}>
              {COUNTRIES.map(c => (
                <TouchableOpacity
                  key={c.name}
                  onPress={() => { setSelectedCountry(c); setShowCountryPicker(false); }}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15 * s, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
                >
                  <Text style={{ fontSize: 24 * s, marginRight: 15 * s }}>{c.code}</Text>
                  <Text style={{ fontFamily: typography.rubikMedium, fontSize: 16 * s, color: '#616161', flex: 1 }}>{c.name}</Text>
                  <Text style={{ fontFamily: typography.rubikRegular, fontSize: 16 * s, color: '#424242' }}>{c.dialCode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)} style={{ paddingTop: 20 * s, alignItems: 'center' }}>
              <Text style={{ fontFamily: typography.rubikMedium, fontSize: 16 * s, color: '#424242' }}>{isFr ? 'Annuler' : 'Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <LanguageToggle />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCFC',
  },

  title: {
    fontFamily: typography.rubikMedium,
    fontSize: 38,
    lineHeight: 38 * 1.1,
    letterSpacing: 0,
    color: '#424242',
  },
  // Line 8: width 74px, border 3px solid #FF8383
  titleUnderline: {
    width: 74,
    height: 3,
    backgroundColor: '#FF8383',
    borderRadius: 1.5,
  },

  // ── Fields ──────────────────────────────────────────────────────────────────
  fieldWrap: {
  },
  fieldLabel: {
    fontFamily: typography.rubikMedium,
    color: '#616161',
  },
  fieldInner: {
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Email divider — dark
  dividerDark: {
    width: 1,
    height: 8,
    backgroundColor: '#616161',
  },
  // Password divider — grey
  dividerGrey: {
    width: 1,
    height: 8,
    backgroundColor: '#BDBDBD',
  },
  input: {
    flex: 1,
    fontFamily: typography.rubikRegular,
    fontSize: 14,
    lineHeight: 14 * 1.4,
    letterSpacing: 0.2,
    color: '#616161',
  },
  inputGrey: {
    color: '#BDBDBD',
  },
  underlineCoral: {
    height: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: '#FF8383',
  },
  underlineGrey: {
    height: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: '#BDBDBD',
  },

  // ── Error ────────────────────────────────────────────────────────────────────
  error: {
    fontFamily: typography.rubikRegular,
    fontSize: 12,
    color: colors.orange,
    marginBottom: spacing.md,
  },

  // ── Login button ─────────────────────────────────────────────────────────────
  btn: {
    backgroundColor: '#FF8383',
    borderRadius: 12,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: typography.rubikSemiBold,
    fontSize: 18,
    lineHeight: 18 * 1.4,
    letterSpacing: 0.2,
    color: '#F8F8FF',
  },

  // ── Don't have an Account? ───────────────────────────────────────────────────
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupPrompt: {
    fontFamily: typography.rubikRegular,
    fontSize: 14,
    lineHeight: 14 * 1.4,
    letterSpacing: 0.2,
    color: '#9E9E9E',
  },
  signupLink: {
    fontFamily: typography.rubikMedium,
    fontSize: 14,
    lineHeight: 14 * 1.4,
    letterSpacing: 0.2,
    color: '#FF8383',
  },
});
