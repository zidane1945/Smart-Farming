import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, font, radius, shadow, spacing } from "../theme";

interface Props {
  title: string;
  /** Baris kuning kecil di bawah judul */
  subtitle?: string;
  /** Tombol panah kembali di kiri judul */
  showBack?: boolean;
}

/** Judul di dalam panel biru, dengan tombol kembali seperti di desain. */
export function ScreenTitle({ title, subtitle, showBack = true }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showBack && (
        <Pressable
          style={styles.back}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.forest} />
        </Pressable>
      )}

      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  text: {
    flexShrink: 1,
  },
  title: {
    fontSize: font.size.heading,
    fontWeight: font.weight.bold,
    color: colors.surface,
  },
  subtitle: {
    fontSize: font.size.label,
    color: colors.accent,
    marginTop: 2,
  },
});
