import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THRESHOLDS } from "@shared/thresholds";
import type { SoilStatus } from "@shared/types";
import { AppHeader } from "@/components/AppHeader";
import { ScreenTitle } from "@/components/ScreenTitle";
import { StateBanner } from "@/components/StateBanner";
import { useAuth } from "@/context/auth";
import { useDevice } from "@/context/device";
import { colors, font, radius, shadow, spacing } from "@/theme";

const SOIL = THRESHOLDS.soil_moisture;

const COPY: Record<SoilStatus, { description: string; recommendation: string }> = {
  normal: {
    description:
      "Kelembapan tanah berada dalam rentang ideal. Tanaman tidak memerlukan penyiraman tambahan.",
    recommendation: "Belum perlu disiram",
  },
  kering: {
    description:
      "Kelembapan tanah berada di bawah ambang aman. Tanaman sebaiknya segera disiram.",
    recommendation: "Segera siram",
  },
  basah: {
    description:
      "Kelembapan tanah melebihi rentang ideal. Hentikan penyiraman sampai tanah kembali normal.",
    recommendation: "Jangan disiram dulu",
  },
};

export default function TanamanScreen() {
  const { user } = useAuth();
  const { reading, loading, error, alerts, refresh } = useDevice();

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <AppHeader name={user?.name ?? "Smart Farming"} hasAlerts={alerts.length > 0} />

      <ScrollView
        style={styles.panel}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => void refresh()}
            tintColor={colors.surface}
          />
        }
      >
        <ScreenTitle title="Status Tanaman" subtitle="ANALISIS THRESHOLD" />

        {!reading ? (
          <StateBanner
            kind={loading ? "loading" : error ? "error" : "waiting"}
            message={
              loading ? "Memuat kondisi tanaman..." : (error ?? "Menunggu data perangkat")
            }
            onRetry={loading ? undefined : () => void refresh()}
          />
        ) : (
          <View style={styles.card}>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="leaf" size={40} color={colors.lime} />
            </View>

            <Text style={styles.caption}>KONDISI SAAT INI</Text>
            <Text style={styles.description}>{COPY[reading.soil_status].description}</Text>

            <View style={styles.gauge}>
              <View style={styles.gaugeHead}>
                <Text style={styles.gaugeLabel}>Nilai saat ini</Text>
                <Text style={styles.gaugeValue}>{reading.soil_moisture}%</Text>
              </View>

              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    { width: `${Math.max(0, Math.min(100, reading.soil_moisture))}%` },
                  ]}
                />
              </View>

              {/* Angka dibaca dari shared/thresholds.ts, bukan ditulis ulang di
                  sini — kalau nanti berubah setelah kalibrasi sensor, tampilan
                  ikut menyesuaikan sendiri. */}
              <View style={styles.legend}>
                <Text style={styles.legendText}>KERING &lt; {SOIL.low}%</Text>
                <Text style={styles.legendText}>
                  IDEAL {SOIL.low}–{SOIL.high}%
                </Text>
                <Text style={styles.legendText}>BASAH &gt; {SOIL.high}%</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.footerBox}>
                <Text style={styles.footerLabel}>Rekomendasi</Text>
                <Text style={styles.footerValue}>
                  {COPY[reading.soil_status].recommendation}
                </Text>
              </View>
              <View style={styles.footerBox}>
                <Text style={styles.footerLabel}>Pembaruan</Text>
                <Text style={styles.footerValue}>
                  {reading.timestamp.slice(11, 16)} WIB
                </Text>
              </View>
            </View>
          </View>
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
    gap: spacing.lg,
    ...shadow.card,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: font.size.body,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 22,
  },
  gauge: {
    alignSelf: "stretch",
    backgroundColor: colors.forest,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  gaugeHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gaugeLabel: { fontSize: font.size.label, color: colors.surface, opacity: 0.85 },
  gaugeValue: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: colors.surface,
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.22)",
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.lime },
  legend: { flexDirection: "row", justifyContent: "space-between" },
  legendText: {
    fontSize: font.size.caption - 1,
    color: colors.surface,
    opacity: 0.8,
  },
  footer: { flexDirection: "row", alignSelf: "stretch", gap: spacing.md },
  footerBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  footerLabel: { fontSize: font.size.label, color: colors.muted },
  footerValue: {
    fontSize: font.size.body,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
});
