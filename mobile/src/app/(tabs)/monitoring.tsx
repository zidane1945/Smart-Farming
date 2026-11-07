import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { ScreenTitle } from "@/components/ScreenTitle";
import { useAuth } from "@/context/auth";
import { useDevice } from "@/context/device";
import { colors, font, radius, shadow, spacing } from "@/theme";

/**
 * Layar monitoring kamera — TAMPILAN DEMO, BUKAN FITUR NYATA.
 *
 * Isi layar ini tidak terhubung ke perangkat mana pun. ESP32-CAM dan deteksi
 * kesehatan daun berada di luar ruang lingkup PRD, dan sudah disepakati untuk
 * dibuat sebagai ilustrasi saja (lihat docs/UI-UX/README.md temuan nomor 3).
 *
 * Label "Mode demo" dan "CONTOH" di bawah ini sengaja ditampilkan supaya tidak
 * ada yang mengira data ini nyata. JANGAN DIHAPUS.
 */

const SAMPLE = {
  plant: "Tanaman cabai · Pot 01",
  takenAt: "24 Okt · 09:41 WIB",
  verdict: "Sehat / Subur",
  note: "Daun tampak hijau dan segar. Tidak terlihat tepi kecokelatan atau tanda daun mengering.",
  reports: [
    { date: "24 Okt 2026 · 09:41 WIB", place: "Pot 01 · Pemeriksaan pagi", verdict: "Sehat / Subur" },
    { date: "23 Okt 2026 · 17:20 WIB", place: "Pot 01 · Pemeriksaan sore", verdict: "Sehat / Subur" },
  ],
};

export default function MonitoringScreen() {
  const { user } = useAuth();
  const { alerts } = useDevice();

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <AppHeader name={user?.name ?? "Smart Farming"} hasAlerts={alerts.length > 0} />

      <ScrollView style={styles.panel} contentContainerStyle={styles.content}>
        <ScreenTitle title="Monitoring kamera" subtitle="Pemeriksaan visual tanaman" />

        <View style={styles.notice}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={colors.forest}
          />
          <Text style={styles.noticeText}>Mode demo · Gambar dan hasil ilustrasi</Text>
        </View>

        <View style={styles.cameraCard}>
          <View style={styles.cameraHead}>
            <View style={styles.cameraTitle}>
              <MaterialCommunityIcons name="camera" size={20} color={colors.forest} />
              <Text style={styles.cameraName}>ESP32-CAM</Text>
            </View>
            <View style={styles.cameraStatus}>
              <View style={styles.dot} />
              <Text style={styles.caption}>Simulasi terhubung</Text>
            </View>
          </View>

          {/* Tempat gambar. Untuk presentasi, taruh foto tanaman di
              assets/images/contoh-tanaman.jpg lalu ganti View ini dengan
              <Image source={require(...)} style={styles.photo} />. */}
          <View style={styles.photo}>
            <MaterialCommunityIcons name="leaf" size={56} color={colors.lime} />
            <View style={styles.photoTag}>
              <Text style={styles.photoTagText}>CONTOH TANGKAPAN</Text>
            </View>
          </View>

          <View style={styles.cameraFoot}>
            <Text style={styles.caption}>{SAMPLE.plant}</Text>
            <Text style={styles.captionStrong}>{SAMPLE.takenAt}</Text>
          </View>
        </View>

        <View style={styles.result}>
          <View style={styles.resultHead}>
            <View style={styles.flex}>
              <Text style={styles.resultEyebrow}>HASIL DETEKSI · CONTOH</Text>
              <Text style={styles.resultVerdict}>{SAMPLE.verdict}</Text>
            </View>
            <View style={styles.resultBadge}>
              <MaterialCommunityIcons name="leaf" size={28} color={colors.lime} />
            </View>
          </View>

          <View style={styles.choices}>
            <View style={[styles.choice, styles.choiceActive]}>
              <MaterialCommunityIcons name="check" size={18} color={colors.forest} />
              <Text style={styles.choiceActiveText}>Sehat / Subur</Text>
            </View>
            <View style={styles.choice}>
              <Text style={styles.choiceText}>Kering</Text>
            </View>
          </View>

          <Text style={styles.resultNote}>{SAMPLE.note}</Text>
        </View>

        <View style={styles.tip}>
          <View style={styles.tipIcon}>
            <MaterialCommunityIcons name="sprout" size={22} color={colors.success} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.tipTitle}>Pertahankan perawatan rutin</Text>
            <Text style={styles.caption}>
              Cek kelembapan tanah sebelum menyiram. Pantau daun kembali secara berkala.
            </Text>
          </View>
        </View>

        <View style={styles.reportsHead}>
          <Text style={styles.sectionTitle}>Laporan terbaru</Text>
        </View>
        <Text style={styles.reportsNote}>
          Riwayat contoh · Bukan pembacaan perangkat nyata
        </Text>

        {SAMPLE.reports.map((report) => (
          <View key={report.date} style={styles.report}>
            <View style={styles.reportIcon}>
              <MaterialCommunityIcons name="leaf" size={20} color={colors.success} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.reportDate}>{report.date}</Text>
              <Text style={styles.caption}>{report.place}</Text>
            </View>
            <View style={styles.reportPill}>
              <Text style={styles.reportPillText}>{report.verdict}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  panel: { flex: 1, backgroundColor: colors.primary },
  content: { paddingBottom: spacing.xxl, gap: spacing.lg },
  flex: { flex: 1 },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.screen,
    backgroundColor: colors.successSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  noticeText: { fontSize: font.size.label, color: colors.ink },
  cameraCard: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadow.card,
  },
  cameraHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  cameraTitle: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  cameraName: {
    fontSize: font.size.body,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  cameraStatus: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
  },
  photo: {
    height: 200,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  photoTag: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    backgroundColor: "rgba(16,48,36,0.85)",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  photoTagText: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    color: colors.surface,
    letterSpacing: 0.5,
  },
  cameraFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  caption: { fontSize: font.size.label, color: colors.muted },
  captionStrong: {
    fontSize: font.size.label,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  result: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.forest,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  resultHead: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  resultEyebrow: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    color: colors.surface,
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  resultVerdict: {
    fontSize: font.size.heading,
    fontWeight: font.weight.bold,
    color: colors.surface,
  },
  resultBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  choices: { flexDirection: "row", gap: spacing.md },
  choice: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  choiceActive: { backgroundColor: colors.lime },
  choiceActiveText: {
    fontSize: font.size.label,
    fontWeight: font.weight.bold,
    color: colors.forest,
  },
  choiceText: { fontSize: font.size.label, color: colors.surface, opacity: 0.9 },
  resultNote: {
    fontSize: font.size.body,
    color: colors.surface,
    opacity: 0.92,
    lineHeight: 22,
  },
  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginHorizontal: spacing.screen,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: {
    fontSize: font.size.body,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  reportsHead: { paddingHorizontal: spacing.screen },
  sectionTitle: {
    fontSize: font.size.title,
    fontWeight: font.weight.bold,
    color: colors.surface,
  },
  reportsNote: {
    paddingHorizontal: spacing.screen,
    marginTop: -spacing.md,
    fontSize: font.size.caption,
    color: colors.accent,
  },
  report: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginHorizontal: spacing.screen,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  reportDate: {
    fontSize: font.size.label,
    fontWeight: font.weight.bold,
    color: colors.ink,
  },
  reportPill: {
    backgroundColor: colors.successBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  reportPillText: {
    fontSize: font.size.caption,
    fontWeight: font.weight.bold,
    color: colors.success,
  },
});
