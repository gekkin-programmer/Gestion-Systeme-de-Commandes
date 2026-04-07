import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/tokens';

export default function PdfViewerScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reçu PDF</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement du reçu…</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={styles.errorText}>Impossible de charger le reçu.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setError(false)}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          source={{ uri: url ?? '' }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          startInLoadingState={false}
          scalesPageToFit
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
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
  headerTitle: {
    fontFamily: typography.fontDisplay,
    fontSize: typography.size.xl,
    color: colors.textPrimary,
  },
  webview: { flex: 1, backgroundColor: colors.bg },
  loadingOverlay: {
    position: 'absolute',
    top: 100, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  loadingText: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.sm,
    color: colors.textDim,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: spacing.lg,
  },
  errorText: {
    fontFamily: typography.fontBody,
    fontSize: typography.size.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    marginTop: 4,
  },
  retryText: {
    fontFamily: typography.fontLabel,
    fontSize: typography.size.sm,
    color: colors.primary,
  },
});
