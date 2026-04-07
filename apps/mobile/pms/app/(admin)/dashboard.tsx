import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useHotelSocket } from '../../hooks/useSocket';
import { colors, typography, spacing } from '../../constants/tokens';

interface DeptStat {
  department: string;
  total: number;
  active: number;
  revenue: number;
}

interface DailyStats {
  revenue: number;
  requests: number;
  paid: number;
  departments: DeptStat[];
}

const DEPT_LABELS: Record<string, string> = {
  ROOM_SERVICE: 'Room Service',
  HOUSEKEEPING: 'Ménage',
  CONCIERGE:    'Conciergerie',
  SPA:          'Spa',
};

const DEPT_GRADIENTS: Record<string, [string, string]> = {
  ROOM_SERVICE: ['#b7094c', '#892b64'],
  HOUSEKEEPING: ['#455e89', '#2e6f95'],
  CONCIERGE:    ['#5c4d7d', '#723c70'],
  SPA:          ['#1780a1', '#0091ad'],
};

function formatPrice(n: number) {
  return `${n.toLocaleString('fr-FR')} XAF`;
}

export default function AdminDashboardScreen() {
  const { user, accessToken } = useAuthStore();
  const hotelId               = user?.hotelId ?? null;

  const [stats,      setStats]      = useState<DailyStats | null>(null);
  const [hotelName,  setHotelName]  = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!hotelId) return;
    if (!silent) setRefreshing(false);
    try {
      const [statsRes, hotelRes] = await Promise.all([
        api.get(`/hotels/${hotelId}/stats/today`),
        api.get(`/hotels/${hotelId}`),
      ]);
      setStats(statsRes.data.data);
      setHotelName(hotelRes.data.data?.name ?? '');
    } finally {
      setRefreshing(false);
    }
  }, [hotelId]);

  useEffect(() => { load(); }, [load]);

  useHotelSocket(accessToken, null, {
    onRequestNew: () => load(true),
    onRequestStatusChanged: () => load(true),
  });

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen noPadding>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(true); }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header gradient band */}
        <LinearGradient
          colors={['#b7094c', '#723c70', '#0091ad']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.hotelName}>{hotelName || 'Dashboard'}</Text>
            <Text style={styles.dateLabel}>{today}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* KPI strip */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiValue}>{stats?.requests ?? 0}</Text>
              <Text style={styles.kpiLabel}>Demandes</Text>
            </View>
            <View style={[styles.kpiCard, styles.kpiCardBorder]}>
              <Text style={styles.kpiValue}>{stats?.paid ?? 0}</Text>
              <Text style={styles.kpiLabel}>Payées</Text>
            </View>
            <View style={[styles.kpiCard, styles.kpiCardBorder]}>
              <Text style={[styles.kpiValue, styles.kpiRevenue]}>{formatPrice(stats?.revenue ?? 0)}</Text>
              <Text style={styles.kpiLabel}>Revenus</Text>
            </View>
          </View>

          {/* Quick actions */}
          <Text style={styles.sectionLabel}>ACTIONS RAPIDES</Text>
          <View style={styles.quickActions}>
            {[
              { label: 'Demandes', icon: 'list-outline' as const, route: '/(admin)/requests' },
              { label: 'Chambres', icon: 'bed-outline' as const, route: '/(admin)/rooms' },
              { label: 'Services', icon: 'restaurant-outline' as const, route: '/(admin)/services' },
              { label: 'Staff', icon: 'people-outline' as const, route: '/(admin)/staff' },
            ].map(({ label, icon, route }) => (
              <TouchableOpacity
                key={route}
                style={styles.quickBtn}
                onPress={() => router.push(route as any)}
              >
                <Ionicons name={icon} size={22} color={colors.primary} />
                <Text style={styles.quickBtnLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dept breakdown */}
          {stats?.departments && stats.departments.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>PAR DÉPARTEMENT</Text>
              {stats.departments.map((dept) => {
                const gradient = DEPT_GRADIENTS[dept.department] ?? ['#333', '#555'];
                return (
                  <View key={dept.department} style={styles.deptCard}>
                    <LinearGradient
                      colors={gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.deptLeft}
                    >
                      <Text style={styles.deptName}>{DEPT_LABELS[dept.department] ?? dept.department}</Text>
                      <Text style={styles.deptActive}>{dept.active} actives</Text>
                    </LinearGradient>
                    <View style={styles.deptRight}>
                      <Text style={styles.deptTotal}>{dept.total} demandes</Text>
                      <Text style={styles.deptRevenue}>{formatPrice(dept.revenue)}</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerGradient: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: spacing.lg },
  headerContent: { gap: 4 },
  hotelName: { fontFamily: typography.fontDisplay, fontSize: typography.size.xl, color: '#fff' },
  dateLabel: { fontFamily: typography.fontBody, fontSize: typography.size.sm, color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' },

  content: { padding: spacing.lg, gap: 20 },

  kpiRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  kpiCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, gap: 4 },
  kpiCardBorder: { borderLeftWidth: 1, borderLeftColor: colors.line },
  kpiValue: { fontFamily: typography.fontDisplay, fontSize: typography.size.lg, color: colors.textPrimary },
  kpiRevenue: { fontSize: typography.size.sm },
  kpiLabel: { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.textDim },

  sectionLabel: {
    fontFamily: typography.fontLabel,
    fontSize: typography.size.xs,
    color: colors.textDim,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  quickActions: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 6,
  },
  quickBtnLabel: { fontFamily: typography.fontLabel, fontSize: typography.size.xs, color: colors.textSecondary, letterSpacing: 0.5 },

  deptCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  deptLeft: { padding: spacing.md, minWidth: 130 },
  deptName: { fontFamily: typography.fontSemiBold, fontSize: typography.size.sm, color: '#fff' },
  deptActive: { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  deptRight: { flex: 1, justifyContent: 'center', padding: spacing.md, gap: 4 },
  deptTotal: { fontFamily: typography.fontBody, fontSize: typography.size.sm, color: colors.textSecondary },
  deptRevenue: { fontFamily: typography.fontSemiBold, fontSize: typography.size.sm, color: colors.secondary },
});
