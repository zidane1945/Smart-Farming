import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors, font, radius, spacing } from "@/theme";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: "index", title: "Beranda", icon: "home-variant-outline" },
  { name: "monitoring", title: "Monitoring", icon: "chart-line" },
  { name: "kontrol", title: "Kontrol", icon: "tune-variant" },
  { name: "riwayat", title: "Riwayat", icon: "history" },
  { name: "tanaman", title: "Tanaman", icon: "sprout-outline" },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActiveInk,
        tabBarInactiveTintColor: colors.muted,
        tabBarActiveBackgroundColor: colors.tabActiveBg,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          height: 72,
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
          paddingHorizontal: spacing.sm,
        },
        // Latar abu pada tab aktif, seperti di desain.
        tabBarItemStyle: {
          borderRadius: radius.md,
          marginHorizontal: 2,
        },
        tabBarLabelStyle: {
          fontSize: font.size.caption,
          fontWeight: font.weight.semibold,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name={tab.icon}
                size={24}
                color={focused ? colors.tabActiveInk : colors.muted}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
