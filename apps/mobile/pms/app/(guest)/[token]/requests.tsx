import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/ui/Screen';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { colors, typography, spacing } from '../../../constants/tokens';
import type { ServiceRequest, RequestStatus } from '../../../types';

const STATUS_COLORS: Record<string, string> = {
  RECEIVED:    colors.statusPending,
  IN_PROGRESS: colors.statusProgress,
  COMPLETED:   colors.statusDone,
  DELIVERED:   colors.statusDone,
  CANCELLED:   colors.statusCancelled,
};

const STATUS_LABELS: Record<string, string> = {
  RECEIVED:    'Reçue',
  IN_PROGRESS: 'En cours',
  COMPLETED:   'Complétée',
  DELIVERED:   'Livrée',
  CANCELLED:   'Annulée',
};

const DEPT_LABELS: Record<string, string> = {
  ROOM_SERVICE: 'Room Service',
  HOUSEKEEPING: 'Ménage',
  CONCIERGE:    'Conciergerie',
  SPA:          'Spa',
};

function formatPrice(n: number) {
  return `${n.toLocaleString('fr-FR')} XAF`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function GuestRequestsScreen() {
  const { token }    = useLocalSearchParams<{ token: string }>();
  const guestSession = useAuthStore((s) => s.guestSession);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    api.get(`/stays/${token}`)
      .then(({ data }) => {
        const stay = data.data;
        setRequests(stay.serviceRequests ?? []);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const active   = requests.filter((r) => !['DELIVERED', 'CANCELLED'].includes(r.status));
  const finished = requests.filter((r) => ['DELIVERED', 'CANCELLED'].includes(r.status));

  const renderItem = ({ item }: { item: ServiceRequest }) => {
    const statusColor = STATUS_COLORS[item.status] ?? colors.textDim;
    return (
      <TouchableOpacity
        style={styles.reqRow}
        activeOpacity={0.8}
        onPress={() => router.push(`/(guest)/${token}/tracking/${item.id}`)}
      >
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.reqNum}>{item.requestNumber}</Text>
          <Text style={styles.reqDept}>{DEPT_LABELS[item.department] ?? item.department}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={[styles.reqStatus, { color: statusColor }]}>
            {STATUS_LABELS[item.status] ?? item.status}
          </Text>
          <Text style={styles.reqTime}>{formatTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.reqAmount}>{formatPrice(item.totalAmount)}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textDim} />
      </TouchableOpacity>
    );
  };

  return (
    <Screen noPadding>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes demandes</Text>
        <TouchableOpacity onPress={load}>
          <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="list-outline" size={48} color={colors.textDim} />
          <Text style={styles.emptyText}>Aucune demande pour le moment.</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push(`/(guest)/${token}`)}
          >
            <Text style={styles.newBtnText}>Faire une demande</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[...active, ...finished]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            active.length > 0 ? (
              <View style={styles.sectionHeader}>
                <View style={styles.activeDot} />
                <Text style={styles.sectionTitle}>En cours ({active.length})</Text>
              </View>
            ) : null
          }
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerTitle: { fontFamily: typography.fontDisplay, fontSize: typography.size.xl, color: colors.textPrimary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontFamily: typography.fontBody, fontSize: typography.size.md, color: colors.textDim },
  newBtn: {
    borderWidth: 1, borderColor: colors.primary,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
  },
  newBtnText: { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: colors.primary },
  list: { paddingBottom: 48 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: spacing.lg, paddingVertical: 12,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  sectionTitle: { fontFamily: typography.fontLabel, fontSize: typography.size.xs, color: colors.textDim, letterSpacing: 2, textTransform: 'uppercase' },
  reqRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  reqNum:    { fontFamily: typography.fontSemiBold, fontSize: typography.size.sm, color: colors.textPrimary, marginBottom: 2 },
  reqDept:   { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.textSecondary },
  reqStatus: { fontFamily: typography.fontLabel, fontSize: typography.size.xs },
  reqTime:   { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.textDim },
  reqAmount: { fontFamily: typography.fontSemiBold, fontSize: typography.size.sm, color: colors.secondary, marginLeft: 4 },
  separator: { height: 1, backgroundColor: colors.line, marginLeft: spacing.lg },
});
