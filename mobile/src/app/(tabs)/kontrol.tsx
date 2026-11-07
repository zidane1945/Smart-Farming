import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BuzzerAction } from "@shared/types";
import { ApiError } from "@/api/client";
import { sendBuzzerCommand } from "@/api/devices";
import { AppHeader } from "@/components/AppHeader";
import { ScreenTitle } from "@/components/ScreenTitle";
import { SoilStatusCard } from "@/components/SoilStatusCard";
import { StateBanner } from "@/components/StateBanner";
import { useAuth } from "@/context/auth";
import { DEVICE_ID, useDevice } from "@/context/device";
import { colors, font, radius, shadow, spacing } from "@/theme";

/**
 * AUTO tidak ada di desain Figma, yang hanya menyediakan ON dan OFF.
 *
 * Tombol ini ditambahkan karena tanpanya, sekali pengguna menekan OFF alarm
 * tanah kering mati selamanya — fungsi utama alat jadi hilang. AUTO
 * mengembalikan buzzer ke kendali otomatis ESP32. Lihat docs/UI-UX/README.md.
 */
const ACTIONS: { action: BuzzerAction; label: string }[] = [
  { action: "ON", label: "ON" },
  { action: "OFF", label: "OFF" },
  { action: "AUTO", label: "AUTO" },
];

export default function KontrolScreen() {
  const { user } = useAuth();
  const { reading, loading, error, alerts, refresh } = useDevice();

  const [pending, setPending] = useState<BuzzerAction | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const lastSentRef = useRef<BuzzerAction | null>(null);

  // Command yang berhasil dikirim belum berarti buzzer sudah berbunyi.
  // Konfirmasi sebenarnya datang dari telemetry berikutnya, jadi keadaan
  // "menunggu" baru dilepas setelah nilai buzzer cocok dengan yang diminta.
  useEffect(() => {
    if (!reading || !pending) return;

    const confirmed =
      (pending === "ON" && reading.buzzer) ||
      (pending === "OFF" && !reading.buzzer) ||
      pending === "AUTO";

    if (confirmed) {
      setPending(null);
      setFeedback(null);
    }
  }, [reading, pending]);

  async function handlePress(action: BuzzerAction) {
    setPending(action);
    setFeedback(null);
    lastSentRef.current = action;

    try {
      await sendBuzzerCommand(DEVICE_ID, action);
    } catch (err) {
      setPending(null);
      setFeedback(
        err instanceof ApiError ? err.message : "Command gagal dikirim",
      );
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <AppHeader name={user?.name ?? "Smart Farming"} hasAlerts={alerts.length > 0} />

      <ScrollView style={styles.panel} contentContainerStyle={styles.content}>
        <ScreenTitle title="Kontrol Buzzer" subtitle="Kendalikan aktuator perangkat" />

        {!reading ? (
          <StateBanner
            kind={loading ? "loading" : error ? "error" : "waiting"}
            message={
              loading ? "Memuat data perangkat..." : (error ?? "Menunggu data perangkat")
            }
            onRetry={loading ? undefined : () => void refresh()}
          />
        ) : (
          <>
            <SoilStatusCard
              status={reading.soil_status}
              moisture={reading.soil_moisture}
              variant="plain"
            />

            <View style={styles.card}>
              <View style={styles.bigIcon}>
                <MaterialCommunityIcons
                  name={reading.buzzer ? "volume-high" : "volume-off"}
                  size={48}
                  color={reading.buzzer ? colors.danger : colors.muted}
                />
              </View>

              <Text style={styles.caption}>STATUS BUZZER</Text>
              <Text style={styles.status}>
                {reading.buzzer ? "Aktif" : "Tidak Aktif"}
              </Text>
              <Text style={styles.hint}>
                {pending
                  ? `Menunggu konfirmasi dari perangkat (${pending})...`
                  : "Perintah dikirim langsung menuju ESP32."}
              </Text>

              <View style={styles.segment}>
                {ACTIONS.map(({ action, label }) => {
                  const active = pending
                    ? pending === action
                    : (action === "ON" && reading.buzzer) ||
                      (action === "OFF" && !reading.buzzer);

                  return (
                    <Pressable
                      key={action}
                      style={[styles.segmentItem, active && styles.segmentItemActive]}
                      onPress={() => void handlePress(action)}
                      disabled={pending !== null}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        style={[styles.segmentText, active && styles.segmentTextActive]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {feedback && (
              <View style={[styles.banner, styles.bannerError]}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={20}
                  color={colors.danger}
                />
                <Text style={[styles.bannerText, { color: colors.danger }]}>
                  {feedback}
                </Text>
              </View>
            )}

            <View style={styles.banner}>
              <MaterialCommunityIcons
                name="access-point"
                size={20}
                color={reading.state === "online" ? colors.success : colors.muted}
              />
              <Text style={styles.bannerText}>
                <Text style={styles.bannerStrong}>
                  {reading.state === "online"
                    ? "Perangkat terhubung. "
                    : "Perangkat terputus. "}
                </Text>
                Command diproses melalui gateway MQTT ke perangkat ESP32.
              </Text>
            </View>
          </>
        )}
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
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
    ...shadow.card,
  },
  bigIcon: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  caption: {
    fontSize: font.size.caption,
    color: colors.muted,
    letterSpacing: 1,
  },
  status: {
    fontSize: font.size.heading + 6,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  hint: {
    fontSize: font.size.label,
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  segment: {
    flexDirection: "row",
    alignSelf: "stretch",
    backgroundColor: colors.tabActiveBg,
    borderRadius: radius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
  },
  segmentItemActive: {
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  segmentText: {
    fontSize: font.size.body,
    fontWeight: font.weight.bold,
    color: colors.muted,
  },
  segmentTextActive: { color: colors.ink },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginHorizontal: spacing.screen,
    backgroundColor: colors.successSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  bannerError: { backgroundColor: colors.dangerBg },
  bannerText: { flex: 1, fontSize: font.size.label, color: colors.muted, lineHeight: 20 },
  bannerStrong: { fontWeight: font.weight.bold, color: colors.ink },
});
