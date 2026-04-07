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
import type { AuthUser } from '../../types';

const DEPT_LABELS: Record<string, string> = {
  ROOM_SERVICE: 'Room Service',
  HOUSEKEEPING: 'Ménage',
  CONCIERGE:    'Conciergerie',
  SPA:          'Spa',
};

const ROLE_BADGE: Record<string, 'accent' | 'progress' | 'dim'> = {
  ADMIN: 'accent',
  STAFF: 'progress',
};

export default function AdminStaffScreen() {
  const { user } = useAuthStore();
  const hotelId  = user?.hotelId ?? null;

  const [staff,      setStaff]      = useState<AuthUser[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!hotelId) return;
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/hotels/${hotelId}/staff`);
      setStaff(data.data ?? []);
    } finally { setLoading(false); setRefreshing(false); }
  }, [hotelId]);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item }: { item: AuthUser }) => (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarLetter}>{item.email?.[0]?.toUpperCase() ?? '?'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.email}>{item.email}</Text>
        {item.departmentType ? (
          <Text style={styles.dept}>{DEPT_LABELS[item.departmentType] ?? item.departmentType}</Text>
        ) : (
          <Text style={styles.dept}>Tous les départements</Text>
        )}
      </View>
      <Badge
        label={item.role}
        variant={ROLE_BADGE[item.role] ?? 'dim'}
      />
    </View>
  );

  return (
    <Screen noPadding>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Staff</Text>
        <TouchableOpacity onPress={() => load()}>
          <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(true); }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={48} color={colors.textDim} />
              <Text style={styles.emptyText}>Aucun membre du staff.</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontFamily: typography.fontBody, fontSize: typography.size.md, color: colors.textDim },
  list: { paddingBottom: 80 },
  separator: { height: 1, backgroundColor: colors.line },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
  },
  avatar: {
    width: 40, height: 40,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontFamily: typography.fontSemiBold, fontSize: typography.size.base, color: colors.primary },
  email: { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: colors.textPrimary, marginBottom: 2 },
  dept: { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.textDim },
});
