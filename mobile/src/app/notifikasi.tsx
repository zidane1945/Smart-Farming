import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { ScreenTitle } from "@/components/ScreenTitle";
import { useAuth } from "@/context/auth";
import { useDevice } from "@/context/device";
import { colors, font, radius, shadow, spacing } from "@/theme";

function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;
  const hours = Math.floor(minutes / 60);
  return `${hours} jam yang lalu`;
}

export default function NotifikasiScreen() {
  const { user } = useAuth();
  const { alerts } = useDevice();

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <AppHeader name={user?.name ?? "Smart Farming"} hasAlerts={alerts.length > 0} />

      <ScrollView style={styles.panel} contentContainerStyle={styles.content}>
        <ScreenTitle title="Notifikasi" subtitle="Peringatan dari perangkat" />

        {alerts.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={48}
              color={colors.surface}
            />
            <Text style={styles.emptyText}>Belum ada notifikasi</Text>
            <Text style={styles.emptyHint}>
              Peringatan muncul di sini saat kelembapan tanah turun di bawah ambang
              kering.
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View key={alert.receivedAt} style={styles.card}>
              <Text style={styles.caption}>Tanaman Berkata</Text>
              <Text style={styles.title}>Ayo waktunya menyiram tanaman</Text>
              <Text style={styles.body}>{alert.message}</Text>
              <Text style={styles.time}>{timeAgo(alert.receivedAt)}</Text>
            </View>
          ))
        )}

        <View style={styles.note}>
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={colors.surface}
          />
          <Text style={styles.noteText}>
            Notifikasi hanya tersimpan selama aplikasi terbuka. Backend belum
            menyimpan riwayat notifikasi.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  panel: { flex: 1, backgroundColor: colors.primary },
  content: { paddingBottom: spacing.xxl, gap: spacing.lg },
  card: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadow.card,
  },
  caption: { fontSize: font.size.label, color: colors.muted },
  title: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  body: { fontSize: font.size.label, color: colors.ink },
  time: { fontSize: font.size.caption, color: colors.muted, marginTop: spacing.sm },
  empty: {
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: colors.surface,
  },
  emptyHint: {
    fontSize: font.size.label,
    color: colors.surface,
    opacity: 0.85,
    textAlign: "center",
    lineHeight: 20,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginHorizontal: spacing.screen,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  noteText: {
    flex: 1,
    fontSize: font.size.caption,
    color: colors.surface,
    lineHeight: 18,
  },
});
