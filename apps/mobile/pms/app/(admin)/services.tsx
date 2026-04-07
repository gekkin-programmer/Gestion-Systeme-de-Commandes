import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/ui/Screen';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing } from '../../constants/tokens';
import type { ServiceItem, ServiceType } from '../../types';

const DEPT_TABS: ServiceType[] = ['ROOM_SERVICE', 'HOUSEKEEPING', 'CONCIERGE', 'SPA'];

const DEPT_LABELS: Record<string, string> = {
  ROOM_SERVICE: 'Room Service',
  HOUSEKEEPING: 'Ménage',
  CONCIERGE:    'Conciergerie',
  SPA:          'Spa',
};

const DEPT_COLORS: Record<string, string> = {
  ROOM_SERVICE: '#f59e0b',
  HOUSEKEEPING: '#3b82f6',
  CONCIERGE:    '#8b5cf6',
  SPA:          '#ec4899',
};

// Admin catalog returns: Array<{ type: ServiceType, serviceItems: ServiceItem[] }>
type DeptWithItems = { type: ServiceType; serviceItems: ServiceItem[] };

function formatPrice(n?: number | null) {
  if (n == null) return 'Gratuit';
  return `${n.toLocaleString('fr-FR')} XAF`;
}

export default function AdminServicesScreen() {
  const { user } = useAuthStore();
  const hotelId  = user?.hotelId ?? null;

  const [activeTab,  setActiveTab]  = useState<ServiceType>('ROOM_SERVICE');
  const [catalog,    setCatalog]    = useState<DeptWithItems[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling,   setToggling]   = useState<Set<string>>(new Set());

  const load = useCallback(async (silent = false) => {
    if (!hotelId) return;
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/services/hotel/${hotelId}/admin`);
      setCatalog(data.data ?? []);
    } finally { setLoading(false); setRefreshing(false); }
  }, [hotelId]);

  useEffect(() => { load(); }, [load]);

  const toggleAvailability = async (item: ServiceItem) => {
    setToggling((s) => new Set(s).add(item.id));
    try {
      await api.patch(`/services/items/${item.id}/availability`);
      setCatalog((prev) => prev.map((dept) => ({
        ...dept,
        serviceItems: dept.serviceItems.map((i) =>
          i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i
        ),
      })));
    } finally { setToggling((s) => { const ns = new Set(s); ns.delete(item.id); return ns; }); }
  };

  const currentDept = catalog.find((d) => d.type === activeTab);
  const currentItems = currentDept?.serviceItems ?? [];

  const renderItem = ({ item }: { item: ServiceItem }) => (
    <View style={[styles.itemRow, !item.isAvailable && styles.itemRowUnavailable]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemName, !item.isAvailable && styles.itemNameDim]}>{item.nameFr}</Text>
        {item.descriptionFr ? (
          <Text style={styles.itemDesc} numberOfLines={1}>{item.descriptionFr}</Text>
        ) : null}
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
      </View>
      {toggling.has(item.id)
        ? <ActivityIndicator size="small" color={colors.primary} />
        : (
          <Switch
            value={item.isAvailable}
            onValueChange={() => toggleAvailability(item)}
            trackColor={{ false: colors.line, true: DEPT_COLORS[activeTab] + '55' }}
            thumbColor={item.isAvailable ? DEPT_COLORS[activeTab] : colors.textDim}
          />
        )
      }
    </View>
  );

  return (
    <Screen noPadding>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
        <TouchableOpacity onPress={() => load()}>
          <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Dept tabs */}
      <View style={styles.tabRow}>
        {DEPT_TABS.map((dept) => {
          const active = dept === activeTab;
          return (
            <TouchableOpacity
              key={dept}
              style={[styles.tab, active && { borderBottomColor: DEPT_COLORS[dept] }]}
              onPress={() => setActiveTab(dept)}
            >
              <Text style={[styles.tabText, active && { color: DEPT_COLORS[dept] }]}>
                {DEPT_LABELS[dept]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={currentItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(true); }}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            currentItems.length > 0 ? (
              <View style={styles.availabilityHint}>
                <Text style={styles.availabilityHintText}>
                  {currentItems.filter((i) => i.isAvailable).length}/{currentItems.length} disponibles
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="restaurant-outline" size={48} color={colors.textDim} />
              <Text style={styles.emptyText}>Aucun article pour ce département.</Text>
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
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabText: {
    fontFamily: typography.fontLabel, fontSize: typography.size.xs,
    color: colors.textDim, letterSpacing: 0.5,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontFamily: typography.fontBody, fontSize: typography.size.md, color: colors.textDim },
  list: { paddingBottom: 80 },
  availabilityHint: {
    paddingHorizontal: spacing.lg, paddingVertical: 10,
  },
  availabilityHintText: { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.textDim },
  separator: { height: 1, backgroundColor: colors.line, marginLeft: spacing.lg },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingVertical: 14, paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
  },
  itemRowUnavailable: { opacity: 0.5 },
  itemName: { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: colors.textPrimary, marginBottom: 2 },
  itemNameDim: { color: colors.textDim },
  itemDesc: { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.textDim, marginBottom: 4 },
  itemPrice: { fontFamily: typography.fontSemiBold, fontSize: typography.size.xs, color: colors.secondary },
});
