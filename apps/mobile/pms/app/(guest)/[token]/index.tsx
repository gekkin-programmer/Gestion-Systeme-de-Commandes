import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/ui/Screen';
import { stayApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { colors, typography, spacing } from '../../../constants/tokens';

const DEPARTMENTS = [
  {
    type: 'ROOM_SERVICE',
    label: 'Room Service',
    subtitle: 'Repas & boissons',
    icon: 'restaurant-outline' as const,
    gradient: ['#b7094c', '#892b64'] as const,
  },
  {
    type: 'HOUSEKEEPING',
    label: 'Ménage',
    subtitle: 'Entretien & linge',
    icon: 'bed-outline' as const,
    gradient: ['#455e89', '#2e6f95'] as const,
  },
  {
    type: 'CONCIERGE',
    label: 'Conciergerie',
    subtitle: 'Assistance & transport',
    icon: 'key-outline' as const,
    gradient: ['#5c4d7d', '#723c70'] as const,
  },
  {
    type: 'SPA',
    label: 'Spa & Bien-être',
    subtitle: 'Soins & massages',
    icon: 'flower-outline' as const,
    gradient: ['#1780a1', '#0091ad'] as const,
  },
];

export default function GuestHomeScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const guestSession = useAuthStore((s) => s.guestSession);
  const clearAuth    = useAuthStore((s) => s.clearAuth);
  const initCart     = useCartStore((s) => s.initCart);

  const [hotelName, setHotelName] = useState('');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!token) return;
    stayApi.getStay(token)
      .then(({ data }) => {
        const stay = data.data;
        setHotelName(stay.room?.hotel?.name ?? '');
        initCart(stay.room?.hotel?.id ?? '', token);
      })
      .catch(() => { /* stay info from guestSession */ })
      .finally(() => setLoading(false));
  }, [token]);

  const roomNumber = guestSession?.roomNumber;

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/(guest)/login');
  };

  if (loading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      {/* Top gradient header */}
      <LinearGradient
        colors={['#07040a', '#1c0e1a', '#07040a']}
        style={styles.header}
      >
        <LinearGradient
          colors={['#b7094c', '#723c70', '#0091ad']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerAccent}
        />
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hotelName}>{hotelName || 'Hôtel'}</Text>
            {roomNumber && (
              <View style={styles.roomBadge}>
                <Ionicons name="bed-outline" size={12} color={colors.secondary} />
                <Text style={styles.roomBadgeText}>Chambre {roomNumber}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.requestsBtn}
              onPress={() => router.push(`/(guest)/${token}/requests`)}
            >
              <Ionicons name="list-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={colors.textDim} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Comment puis-je{'\n'}vous aider ?</Text>
        <Text style={styles.greetingSub}>Choisissez un service ci-dessous.</Text>

        <View style={styles.grid}>
          {DEPARTMENTS.map((dept) => (
            <TouchableOpacity
              key={dept.type}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/(guest)/${token}/${dept.type}`)}
            >
              <LinearGradient
                colors={dept.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.cardIconWrap}>
                  <Ionicons name={dept.icon} size={28} color="rgba(255,255,255,0.9)" />
                </View>
                <Text style={styles.cardLabel}>{dept.label}</Text>
                <Text style={styles.cardSub}>{dept.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick info */}
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textDim} />
          <Text style={styles.infoText}>
            Vos demandes vous seront livrées directement en chambre.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
  },
  headerAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hotelName: {
    fontFamily: typography.fontDisplay,
    fontSize: typography.size.xl,
    color: colors.textPrimary,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  roomBadgeText: {
    fontFamily: typography.fontLabel,
    fontSize: typography.size.sm,
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  requestsBtn: {
    padding: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  logoutBtn: { padding: 8 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 48,
  },
  greeting: {
    fontFamily: typography.fontDisplay,
    fontSize: 30,
    color: colors.textPrimary,
    lineHeight: 36,
    marginBottom: 8,
  },
  greetingSub: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.xl,
  },
  card: {
    width: '47%',
    borderRadius: 0,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
    minHeight: 140,
    justifyContent: 'flex-end',
  },
  cardIconWrap: {
    marginBottom: 'auto',
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  cardLabel: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.size.base,
    color: '#fff',
    marginTop: 12,
  },
  cardSub: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    fontFamily: typography.fontBody,
    fontSize: typography.size.sm,
    color: colors.textDim,
    lineHeight: 18,
  },
});
