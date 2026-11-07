import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, font, radius, spacing } from "../theme";

interface Props {
  kind: "loading" | "waiting" | "error";
  message: string;
  onRetry?: () => void;
}

/**
 * Tampilan pengganti isi layar saat data belum ada.
 *
 * Dipisah dari layar supaya ketiga keadaan — sedang memuat, menunggu data
 * perangkat, dan gagal terhubung — terlihat berbeda bagi pengguna. Ketiganya
 * mudah tertukar kalau hanya ditampilkan sebagai layar kosong.
 */
export function StateBanner({ kind, message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      {kind === "loading" ? (
        <ActivityIndicator size="large" color={colors.surface} />
      ) : (
        <MaterialCommunityIcons
          name={kind === "waiting" ? "timer-sand" : "wifi-off"}
          size={48}
          color={colors.surface}
        />
      )}

      <Text style={styles.message}>{message}</Text>

      {onRetry && (
        <Pressable style={styles.retry} onPress={onRetry} accessibilityRole="button">
          <Text style={styles.retryText}>Coba lagi</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.screen,
  },
  message: {
    textAlign: "center",
    fontSize: font.size.body,
    color: colors.surface,
    lineHeight: 22,
  },
  retry: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  retryText: {
    fontSize: font.size.label,
    fontWeight: font.weight.bold,
    color: colors.primary,
  },
});
