import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "../../components/ui/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { SectionLabel } from "../../components/ui/SectionLabel";
import { authApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { colors, typography, spacing } from "../../constants/tokens";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await authApi.login(email.trim().toLowerCase(), password);
      const { accessToken, user } = res.data.data;
      await setAuth(user, accessToken);
      if (user.role === "STAFF") {
        router.replace("/(staff)/requests");
      } else {
        router.replace("/(admin)/dashboard");
      }
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen noPadding>
      {/* Gradient header band */}
      <LinearGradient
        colors={["#b7094c", "#723c70", "#0091ad"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBand}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topSection}>
            <SectionLabel primary>Staff Access</SectionLabel>
            <Text style={styles.headline}>Welcome{"\n"}back.</Text>
            <Text style={styles.sub}>
              Sign in with your hotel credentials to continue.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="staff@hotel.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              containerStyle={{ marginTop: spacing.md }}
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Button
              title="Sign In"
              variant="gradient"
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.xl }}
              onPress={handleLogin}
            />

            {/* Guest link */}
            <TouchableOpacity
              style={styles.guestLink}
              onPress={() => router.replace("/(guest)/login")}
            >
              <Text style={styles.guestLinkText}>
                Guest? Tap here to access your stay →
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBand: { height: 6 },
  content: { flexGrow: 1, padding: 24, justifyContent: "space-between" },
  topSection: { marginTop: 48, gap: 12 },
  headline: {
    fontFamily: "Inter_700Bold",
    fontSize: 42,
    color: colors.textPrimary,
    lineHeight: 46,
    marginTop: 8,
  },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: { gap: 0, paddingBottom: 40 },
  error: {
    fontFamily: "Inter_400Regular",
    fontSize: typography.size.sm,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  guestLink: { marginTop: spacing.xl, alignItems: "center" },
  guestLinkText: {
    fontFamily: "Inter_500Medium",
    fontSize: typography.size.sm,
    color: colors.secondary,
  },
});
