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
import { colors, typography, spacing } from '../../constants/tokens';
import type { Room } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Libre', OCCUPIED: 'Occupée', MAINTENANCE: 'Maintenance',
};
const STATUS_BADGE: Record<string, 'done' | 'pending' | 'cancelled'> = {
  AVAILABLE: 'done', OCCUPIED: 'pending', MAINTENANCE: 'cancelled',
};
const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single', DOUBLE: 'Double', SUITE: 'Suite', DELUXE: 'Deluxe', PENTHOUSE: 'Penthouse',
};

export default function AdminRoomsScreen() {
  const { user } = useAuthStore();
  const hotelId  = user?.hotelId ?? null;

  const [rooms,      setRooms]      = useState<Room[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!hotelId) return;
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/rooms/${hotelId}`);
      setRooms(data.data ?? []);
    } finally { setLoading(false); setRefreshing(false); }
  }, [hotelId]);

  useEffect(() => { load(); }, [load]);

  const generateQR = async (room: Room) => {
    setGenerating(room.id);
    try {
      await api.post(`/rooms/${hotelId}/${room.id}/qr`);
      await load(true);
    } finally { setGenerating(null); }
  };

  const renderItem = ({ item }: { item: Room }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.roomNum}>Chambre {item.roomNumber}</Text>
        <Text style={styles.roomMeta}>
          Étage {item.floor}  ·  {ROOM_TYPE_LABELS[item.type] ?? item.type}
        </Text>
        <Badge
          label={STATUS_LABELS[item.status] ?? item.status}
          variant={STATUS_BADGE[item.status] ?? 'dim'}
          style={{ marginTop: 6 }}
        />
      </View>
      <View style={styles.cardRight}>
        {item.qrCodeUrl ? (
          <View style={styles.qrReady}>
            <Ionicons name="qr-code-outline" size={20} color={colors.secondary} />
            <Text style={styles.qrReadyText}>QR prêt</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.genBtn}
            onPress={() => generateQR(item)}
            disabled={generating === item.id}
          >
            {generating === item.id
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={styles.genBtnText}>Générer QR</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Screen noPadding>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chambres</Text>
        <TouchableOpacity onPress={() => load()}>
          <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      {rooms.length > 0 && (
        <View style={styles.summary}>
          {(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] as const).map((s) => {
            const count = rooms.filter((r) => r.status === s).length;
            return (
              <View key={s} style={styles.summaryItem}>
                <Text style={styles.summaryCount}>{count}</Text>
                <Text style={styles.summaryLabel}>{STATUS_LABELS[s]}</Text>
              </View>
            );
          })}
        </View>
      )}

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="bed-outline" size={48} color={colors.textDim} />
              <Text style={styles.emptyText}>Aucune chambre configurée.</Text>
            </View>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  headerTitle: { fontFamily: typography.fontDisplay, fontSize: typography.size.xl, color: colors.textPrimary },
  summary: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, gap: 2 },
  summaryCount: { fontFamily: typography.fontDisplay, fontSize: typography.size.lg, color: colors.textPrimary },
  summaryLabel: { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.textDim },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontFamily: typography.fontBody, fontSize: typography.size.md, color: colors.textDim },
  list: { paddingBottom: 80 },
  separator: { height: 1, backgroundColor: colors.line },
  card: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
  },
  cardLeft: { flex: 1, gap: 2 },
  roomNum: { fontFamily: typography.fontSemiBold, fontSize: typography.size.base, color: colors.textPrimary },
  roomMeta: { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.textDim },
  cardRight: { alignItems: 'flex-end' },
  qrReady: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qrReadyText: { fontFamily: typography.fontLabel, fontSize: typography.size.xs, color: colors.secondary },
  genBtn: { borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6 },
  genBtnText: { fontFamily: typography.fontLabel, fontSize: typography.size.xs, color: colors.primary },
});
