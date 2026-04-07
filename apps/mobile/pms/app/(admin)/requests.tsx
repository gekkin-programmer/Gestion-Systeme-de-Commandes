import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useHotelSocket } from '../../hooks/useSocket';
import { colors, typography, spacing } from '../../constants/tokens';
import type { ServiceRequest, RequestStatus, ServiceType } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Reçue', IN_PROGRESS: 'En cours',
  COMPLETED: 'Prête', DELIVERED: 'Livrée', CANCELLED: 'Annulée',
};
const STATUS_BADGE: Record<string, 'pending' | 'progress' | 'done' | 'cancelled'> = {
  RECEIVED: 'pending', IN_PROGRESS: 'progress',
  COMPLETED: 'done', DELIVERED: 'done', CANCELLED: 'cancelled',
};
const DEPT_LABELS: Record<string, string> = {
  ROOM_SERVICE: 'Room Service', HOUSEKEEPING: 'Ménage', CONCIERGE: 'Conciergerie', SPA: 'Spa',
};
const DEPT_COLORS: Record<string, string> = {
  ROOM_SERVICE: '#f59e0b', HOUSEKEEPING: '#3b82f6', CONCIERGE: '#8b5cf6', SPA: '#ec4899',
};
const NEXT_STATUS: Record<string, RequestStatus | null> = {
  RECEIVED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED', COMPLETED: 'DELIVERED', DELIVERED: null, CANCELLED: null,
};

function formatPrice(n: number) { return `${n.toLocaleString('fr-FR')} XAF`; }
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminRequestsScreen() {
  const { user, accessToken } = useAuthStore();
  const hotelId = user?.hotelId ?? null;

  const [requests,   setRequests]   = useState<ServiceRequest[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState<ServiceType | 'ALL'>('ALL');
  const [updating,   setUpdating]   = useState<Set<string>>(new Set());

  const load = useCallback(async (silent = false) => {
    if (!hotelId) return;
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/requests/hotel/${hotelId}`);
      setRequests(data.data ?? []);
    } finally { setLoading(false); setRefreshing(false); }
  }, [hotelId]);

  useEffect(() => { load(); }, [load]);

  useHotelSocket(accessToken, null, {
    onRequestNew: () => load(true),
    onRequestStatusChanged: (updated: any) => {
      setRequests((prev) => {
        const idx = prev.findIndex((r) => r.id === updated.id);
        if (idx === -1) return [...prev, updated];
        const next = [...prev]; next[idx] = updated; return next;
      });
    },
  });

  const advanceStatus = async (req: ServiceRequest) => {
    const next = NEXT_STATUS[req.status]; if (!next) return;
    setUpdating((s) => new Set(s).add(req.id));
    try {
      await api.patch(`/requests/${req.id}/status`, { status: next });
      setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: next } : r));
    } finally { setUpdating((s) => { const ns = new Set(s); ns.delete(req.id); return ns; }); }
  };

  const visible = filter === 'ALL' ? requests : requests.filter((r) => r.department === filter);
  const active   = visible.filter((r) => !['DELIVERED', 'CANCELLED'].includes(r.status));
  const finished = visible.filter((r) => ['DELIVERED', 'CANCELLED'].includes(r.status));

  const renderItem = ({ item }: { item: ServiceRequest }) => {
    const busy = updating.has(item.id);
    const nextStatus = NEXT_STATUS[item.status];
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.deptBar, { backgroundColor: DEPT_COLORS[item.department] ?? colors.textDim }]} />
          <View style={{ flex: 1 }}>
            <View style={styles.cardHeader}>
              <Text style={styles.reqNum}>{item.requestNumber}</Text>
              <Badge label={STATUS_LABELS[item.status] ?? item.status} variant={STATUS_BADGE[item.status] ?? 'dim'} />
            </View>
            <Text style={styles.meta}>
              {DEPT_LABELS[item.department] ?? item.department}
              {item.roomStay?.room?.roomNumber ? `  ·  Ch. ${item.roomStay.room.roomNumber}` : ''}
              {'  ·  '}{formatTime(item.createdAt)}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.amount}>{formatPrice(item.totalAmount)}</Text>
          {nextStatus && item.status !== 'CANCELLED' && (
            <TouchableOpacity
              style={[styles.advanceBtn, busy && styles.advanceBtnDisabled]}
              onPress={() => advanceStatus(item)}
              disabled={busy}
            >
              {busy
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.advanceBtnText}>{STATUS_LABELS[nextStatus]} →</Text>
              }
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const depts: Array<ServiceType | 'ALL'> = ['ALL', 'ROOM_SERVICE', 'HOUSEKEEPING', 'CONCIERGE', 'SPA'];

  return (
    <Screen noPadding>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Demandes</Text>
        <TouchableOpacity onPress={() => load()}>
          <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {depts.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.filterChip, filter === d && styles.filterChipActive]}
            onPress={() => setFilter(d)}
          >
            <Text style={[styles.filterChipText, filter === d && styles.filterChipTextActive]}>
              {d === 'ALL' ? 'Tous' : (DEPT_LABELS[d] ?? d)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={[...active, ...finished]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.textDim} />
              <Text style={styles.emptyText}>Aucune demande.</Text>
            </View>
          }
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  headerTitle: { fontFamily: typography.fontDisplay, fontSize: typography.size.xl, color: colors.textPrimary },
  filterRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.md, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.line },
  filterChipActive: { borderColor: colors.primary, backgroundColor: 'rgba(183,9,76,0.12)' },
  filterChipText: { fontFamily: typography.fontLabel, fontSize: typography.size.xs, color: colors.textDim },
  filterChipTextActive: { color: colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontFamily: typography.fontBody, fontSize: typography.size.md, color: colors.textDim },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  cardTop: { flexDirection: 'row' },
  deptBar: { width: 3, flexShrink: 0 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: spacing.md, paddingTop: spacing.md, paddingLeft: spacing.sm, paddingBottom: 4 },
  reqNum: { fontFamily: typography.fontSemiBold, fontSize: typography.size.sm, color: colors.textPrimary },
  meta: { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.textDim, paddingLeft: spacing.sm, paddingBottom: spacing.sm },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.line,
  },
  amount: { fontFamily: typography.fontSemiBold, fontSize: typography.size.sm, color: colors.secondary },
  advanceBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: 7, minWidth: 100, alignItems: 'center' },
  advanceBtnDisabled: { opacity: 0.5 },
  advanceBtnText: { fontFamily: typography.fontLabel, fontSize: typography.size.xs, color: '#fff', letterSpacing: 0.5 },
});
