import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, font, radius, spacing } from "../theme";

interface Props {
  name: string;
  /** Menyalakan titik di atas lonceng kalau ada peringatan belum dibaca */
  hasAlerts?: boolean;
}

/**
 * Bar putih di paling atas, sama di semua layar.
 *
 * Avatar memakai ikon daun, bukan foto orang seperti di desain — foto di
 * desain masih bawaan template dan tidak cocok untuk aplikasi pertanian.
 */
export function AppHeader({ name, hasAlerts = false }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.identity}
        onPress={() => router.push("/profil")}
        accessibilityRole="button"
        accessibilityLabel="Buka profil"
      >
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="sprout" size={24} color={colors.lime} />
        </View>
        <View>
          <Text style={styles.greeting}>Hello!</Text>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.push("/notifikasi")}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Buka notifikasi"
      >
        <MaterialCommunityIcons name="bell" size={28} color={colors.ink} />
        {hasAlerts && <View style={styles.badge} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexShrink: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: font.size.label,
    color: colors.ink,
  },
  name: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: "#7B3FF2",
  },
});
