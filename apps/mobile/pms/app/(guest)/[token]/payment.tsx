import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/ui/Screen';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { api } from '../../../lib/api';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import { colors, typography, spacing } from '../../../constants/tokens';
import type { PaymentMethod } from '../../../types';

function formatPrice(n: number) {
  return `${n.toLocaleString('fr-FR')} XAF`;
}

const TAX_RATE = 0.1925;

export default function PaymentScreen() {
  const { token, notes } = useLocalSearchParams<{ token: string; notes: string }>();
  const guestSession = useAuthStore((s) => s.guestSession);

  const items         = useCartStore((s) => s.items);
  const departmentType = useCartStore((s) => s.departmentType);
  const stayToken     = useCartStore((s) => s.stayToken);
  const clearCart     = useCartStore((s) => s.clearCart);
  const subtotal      = useCartStore((s) => s.subtotal());
  const totalAmount   = subtotal * (1 + TAX_RATE);

  const [method,      setMethod]      = useState<PaymentMethod>('HOTEL_BILL');
  const [phone,       setPhone]       = useState(guestSession?.phone ?? '');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // Load hotel settings to determine enabled methods
  const [settings, setSettings] = useState({ enableMtnMoney: true, enableOrangeMoney: true, enableHotelBill: true });

  useEffect(() => {
    const hotelId = guestSession?.hotelId;
    if (!hotelId) return;
    api.get(`/hotels/${hotelId}`)
      .then(({ data }) => {
        const s = data.data?.settings;
        if (s) setSettings({
          enableMtnMoney:    s.enableMtnMoney,
          enableOrangeMoney: s.enableOrangeMoney,
          enableHotelBill:   s.enableHotelBill,
        });
      })
      .catch(() => {});
  }, [guestSession?.hotelId]);

  const handlePay = async () => {
    if ((method === 'MTN_MOBILE_MONEY' || method === 'ORANGE_MONEY') && !phone.replace(/\s/g, '')) {
      setError('Veuillez saisir votre numéro de téléphone mobile money.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1 — Create service request
      const requestPayload = {
        stayToken: stayToken ?? token,
        department: departmentType,
        items: items.map((c) => ({ serviceItemId: c.serviceItem.id, quantity: c.quantity })),
        notes: notes || undefined,
      };
      const requestRes = await api.post('/requests', requestPayload);
      const requestId: string = requestRes.data.data.id;

      // 2 — Initiate payment
      const paymentPayload: Record<string, any> = { requestId, method };
      if (method !== 'HOTEL_BILL') {
        paymentPayload.mobileMoneyPhone = phone.replace(/\s/g, '');
      }
      await api.post('/payments/initiate', paymentPayload);

      // 3 — Mock callback for mobile money
      if (method !== 'HOTEL_BILL') {
        await api.post(`/payments/callback/mock/${requestId}?simulate=success`);
      }

      clearCart();
      router.replace(`/(guest)/${token}/tracking/${requestId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Erreur lors du paiement. Réessayez.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const MethodOption = ({ id, label, icon, enabled }: {
    id: PaymentMethod;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    enabled: boolean;
  }) => {
    if (!enabled) return null;
    const selected = method === id;
    return (
      <TouchableOpacity
        style={[styles.methodRow, selected && styles.methodSelected]}
        onPress={() => setMethod(id)}
        activeOpacity={0.8}
      >
        <View style={[styles.methodIcon, selected && styles.methodIconSelected]}>
          <Ionicons name={icon} size={18} color={selected ? '#fff' : colors.textSecondary} />
        </View>
        <Text style={[styles.methodLabel, selected && styles.methodLabelSelected]}>
          {label}
        </Text>
        {selected && (
          <View style={styles.selectedDot}>
            <Ionicons name="checkmark" size={14} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Screen noPadding>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Amount card */}
        <LinearGradient
          colors={['#1c0e1a', '#07040a']}
          style={styles.amountCard}
        >
          <Text style={styles.amountLabel}>Total à payer</Text>
          <Text style={styles.amountValue}>{formatPrice(totalAmount)}</Text>
          <Text style={styles.amountSub}>TVA 19,25% incluse</Text>
        </LinearGradient>

        {/* Payment methods */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MODE DE PAIEMENT</Text>

          <View style={styles.methodsCard}>
            <MethodOption
              id="HOTEL_BILL"
              label="Facturer sur la chambre"
              icon="receipt-outline"
              enabled={settings.enableHotelBill}
            />
            <MethodOption
              id="MTN_MOBILE_MONEY"
              label="MTN Mobile Money"
              icon="phone-portrait-outline"
              enabled={settings.enableMtnMoney}
            />
            <MethodOption
              id="ORANGE_MONEY"
              label="Orange Money"
              icon="phone-portrait-outline"
              enabled={settings.enableOrangeMoney}
            />
          </View>
        </View>

        {/* Phone for mobile money */}
        {(method === 'MTN_MOBILE_MONEY' || method === 'ORANGE_MONEY') && (
          <Input
            label="Numéro mobile money"
            value={phone}
            onChangeText={setPhone}
            placeholder="+237 6XX XXX XXX"
            keyboardType="phone-pad"
          />
        )}

        {method === 'HOTEL_BILL' && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color={colors.secondary} />
            <Text style={styles.infoText}>
              Le montant sera ajouté à votre facture et réglé lors du départ.
            </Text>
          </View>
        )}

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={loading ? 'Traitement…' : 'Confirmer la commande'}
          variant="gradient"
          fullWidth
          size="lg"
          loading={loading}
          onPress={handlePay}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: spacing.lg,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { fontFamily: typography.fontDisplay, fontSize: typography.size.xl, color: colors.textPrimary },
  content: { padding: spacing.lg, paddingBottom: 100, gap: 20 },
  amountCard: {
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  amountLabel: { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase' },
  amountValue: { fontFamily: typography.fontDisplay, fontSize: 40, color: colors.textPrimary, marginVertical: 8 },
  amountSub:   { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.textDim },
  section:     { gap: 10 },
  sectionLabel: { fontFamily: typography.fontLabel, fontSize: typography.size.xs, color: colors.textDim, letterSpacing: 2 },
  methodsCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  methodSelected: { backgroundColor: colors.surfaceRaised, borderLeftWidth: 2, borderLeftColor: colors.primary },
  methodIcon: {
    width: 36,
    height: 36,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  methodIconSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  methodLabel:         { flex: 1, fontFamily: typography.fontLabel, fontSize: typography.size.base, color: colors.textSecondary },
  methodLabelSelected: { color: colors.textPrimary },
  selectedDot: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
  infoText: { flex: 1, fontFamily: typography.fontBody, fontSize: typography.size.sm, color: colors.textSecondary, lineHeight: 18 },
  errorBox:  { backgroundColor: colors.dangerMuted, borderWidth: 1, borderColor: colors.danger, padding: spacing.md },
  errorText: { fontFamily: typography.fontBody, fontSize: typography.size.sm, color: colors.danger },
  footer:    { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
});
