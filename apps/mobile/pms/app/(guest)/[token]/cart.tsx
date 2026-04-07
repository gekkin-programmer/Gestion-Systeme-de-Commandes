import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/ui/Screen';
import { Button } from '../../../components/ui/Button';
import { useCartStore } from '../../../store/cartStore';
import { colors, typography, spacing } from '../../../constants/tokens';

function formatPrice(n: number) {
  return `${n.toLocaleString('fr-FR')} XAF`;
}

const TAX_RATE = 0.1925;

export default function CartScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();

  const items          = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart      = useCartStore((s) => s.clearCart);
  const subtotal       = useCartStore((s) => s.subtotal());

  const [notes, setNotes] = useState('');

  const taxAmount  = subtotal * TAX_RATE;
  const totalAmount = subtotal + taxAmount;

  if (items.length === 0) {
    return (
      <Screen>
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Ionicons name="cart-outline" size={48} color={colors.textDim} />
          <Text style={styles.emptyText}>Votre panier est vide.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Votre panier</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Vider</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Items */}
        <View style={styles.itemsCard}>
          {items.map(({ serviceItem, quantity }) => (
            <View key={serviceItem.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{serviceItem.nameFr}</Text>
                {serviceItem.price != null && (
                  <Text style={styles.itemUnitPrice}>{formatPrice(serviceItem.price)} × {quantity}</Text>
                )}
              </View>

              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(serviceItem.id, quantity - 1)}
                >
                  <Ionicons name="remove" size={14} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(serviceItem.id, quantity + 1)}
                >
                  <Ionicons name="add" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.itemTotal}>
                {serviceItem.price != null
                  ? formatPrice(serviceItem.price * quantity)
                  : 'Gratuit'}
              </Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesLabel}>NOTES / INSTRUCTIONS</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ex: sans gluten, chambre 101, à 14h…"
            placeholderTextColor={colors.textDim}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>TVA (19,25%)</Text>
            <Text style={styles.summaryValue}>{formatPrice(taxAmount)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <Button
          title={`Commander — ${formatPrice(totalAmount)}`}
          variant="gradient"
          fullWidth
          size="lg"
          onPress={() => router.push({
            pathname: `/(guest)/${token}/payment`,
            params: { notes },
          })}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn:     { padding: 4, marginRight: 12 },
  backRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: spacing.lg },
  backText:    { fontFamily: typography.fontLabel, fontSize: typography.size.md, color: colors.textSecondary },
  headerTitle: { flex: 1, fontFamily: typography.fontDisplay, fontSize: typography.size.xl, color: colors.textPrimary },
  clearText:   { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: colors.danger },
  emptyText:   { fontFamily: typography.fontBody, fontSize: typography.size.md, color: colors.textDim },
  content:     { padding: spacing.lg, paddingBottom: 100, gap: 16 },
  itemsCard:   { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  itemName:      { fontFamily: typography.fontLabel, fontSize: typography.size.md, color: colors.textPrimary, marginBottom: 2 },
  itemUnitPrice: { fontFamily: typography.fontBody, fontSize: typography.size.sm, color: colors.textSecondary },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  qtyBtn: {
    width: 30,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    minWidth: 22,
    textAlign: 'center',
  },
  itemTotal: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.size.sm,
    color: colors.secondary,
    minWidth: 80,
    textAlign: 'right',
  },
  notesCard:   { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: spacing.md },
  notesLabel:  { fontFamily: typography.fontLabel, fontSize: typography.size.xs, color: colors.textDim, letterSpacing: 2, marginBottom: spacing.sm },
  notesInput: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  summaryCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: spacing.md, gap: 10 },
  summaryRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontFamily: typography.fontBody, fontSize: typography.size.sm, color: colors.textSecondary },
  summaryValue: { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: colors.textPrimary },
  totalRow:    { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, marginTop: 2 },
  totalLabel:  { fontFamily: typography.fontDisplay, fontSize: typography.size.base, color: colors.textPrimary },
  totalValue:  { fontFamily: typography.fontDisplay, fontSize: typography.size.base, color: colors.secondary },
  footer:      { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
});
