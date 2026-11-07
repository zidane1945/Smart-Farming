import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { Range } from "@shared/thresholds";
import { colors, font, radius, sensorChip, shadow, spacing } from "../theme";

type ChipKey = keyof typeof sensorChip;

interface Props {
  label: string;
  value: number;
  unit: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  chip: ChipKey;
  /** Rentang normal, dipakai untuk mengisi bar di bawah angka */
  range: Range;
  /** Nilai maksimum skala bar; default 100 */
  max?: number;
  /** Titik hidup kecil di pojok kanan atas kartu */
  live?: boolean;
}

export function SensorCard({
  label,
  value,
  unit,
  icon,
  chip,
  range,
  max = 100,
  live = true,
}: Props) {
  const palette = sensorChip[chip];
  const ratio = Math.max(0, Math.min(1, value / max));

  // Bar berubah warna saat nilai keluar dari rentang normal, supaya kondisi
  // tidak wajar terlihat tanpa pengguna harus membaca angkanya.
  const inRange = value >= range.low && value <= range.high;
  const barColor = inRange ? colors.success : colors.danger;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.chip, { backgroundColor: palette.bg }]}>
          <MaterialCommunityIcons name={icon} size={24} color={palette.fg} />
        </View>
        {live && (
          <MaterialCommunityIcons
            name="access-point"
            size={18}
            color={colors.muted}
          />
        )}
      </View>

      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>

      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: barColor }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.card,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: font.size.label,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  value: {
    fontSize: font.size.display,
    fontWeight: font.weight.bold,
    color: colors.ink,
    lineHeight: 40,
  },
  unit: {
    fontSize: font.size.label,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
  },
});
