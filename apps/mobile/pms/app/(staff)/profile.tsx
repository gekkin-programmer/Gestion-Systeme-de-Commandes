import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/ui/Screen';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing } from '../../constants/tokens';

const DEPT_LABELS: Record<string, string> = {
  ROOM_SERVICE: 'Room Service',
  HOUSEKEEPING: 'Ménage',
  CONCIERGE:    'Conciergerie',
  SPA:          'Spa',
};

export default function StaffProfileScreen() {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    await clearAuth();
    router.replace('/(auth)/login');
  };

  return (
    <Screen noPadding>
      {/* Gradient accent */}
      <LinearGradient
        colors={['#b7094c', '#723c70', '#0091ad']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentBar}
      />

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{user?.role ?? 'STAFF'}</Text>
          </View>
          {user?.departmentType && (
            <Text style={styles.dept}>{DEPT_LABELS[user.departmentType] ?? user.departmentType}</Text>
          )}
        </View>

        {/* Info rows */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={16} color={colors.textDim} />
            <Text style={styles.infoLabel}>Rôle</Text>
            <Text style={styles.infoValue}>{user?.role}</Text>
          </View>
          {user?.departmentType && (
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Ionicons name="layers-outline" size={16} color={colors.textDim} />
              <Text style={styles.infoLabel}>Département</Text>
              <Text style={styles.infoValue}>{DEPT_LABELS[user.departmentType] ?? user.departmentType}</Text>
            </View>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  accentBar: { height: 3 },
  content: { flex: 1, padding: spacing.lg, gap: 24 },
  avatarWrap: { alignItems: 'center', paddingTop: 32, gap: 8 },
  avatar: {
    width: 72, height: 72,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.lineBright,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontFamily: typography.fontDisplay, fontSize: 32, color: colors.primary },
  email: { fontFamily: typography.fontBody, fontSize: typography.size.md, color: colors.textPrimary },
  roleBadge: {
    paddingHorizontal: 12, paddingVertical: 3,
    backgroundColor: 'rgba(183,9,76,0.12)',
    borderWidth: 1, borderColor: colors.primary,
  },
  roleBadgeText: { fontFamily: typography.fontLabel, fontSize: typography.size.xs, color: colors.primary, letterSpacing: 1.5 },
  dept: { fontFamily: typography.fontBody, fontSize: typography.size.sm, color: colors.textDim },

  infoCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  infoLabel: { fontFamily: typography.fontBody, fontSize: typography.size.sm, color: colors.textSecondary, flex: 1 },
  infoValue: { fontFamily: typography.fontLabel, fontSize: typography.size.sm, color: colors.textPrimary },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.danger,
    justifyContent: 'center',
    marginTop: 'auto',
  },
  logoutText: { fontFamily: typography.fontLabel, fontSize: typography.size.base, color: colors.danger },
});
