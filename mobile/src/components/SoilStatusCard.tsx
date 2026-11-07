import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { SoilStatus } from "@shared/types";
import { colors, font, radius, shadow, spacing } from "../theme";

interface Props {
  status: SoilStatus;
  /** Tampilkan baris "Kelembapan tanah: NN%" di bawah judul */
  moisture?: number;
  /** Kartu putih dipakai di layar Kontrol, kartu berwarna di Beranda */
  variant?: "tinted" | "plain";
}

const PRESET: Record<
  SoilStatus,
  { title: string; pill: string; fg: string; bg: string; soft: string }
> = {
  normal: {
    title: "Kondisi Tanah Normal",
    pill: "NORMAL",
    fg: colors.success,
    bg: colors.successBg,
    soft: colors.successSoft,
  },
  kering: {
    title: "Tanah Kering",
    pill: "KERING",
    fg: colors.danger,
    bg: colors.dangerBg,
    soft: colors.dangerBg,
  },
  basah: {
    title: "Tanah Terlalu Basah",
    pill: "BASAH",
    fg: colors.info,
    bg: colors.infoBg,
    soft: colors.infoBg,
  },
};

export function SoilStatusCard({ status, moisture, variant = "tinted" }: Props) {
  const preset = PRESET[status];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: variant === "tinted" ? preset.soft : colors.surface },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: preset.bg }]}>
        <MaterialCommunityIcons name="sprout" size={24} color={preset.fg} />
      </View>

      <View style={styles.text}>
        <Text style={styles.caption}>Status kondisi tanah</Text>
        <Text style={styles.title}>{preset.title}</Text>
        {moisture !== undefined && (
          <Text style={styles.caption}>Kelembapan tanah: {moisture}%</Text>
        )}
      </View>

      <View style={[styles.pill, { backgroundColor: preset.bg }]}>
        <Text style={[styles.pillText, { color: preset.fg }]}>{preset.pill}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
  caption: { fontSize: font.size.label, color: colors.muted },
  title: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pillText: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    letterSpacing: 0.5,
  },
});
