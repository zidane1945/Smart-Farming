import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { ScreenTitle } from "@/components/ScreenTitle";
import { useAuth } from "@/context/auth";
import { API_URL } from "@/api/client";
import { DEVICE_ID, useDevice } from "@/context/device";
import { colors, font, radius, shadow, spacing } from "@/theme";

export default function ProfilScreen() {
  const { user, signOut } = useAuth();
  const { alerts, connected } = useDevice();
  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <AppHeader name={user?.name ?? "Smart Farming"} hasAlerts={alerts.length > 0} />

      <ScrollView style={styles.panel} contentContainerStyle={styles.content}>
        <ScreenTitle title="Profil" subtitle="Akun dan informasi aplikasi" />

        <View style={styles.card}>
          <Row label="Nama" value={user?.name ?? "-"} />
          <Row label="Email" value={user?.email ?? "-"} />
        </View>

        <Text style={styles.sectionTitle}>Koneksi</Text>
        <View style={styles.card}>
          <Row label="Server" value={API_URL} />
          <Row label="Perangkat" value={DEVICE_ID} />
          <Row label="Realtime" value={connected ? "Terhubung" : "Terputus"} />
        </View>

        <Pressable
          style={styles.logout}
          onPress={() => setConfirmVisible(true)}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="logout" size={22} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>

      {/* Dialog konfirmasi, mengikuti Konfir Log.png tapi memakai gaya
          layar inti — bukan gaya ungu bawaan template. */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Yakin mau keluar?</Text>
            <Text style={styles.dialogBody}>
              Anda akan keluar dari akun ini dan kembali ke halaman masuk.
            </Text>

            <View style={styles.dialogActions}>
              <Pressable
                style={[styles.dialogButton, styles.dialogCancel]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.dialogButtonText}>Batal</Text>
              </Pressable>
              <Pressable
                style={[styles.dialogButton, styles.dialogConfirm]}
                onPress={() => {
                  setConfirmVisible(false);
                  void signOut();
                }}
              >
                <Text style={styles.dialogButtonText}>Keluar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  panel: { flex: 1, backgroundColor: colors.primary },
  content: { paddingBottom: spacing.xxl, gap: spacing.lg },
  sectionTitle: {
    paddingHorizontal: spacing.screen,
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: colors.surface,
  },
  card: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    ...shadow.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: font.size.label, color: colors.muted },
  rowValue: {
    flexShrink: 1,
    fontSize: font.size.label,
    fontWeight: font.weight.semibold,
    color: colors.ink,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    marginHorizontal: spacing.screen,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    ...shadow.card,
  },
  logoutText: {
    fontSize: font.size.body,
    fontWeight: font.weight.bold,
    color: colors.danger,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(16,32,28,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.screen,
  },
  dialog: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  dialogTitle: {
    fontSize: font.size.heading,
    fontWeight: font.weight.bold,
    color: colors.surface,
    textAlign: "center",
  },
  dialogBody: {
    fontSize: font.size.body,
    color: colors.surface,
    opacity: 0.9,
    textAlign: "center",
    lineHeight: 22,
  },
  dialogActions: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  dialogButton: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dialogCancel: {},
  dialogConfirm: { backgroundColor: "rgba(255,255,255,0.4)" },
  dialogButtonText: {
    fontSize: font.size.body,
    fontWeight: font.weight.bold,
    color: colors.surface,
  },
});
