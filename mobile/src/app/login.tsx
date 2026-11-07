import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiError } from "@/api/client";
import { useAuth } from "@/context/auth";
import { colors, font, radius, shadow, spacing } from "@/theme";

/**
 * Layar login.
 *
 * Belum ada di export Figma, jadi dibuat mengikuti gaya layar lain: panel
 * biru sebagai latar, kartu putih mengambang, tombol hijau. Lihat catatan
 * nomor 1 di docs/UI-UX/README.md.
 */
export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
      // Perpindahan layar diurus oleh pengalih di src/app/_layout.tsx.
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Terjadi kesalahan saat masuk",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <View style={styles.logo}>
              <MaterialCommunityIcons name="sprout" size={40} color={colors.lime} />
            </View>
            <Text style={styles.brandTitle}>Smart Farming</Text>
            <Text style={styles.brandSubtitle}>Pantau kondisi tanaman Anda</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Masuk</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="petani@smartfarm.id"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                editable={!submitting}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.flex}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!submitting}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="go"
                />
                <Pressable
                  onPress={() => setShowPassword((shown) => !shown)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={colors.muted}
                  />
                </Pressable>
              </View>
            </View>

            {error && (
              <View style={styles.error}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.danger}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={[styles.button, !canSubmit && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
            >
              {submitting ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.buttonText}>Masuk</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.footer}>Kelompok 3 · Workshop Mobile App</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.screen,
    gap: spacing.xxl,
  },
  brand: { alignItems: "center", gap: spacing.sm },
  logo: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  brandTitle: {
    fontSize: font.size.heading,
    fontWeight: font.weight.bold,
    color: colors.surface,
  },
  brandSubtitle: { fontSize: font.size.body, color: colors.accent },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadow.card,
  },
  cardTitle: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  field: { gap: spacing.sm },
  label: { fontSize: font.size.label, color: colors.muted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: font.size.body,
    color: colors.ink,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  error: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { flex: 1, fontSize: font.size.label, color: colors.danger },
  button: {
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    fontSize: font.size.body,
    fontWeight: font.weight.bold,
    color: colors.surface,
  },
  footer: {
    textAlign: "center",
    fontSize: font.size.caption,
    color: colors.surface,
    opacity: 0.8,
  },
});
