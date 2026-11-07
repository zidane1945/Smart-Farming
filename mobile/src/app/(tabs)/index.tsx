import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THRESHOLDS } from "@shared/thresholds";
import { AppHeader } from "@/components/AppHeader";
import { SensorCard } from "@/components/SensorCard";
import { SoilStatusCard } from "@/components/SoilStatusCard";
import { StateBanner } from "@/components/StateBanner";
import { useAuth } from "@/context/auth";
import { useDevice } from "@/context/device";
import { colors, font, radius, shadow, spacing } from "@/theme";

export default function BerandaScreen() {
  const router = useRouter();
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
        {!reading ? (
          <StateBanner
            kind={loading ? "loading" : error ? "error" : "waiting"}
            message={
              loading
                ? "Memuat data sensor..."
                : (error ?? "Menunggu data dari perangkat")
            }
            onRetry={loading ? undefined : () => void refresh()}
          />
        ) : (
          <>
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.eyebrow}>LIVE DATA</Text>
                <Text style={styles.heading}>Kondisi saat ini</Text>
              </View>
              <Pressable onPress={() => router.push("/tanaman")} hitSlop={8}>
                <Text style={styles.link}>Lihat detail</Text>
              </Pressable>
            </View>

            <View style={styles.row}>
              <SensorCard
                label="Suhu"
                value={reading.temperature}
                unit="°C"
                icon="thermometer"
                chip="temperature"
                range={THRESHOLDS.temperature}
                max={50}
              />
              <SensorCard
                label="Kelembapan Udara"
                value={reading.humidity}
                unit="%"
                icon="water-outline"
                chip="humidity"
                range={THRESHOLDS.humidity}
              />
            </View>

            <View style={styles.row}>
              <SensorCard
                label="Kelembapan Tanah"
                value={reading.soil_moisture}
                unit="%"
                icon="waves"
                chip="soil"
                range={THRESHOLDS.soil_moisture}
              />
              <SensorCard
                label="Intensitas Cahaya"
                value={reading.light_intensity}
                unit="%"
                icon="lightbulb-outline"
                chip="light"
                range={THRESHOLDS.light_intensity}
              />
            </View>

            <SoilStatusCard status={reading.soil_status} />

            <Pressable style={styles.actuator} onPress={() => router.push("/kontrol")}>
              <View style={styles.actuatorIcon}>
                <MaterialCommunityIcons
                  name={reading.buzzer ? "volume-high" : "volume-off"}
                  size={24}
                  color={reading.buzzer ? colors.danger : colors.muted}
                />
              </View>
              <View style={styles.actuatorText}>
                <Text style={styles.caption}>Kontrol aktuator</Text>
                <Text style={styles.actuatorTitle}>
                  {reading.buzzer ? "Buzzer sedang aktif" : "Buzzer sedang mati"}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.muted}
              />
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  panel: {
    flex: 1,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  content: {
    padding: spacing.screen,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  eyebrow: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: font.size.heading,
    fontWeight: font.weight.bold,
    color: colors.surface,
  },
  link: {
    fontSize: font.size.label,
    fontWeight: font.weight.semibold,
    color: colors.surface,
  },
  row: { flexDirection: "row", gap: spacing.lg },
  actuator: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  actuatorIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actuatorText: { flex: 1, gap: 2 },
  caption: { fontSize: font.size.label, color: colors.muted },
  actuatorTitle: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
});
