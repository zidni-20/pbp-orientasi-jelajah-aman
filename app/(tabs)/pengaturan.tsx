// app/(tabs)/pengaturan.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeMode, useTheme } from "../../context/ThemeContext";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { konfirmasiAksi } from "../../utils/alert";

export default function TabPengaturan() {
  const { theme, mode, setMode } = useTheme();
  const [pesan, setPesan] = useState<string | null>(null);

  async function prosesHapusSemuaCache() {
    await hapusSemuaCache();
    setPesan("Seluruh data cache cuaca offline berhasil dibersihkan.");
    setTimeout(() => setPesan(null), 4000);
  }

  function handleKonfirmasiHapusCache() {
    konfirmasiAksi(
      "Hapus Seluruh Cache?",
      "Seluruh data cuaca dan indeks kualitas udara yang tersimpan di perangkat akan dihapus. Kota favorit tidak akan terhapus.",
      prosesHapusSemuaCache,
      "Hapus Semua",
      "Batal",
    );
  }

  const opsiTema: {
    id: ThemeMode;
    label: string;
    keterangan: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      id: "light",
      label: "Mode Terang",
      keterangan: "Tampilan bersih dengan latar belakang cerah",
      icon: "sunny-outline",
    },
    {
      id: "dark",
      label: "Mode Gelap",
      keterangan: "Tampilan kontras tinggi yang nyaman untuk mata di malam hari",
      icon: "moon-outline",
    },
    {
      id: "system",
      label: "Ikuti Sistem",
      keterangan: "Mengikuti preferensi tampilan perangkat Anda secara otomatis",
      icon: "phone-portrait-outline",
    },
  ];

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bagian Pilihan Tema Tampilan */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="color-palette-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Tema Tampilan
            </Text>
          </View>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Pilih bagaimana antarmuka Jelajah Aman ditampilkan di perangkat Anda.
          </Text>

          <View style={styles.optionsList}>
            {opsiTema.map((item) => {
              const aktif = mode === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setMode(item.id)}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: aktif
                        ? theme.primaryLight
                        : theme.tagBackground,
                      borderColor: aktif ? theme.primary : theme.border,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: aktif }}
                  accessibilityLabel={`${item.label}: ${item.keterangan}`}
                >
                  <View style={styles.themeOptionLeft}>
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={aktif ? theme.primary : theme.textSecondary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.themeOptionLabel,
                          { color: aktif ? theme.primary : theme.text },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.themeOptionSub,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {item.keterangan}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name={
                      aktif ? "radio-button-on" : "radio-button-off-outline"
                    }
                    size={20}
                    color={aktif ? theme.primary : theme.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bagian Manajemen Data & Cache (Offline Storage) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="server-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Penyimpanan Offline & Cache
            </Text>
          </View>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Bersihkan seluruh salinan data cuaca lokal SQLite di perangkat Anda untuk
            mensimulasikan kondisi aplikasi baru (first-run) atau menghemat ruang.
          </Text>

          <TouchableOpacity
            onPress={handleKonfirmasiHapusCache}
            style={[
              styles.dangerButton,
              {
                backgroundColor: theme.dangerLight,
                borderColor: theme.danger,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
            <Text style={[styles.dangerButtonText, { color: theme.danger }]}>
              Hapus Data Cuaca Tersimpan
            </Text>
          </TouchableOpacity>

          {pesan && (
            <View
              style={[
                styles.pesanBox,
                { backgroundColor: theme.statusSegarBg },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={theme.statusSegarText}
              />
              <Text
                accessibilityLabel={pesan}
                style={[styles.pesanText, { color: theme.statusSegarText }]}
              >
                {pesan}
              </Text>
            </View>
          )}
        </View>

        {/* Info Aplikasi */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Informasi Aplikasi
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Nama Aplikasi:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              Jelajah Aman
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Versi:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              1.0.0 (MVP UTS)
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Penyimpanan Basis Data:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              SQLite (expo-sqlite v2)
            </Text>
          </View>
        </View>
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
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  optionsList: {
    gap: 10,
    marginTop: 4,
  },
  themeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  themeOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  themeOptionLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  themeOptionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  pesanBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  pesanText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
  },
});
