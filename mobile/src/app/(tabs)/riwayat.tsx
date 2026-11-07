import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { HistoryReading } from "@shared/types";
import { ApiError } from "@/api/client";
import { getHistory } from "@/api/devices";
import { AppHeader } from "@/components/AppHeader";
import { ScreenTitle } from "@/components/ScreenTitle";
import { StateBanner } from "@/components/StateBanner";
import { useAuth } from "@/context/auth";
import { DEVICE_ID, useDevice } from "@/context/device";
import { colors, font, radius, shadow, spacing } from "@/theme";

/**
 * Pilihan rentang waktu.
 *
 * `bucket` menentukan berapa menit data dirata-ratakan. Telemetry masuk tiap
 * 5 detik, jadi tanpa peringkasan tabel akan berisi ratusan baris yang
 * nilainya hampir sama dan tidak ada gunanya dibaca.
 */
const RANGES = [
  { key: "today", label: "Hari ini", bucket: 5, limit: 12 },
  { key: "hour", label: "1 jam terakhir", bucket: 5, limit: 12 },
  { key: "raw", label: "Data mentah", bucket: undefined, limit: 30 },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

/** Timestamp sudah membawa waktu Jakarta, jadi cukup dipotong — bukan dikonversi. */
function toClock(timestamp: string): string {
  return timestamp.slice(11, 16);
}

export default function RiwayatScreen() {
  const { user } = useAuth();
  const { alerts, reading } = useDevice();

  const [rangeKey, setRangeKey] = useState<RangeKey>("today");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [rows, setRows] = useState<HistoryReading[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const range = RANGES.find((item) => item.key === rangeKey) ?? RANGES[0];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const from =
        range.key === "hour"
          ? new Date(Date.now() - 60 * 60 * 1000).toISOString()
          : undefined;

      const result = await getHistory(DEVICE_ID, {
        bucket: range.bucket,
        limit: range.limit,
        from,
      });
      setRows(result.readings);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  }, [range.key, range.bucket, range.limit]);

  useEffect(() => {
    void load();
  }, [load]);

  // Muat ulang begitu ada pembacaan baru, supaya tabel ikut bergerak.
  useEffect(() => {
    if (reading) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reading?.timestamp]);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <AppHeader name={user?.name ?? "Smart Farming"} hasAlerts={alerts.length > 0} />

      <ScrollView
        style={styles.panel}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => void load()} tintColor={colors.surface} />
        }
      >
        <ScreenTitle
          title="Riwayat Monitoring"
          subtitle="Riwayat pembacaan sensor tanaman"
        />

        <View style={styles.toolbar}>
          <Text style={styles.sectionTitle}>Data monitoring</Text>

          <Pressable
            style={styles.picker}
            onPress={() => setPickerOpen((open) => !open)}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={20}
              color={colors.ink}
            />
            <Text style={styles.pickerText}>{range.label}</Text>
            <MaterialCommunityIcons
              name={pickerOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.ink}
            />
          </Pressable>
        </View>

        {pickerOpen && (
          <View style={styles.pickerMenu}>
            {RANGES.map((item) => (
              <Pressable
                key={item.key}
                style={styles.pickerOption}
                onPress={() => {
                  setRangeKey(item.key);
                  setPickerOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    item.key === rangeKey && styles.pickerOptionActive,
                  ]}
                >
                  {item.label}
                </Text>
                {item.key === rangeKey && (
                  <MaterialCommunityIcons name="check" size={18} color={colors.success} />
                )}
              </Pressable>
            ))}
          </View>
        )}

        {loading && !rows ? (
          <StateBanner kind="loading" message="Memuat riwayat..." />
        ) : error ? (
          <StateBanner kind="error" message={error} onRetry={() => void load()} />
        ) : !rows || rows.length === 0 ? (
          <StateBanner
            kind="waiting"
            message="Belum ada data pada rentang waktu ini"
            onRetry={() => void load()}
          />
        ) : (
          <>
            <View style={styles.table}>
              <View style={styles.headRow}>
                <Text style={[styles.headCell, styles.colTime]}>Waktu</Text>
                <Text style={styles.headCell}>Suhu</Text>
                <Text style={styles.headCell}>Udara</Text>
                <Text style={styles.headCell}>Tanah</Text>
                <Text style={styles.headCell}>Cahaya</Text>
              </View>

              {rows.map((row, index) => (
                <View
                  key={`${row.timestamp}-${index}`}
                  style={[styles.row, index === rows.length - 1 && styles.rowLast]}
                >
                  <Text style={[styles.cellTime, styles.colTime]}>
                    {toClock(row.timestamp)}
                  </Text>
                  <Text style={styles.cell}>{row.temperature}°C</Text>
                  <Text style={styles.cell}>{row.humidity}%</Text>
                  <Text style={styles.cell}>{row.soil_moisture}%</Text>
                  <Text style={styles.cell}>{row.light_intensity}%</Text>
                </View>
              ))}
            </View>

            <View style={styles.summary}>
              <View style={styles.summaryText}>
                <Text style={styles.caption}>Ringkasan {range.label.toLowerCase()}</Text>
                <Text style={styles.summaryValue}>{rows.length} pembacaan sensor</Text>
              </View>
              <View style={styles.summaryIcon}>
                {loading ? (
                  <ActivityIndicator color={colors.success} />
                ) : (
                  <MaterialCommunityIcons name="history" size={24} color={colors.success} />
                )}
              </View>
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
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
  },
  sectionTitle: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: colors.surface,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadow.card,
  },
  pickerText: { fontSize: font.size.label, color: colors.ink },
  pickerMenu: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadow.card,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: { fontSize: font.size.body, color: colors.ink },
  pickerOptionActive: { fontWeight: font.weight.bold, color: colors.success },
  table: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadow.card,
  },
  headRow: {
    flexDirection: "row",
    backgroundColor: colors.tableHeader,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  headCell: {
    flex: 1,
    textAlign: "center",
    fontSize: font.size.label,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  row: {
    flexDirection: "row",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  colTime: { flex: 0.8 },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: font.size.label,
    color: colors.ink,
  },
  cellTime: {
    textAlign: "center",
    fontSize: font.size.label,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.screen,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  summaryText: { flex: 1, gap: 2 },
  caption: { fontSize: font.size.label, color: colors.muted },
  summaryValue: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
