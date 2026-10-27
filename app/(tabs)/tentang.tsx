// app/(tabs)/tentang.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function TabTentang() {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Ionicons name="cloud-done" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>
            Jelajah Aman
          </Text>
          <Text style={[styles.appVersion, { color: theme.textSecondary }]}>
            Versi 1.0.0 (MVP Siap UTS)
          </Text>
          <Text style={[styles.appDesc, { color: theme.textSecondary }]}>
            Aplikasi informasi cuaca dan indeks kualitas udara berbasis
            pendekatan Offline-First, SQLite Cache, dan deteksi lokasi terkini.
          </Text>
        </View>

        {/* Informasi Ujian & Mata Kuliah */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="school-outline" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Informasi Akademik
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Mata Kuliah:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              Pemrograman Berbasis Platform
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Institusi:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              UIN K.H. Abdurrahman Wahid Pekalongan
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Fakultas / Prodi:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              Sains & Teknologi / S1 Informatika
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Tugas Evaluasi:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              Ujian Tengah Semester (Pertemuan 8)
            </Text>
          </View>
        </View>

        {/* Fitur Utama */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Fitur Utama Aplikasi
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="cloudy-night-outline" size={18} color={theme.primary} />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Prakiraan Cuaca Real-Time & Kualitas Udara (European AQI)
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="server-outline" size={18} color={theme.primary} />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Offline-First SQLite Cache dengan Time To Live (TTL 30 menit)
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="location-outline" size={18} color={theme.primary} />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Deteksi GPS Otomatis (Izin Foreground aman)
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="time-outline" size={18} color={theme.primary} />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Riwayat 10 Pencarian Terakhir & Daftar Kota Favorit
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={18}
              color={theme.primary}
            />
            <Text style={[styles.featureText, { color: theme.text }]}>
              Dukungan Tema Gelap & Terang Dinamis
            </Text>
          </View>
        </View>

        {/* Atribusi Sumber Data */}
        <TouchableOpacity
          onPress={() => Linking.openURL("https://open-meteo.com/")}
          style={[
            styles.attributionCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons name="link-outline" size={20} color={theme.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.attributionTitle, { color: theme.text }]}>
              Data Cuaca oleh Open-Meteo.com
            </Text>
            <Text style={[styles.attributionSub, { color: theme.textSecondary }]}>
              API gratis & terbuka tanpa memerlukan API Key.
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  heroCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  appDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    flex: 1,
  },
  attributionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  attributionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  attributionSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
