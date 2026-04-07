import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/ui/Screen';
import { api } from '../../../lib/api';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import type { ServiceItem } from '../../../types';
import { colors, typography, spacing } from '../../../constants/tokens';

const DEPT_CONFIG: Record<string, { label: string; gradient: [string, string] }> = {
  ROOM_SERVICE: { label: 'Room Service',    gradient: ['#b7094c', '#892b64'] },
  HOUSEKEEPING: { label: 'Ménage',          gradient: ['#455e89', '#2e6f95'] },
  CONCIERGE:    { label: 'Conciergerie',    gradient: ['#5c4d7d', '#723c70'] },
  SPA:          { label: 'Spa & Bien-être', gradient: ['#1780a1', '#0091ad'] },
};

function formatPrice(amount: number) {
  return `${amount.toLocaleString('fr-FR')} XAF`;
}

export default function DeptCatalogScreen() {
  const { token, dept } = useLocalSearchParams<{ token: string; dept: string }>();
  const guestSession = useAuthStore((s) => s.guestSession);

  const cartItems        = useCartStore((s) => s.items);
  const addItem          = useCartStore((s) => s.addItem);
  const updateQuantity   = useCartStore((s) => s.updateQuantity);
  const totalCartItems   = useCartStore((s) => s.totalItems());

  const [items,   setItems]   = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const config = DEPT_CONFIG[dept] ?? { label: dept, gradient: ['#5c4d7d', '#2e6f95'] as [string, string] };

  const loadItems = useCallback(() => {
    const hotelId = guestSession?.hotelId;
    if (!hotelId || !dept) return;
    setLoading(true);
    api.get(`/services/hotel/${hotelId}/dept/${dept}`)
      .then(({ data }) => {
        const deptData = data.data;
        setItems((deptData.items ?? []).filter((i: ServiceItem) => i.isAvailable));
      })
      .finally(() => setLoading(false));
  }, [guestSession?.hotelId, dept]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const getQty = (itemId: string) =>
    cartItems.find((c) => c.serviceItem.id === itemId)?.quantity ?? 0;

  const handleAdd = (item: ServiceItem) => addItem(item, dept);
  const handleDecrement = (itemId: string) => {
    const qty = getQty(itemId);
    updateQuantity(itemId, qty - 1);
  };

  return (
    <Screen noPadding>
      {/* Dept header */}
      <LinearGradient
        colors={config.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{config.label}</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aucun service disponible pour le moment.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const qty = getQty(item.id);
            return (
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.nameFr}</Text>
                  {item.descriptionFr && (
                    <Text style={styles.itemDesc}>{item.descriptionFr}</Text>
                  )}
                  <Text style={styles.itemPrice}>
                    {item.price != null ? formatPrice(item.price) : 'Gratuit'}
                  </Text>
                </View>

                {qty === 0 ? (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleAdd(item)}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => handleDecrement(item.id)}
                    >
                      <Ionicons name="remove" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => handleAdd(item)}
                    >
                      <Ionicons name="add" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Cart bar */}
      {totalCartItems > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          activeOpacity={0.9}
          onPress={() => router.push(`/(guest)/${token}/cart`)}
        >
          <LinearGradient
            colors={['#b7094c', '#0091ad']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cartBarGradient}
          >
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
            </View>
            <Text style={styles.cartBarText}>Voir le panier</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn:     { padding: 4 },
  headerTitle: {
    fontFamily: typography.fontDisplay,
    fontSize: typography.size.xl,
    color: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.md,
    color: colors.textDim,
    textAlign: 'center',
  },
  list: { padding: spacing.lg, paddingBottom: 100 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  itemName: {
    fontFamily: typography.fontLabel,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemDesc: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.size.sm,
    color: colors.secondary,
  },
  addBtn: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    borderWidth: 1,
    borderColor: colors.primary,
    flexShrink: 0,
  },
  qtyBtn: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  cartBar: {
    position: 'absolute',
    bottom: 24,
    left: spacing.lg,
    right: spacing.lg,
  },
  cartBarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
    gap: 12,
  },
  cartBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.size.sm,
    color: '#fff',
  },
  cartBarText: {
    flex: 1,
    fontFamily: typography.fontSemiBold,
    fontSize: typography.size.base,
    color: '#fff',
  },
});
