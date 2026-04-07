import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../../components/ui/Screen';
import { Button } from '../../../../components/ui/Button';
import { api } from '../../../../lib/api';
import { useStaySocket } from '../../../../hooks/useSocket';
import { colors, typography, spacing } from '../../../../constants/tokens';
import type { ServiceRequest, RequestStatus } from '../../../../types';

const STATUS_STEPS: RequestStatus[] = ['RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'];

const STATUS_LABELS: Record<string, string> = {
  RECEIVED:    'Demande reçue',
  IN_PROGRESS: 'En cours de traitement',
  COMPLETED:   'Préparée',
  DELIVERED:   'Livrée',
  CANCELLED:   'Annulée',
};

const STATUS_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  RECEIVED:    'checkmark-circle-outline',
  IN_PROGRESS: 'refresh-circle-outline',
  COMPLETED:   'cube-outline',
  DELIVERED:   'home-outline',
};

function formatPrice(n: number) {
  return `${n.toLocaleString('fr-FR')} XAF`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function TrackingScreen() {
  const { token, requestId } = useLocalSearchParams<{ token: string; requestId: string }>();

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading,  setLoading]  = useState(true);

  const loadRequest = () => {
    if (!requestId) return;
    api.get(`/requests/${requestId}/status`)
      .then(({ data }) => setRequest(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequest(); }, [requestId]);

  // Real-time updates
  useStaySocket(token, {
    onRequestStatusChanged: (updated: any) => {
      if (updated.id === requestId) setRequest(updated);
    },
  });

  const currentStep = request ? STATUS_STEPS.indexOf(request.status as RequestStatus) : -1;
  const isCancelled = request?.status === 'CANCELLED';
  const isDelivered = request?.status === 'DELIVERED';

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
      {/* Header gradient */}
      <LinearGradient
        colors={isDelivered ? ['#0091ad', '#1780a1'] : isCancelled ? ['#3a1830', '#07040a'] : ['#b7094c', '#5c4d7d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.push(`/(guest)/${token}`)}>
            <Ionicons name="close" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <Text style={styles.headerLabel}>Suivi de demande</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.requestNum}>{request?.requestNumber}</Text>

        {isDelivered ? (
          <View style={styles.deliveredBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.deliveredText}>Livrée !</Text>
          </View>
        ) : isCancelled ? (
          <Text style={styles.cancelledText}>Annulée</Text>
        ) : (
          <Text style={styles.headerSub}>Votre demande est en cours de traitement.</Text>
        )}
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Status stepper */}
        {!isCancelled && (
          <View style={styles.stepperCard}>
            {STATUS_STEPS.map((step, index) => {
              const isDone    = index <= currentStep;
              const isCurrent = index === currentStep;
              const isLast    = index === STATUS_STEPS.length - 1;

              return (
                <View key={step} style={styles.stepRow}>
                  {/* Line connector */}
                  <View style={styles.stepLeft}>
                    <View style={[
                      styles.stepDot,
                      isDone && styles.stepDotDone,
                      isCurrent && styles.stepDotCurrent,
                    ]}>
                      {isDone && !isCurrent && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                      {isCurrent && (
                        <View style={styles.stepDotInner} />
                      )}
                    </View>
                    {!isLast && (
                      <View style={[styles.stepLine, isDone && index < currentStep && styles.stepLineDone]} />
                    )}
                  </View>

                  <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>
                      {STATUS_LABELS[step]}
                    </Text>
                    {isCurrent && <Text style={styles.stepCurrent}>En cours…</Text>}
                  </View>

                  {isDone && (
                    <Ionicons
                      name={STATUS_ICONS[step]}
                      size={18}
                      color={isCurrent ? colors.primary : colors.secondary}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Items summary */}
        {request?.items && request.items.length > 0 && (
          <View style={styles.itemsCard}>
            <Text style={styles.itemsTitle}>ARTICLES COMMANDÉS</Text>
            {request.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemQty}>{item.quantity}×</Text>
                <Text style={styles.itemName}>{item.itemNameFr}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.unitPrice * item.quantity)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(request.totalAmount)}</Text>
            </View>
          </View>
        )}

        {/* Receipt link if paid */}
        {request?.payment?.status === 'PAID' && (
          <TouchableOpacity
            style={styles.receiptBtn}
            onPress={() => {
              // Open receipt PDF
              const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://72.60.214.93:4000/api/v1';
              const url = `${apiUrl}/receipts/${requestId}`;
              router.push({ pathname: '/(guest)/pdf', params: { url } });
            }}
          >
            <Ionicons name="document-text-outline" size={18} color={colors.secondary} />
            <Text style={styles.receiptText}>Voir le reçu PDF</Text>
          </TouchableOpacity>
        )}

        {request?.createdAt && (
          <Text style={styles.createdAt}>
            Demande effectuée à {formatTime(request.createdAt)}
          </Text>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Nouvelle demande"
          variant="outline"
          fullWidth
          onPress={() => router.push(`/(guest)/${token}`)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLabel: { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, textTransform: 'uppercase' },
  requestNum: { fontFamily: typography.fontDisplay, fontSize: 28, color: '#fff' },
  headerSub:  { fontFamily: typography.fontBody, fontSize: typography.size.sm, color: 'rgba(255,255,255,0.7)' },
  deliveredBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4 },
  deliveredText:  { fontFamily: typography.fontSemiBold, fontSize: typography.size.sm, color: '#fff' },
  cancelledText:  { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  content: { padding: spacing.lg, paddingBottom: 100, gap: 16 },
  stepperCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: spacing.md, gap: 0 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 4 },
  stepLeft: { alignItems: 'center', width: 24 },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepDotDone:    { backgroundColor: colors.secondary, borderColor: colors.secondary },
  stepDotCurrent: { backgroundColor: 'transparent', borderColor: colors.primary, borderWidth: 2 },
  stepDotInner:   { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  stepLine:     { width: 2, flex: 1, minHeight: 24, backgroundColor: colors.line, marginVertical: 2 },
  stepLineDone: { backgroundColor: colors.secondary },
  stepContent:  { flex: 1, paddingVertical: 3 },
  stepLabel:     { fontFamily: typography.fontBody, fontSize: typography.size.sm, color: colors.textDim },
  stepLabelDone: { color: colors.textPrimary, fontFamily: typography.fontLabel },
  stepCurrent:   { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.primary, marginTop: 2 },
  itemsCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: spacing.md, gap: 10 },
  itemsTitle: { fontFamily: typography.fontLabel, fontSize: typography.size.xs, color: colors.textDim, letterSpacing: 2, marginBottom: 4 },
  itemRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  itemQty: { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: colors.textSecondary, minWidth: 22 },
  itemName: { flex: 1, fontFamily: typography.fontBody, fontSize: typography.size.sm, color: colors.textPrimary },
  itemPrice: { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: colors.secondary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, marginTop: 4 },
  totalLabel: { fontFamily: typography.fontSemiBold, fontSize: typography.size.sm, color: colors.textPrimary },
  totalValue: { fontFamily: typography.fontSemiBold, fontSize: typography.size.sm, color: colors.secondary },
  receiptBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: spacing.md },
  receiptText: { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: colors.secondary },
  createdAt: { fontFamily: typography.fontBody, fontSize: typography.size.xs, color: colors.textDim, textAlign: 'center' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
});
