/**
 * Design token aplikasi.
 *
 * Nilai warna diambil dari docs/UI-UX/README.md — hasil pengambilan pixel
 * langsung dari export Figma, jadi sudah persis sama dengan desain. Ukuran
 * huruf, radius, dan jarak belum ditetapkan di Figma (lihat README bagian
 * "Tipografi dan bentuk"), jadi di sini dipakai perkiraan dari proporsi
 * gambar sampai Rifki melengkapinya.
 *
 * Semua layar membaca token dari berkas ini. Jangan menulis hex atau angka
 * jarak langsung di dalam StyleSheet layar.
 */

import { Platform } from "react-native";

export const colors = {
  /** Panel biru besar, latar utama semua layar. */
  primary: "#336EE4",
  /** Teks "LIVE DATA" dan subjudul kuning di header. */
  accent: "#FFF600",

  /** Kartu sensor, kartu kontrol, navigasi bawah. */
  surface: "#FFFFFF",
  /** Teks utama dan angka sensor. */
  ink: "#203D34",
  /** Label sensor dan teks sekunder. */
  muted: "#8B9D94",
  /** Garis pemisah dan latar track progress bar. */
  border: "#E3EAE6",

  /** Progress bar dan teks pill status. */
  success: "#79AA60",
  /** Latar pill "NORMAL". */
  successBg: "#DDF0D1",
  /** Latar kartu status kondisi tanah. */
  successSoft: "#F3FAF0",

  /** Nilai sensor di luar rentang normal, buzzer aktif, tombol logout. */
  danger: "#D9534F",
  /** Latar banner dan pill peringatan. */
  dangerBg: "#FDECEA",

  /** Banner informasi netral, mis. "menunggu data". */
  info: "#336EE4",
  infoBg: "#E8F0FD",

  /** Baris kepala tabel riwayat. */
  tableHeader: "#ECF6E8",
  /** Kartu hijau tua di Status Tanaman. */
  forest: "#2B5E48",
  /** Bar progress di dalam kartu hijau tua. */
  lime: "#B9E45B",

  /** Latar tab yang sedang aktif. */
  tabActiveBg: "#EFEFEF",
  /** Ikon dan label tab aktif. */
  tabActiveInk: "#194D38",
} as const;

/**
 * Warna chip ikon pada kartu sensor — lembut dan berbeda per sensor, supaya
 * keempat kartu bisa dibedakan sekilas tanpa membaca labelnya.
 */
export const sensorChip = {
  temperature: { bg: "#FFF6ED", fg: "#E08A3C" },
  humidity: { bg: "#E8F0FD", fg: "#336EE4" },
  soil: { bg: "#A2E3D0", fg: "#1F6B55" },
  light: { bg: "#FFFAE9", fg: "#C9A227" },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  /** Padding kiri-kanan isi layar. */
  screen: 20,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  /** Untuk pill dan track progress — cukup besar agar selalu membulat penuh. */
  pill: 999,
} as const;

export const font = {
  size: {
    caption: 12,
    label: 13,
    body: 15,
    title: 18,
    heading: 22,
    /** Angka besar pada kartu sensor. */
    display: 32,
  },
  weight: {
    semibold: "600",
    bold: "700",
  },
} as const;

/**
 * Bayangan kartu.
 *
 * iOS dan Android memakai properti yang berbeda, jadi keduanya disetel di
 * sini sekali saja — layar cukup menyebar `...shadow.card`.
 */
export const shadow = {
  card: Platform.select({
    ios: {
      shadowColor: "#203D34",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 3 },
    default: {},
  }),
} as const;
