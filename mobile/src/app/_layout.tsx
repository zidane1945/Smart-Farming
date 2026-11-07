import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "@/context/auth";
import { DeviceProvider } from "@/context/device";
import { colors } from "@/theme";

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    void SplashScreen.hideAsync();

    const onLoginScreen = segments[0] === "login";

    if (!user && !onLoginScreen) router.replace("/login");
    else if (user && onLoginScreen) router.replace("/");
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.surface} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.primary } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="notifikasi" />
      <Stack.Screen name="profil" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <DeviceProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </DeviceProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
