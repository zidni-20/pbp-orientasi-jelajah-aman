// app/(tabs)/riwayat.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import {
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
  ambilSemuaRiwayatPencarian,
  hapusRiwayatPencarian,
  hapusSemuaRiwayatPencarian,
  RiwayatPencarian,
} from "../../services/searchHistoryStorage";
import { RingkasanKotaTersimpan } from "../../types/cache";
import { KotaFavorit } from "../../types/favorit";
import { konfirmasiAksi } from "../../utils/alert";

type SegmenTampilan = "riwayat" | "favorit" | "cache";

export default function TabRiwayat() {
  const { theme } = useTheme();
  const [segmen, setSegmen] = useState<SegmenTampilan>("riwayat");
  const [daftarRiwayat, setDaftarRiwayat] = useState<RiwayatPencarian[]>([]);
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarCache, setDaftarCache] = useState<RingkasanKotaTersimpan[]>([]);

  const muatSemuaData = useCallback(async () => {
    const [riwayat, favorit, cache] = await Promise.all([
      ambilSemuaRiwayatPencarian(),
      ambilSemuaFavorit(),
      daftarKotaTersimpan(20),
    ]);
    setDaftarRiwayat(riwayat);
    setDaftarFavorit(favorit);
    setDaftarCache(cache);
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatSemuaData();
    }, [muatSemuaData]),
  );

  // 1. Aksi ketika item riwayat / favorit / cache diklik -> Buka di Beranda
  function bukaDiBeranda(kota: {
    id: number;
    nama: string;
    latitude: number;
    longitude: number;
    country?: string;
  }) {
    router.navigate({
      pathname: "/(tabs)",
      params: {
        kotaDipilih: JSON.stringify({
          id: kota.id,
          name: kota.nama,
          latitude: kota.latitude,
          longitude: kota.longitude,
          country: kota.country ?? "",
        }),
        timestamp: Date.now().toString(),
      },
    });
  }

  // 2. Penghapusan Riwayat Pencarian
  function handleHapusRiwayatItem(item: RiwayatPencarian) {
    konfirmasiAksi(
      "Hapus Riwayat Pencarian",
      `Hapus pencarian kota ${item.nama} dari daftar riwayat?`,
      async () => {
        await hapusRiwayatPencarian(item.id);
        setDaftarRiwayat((prev) => prev.filter((k) => k.id !== item.id));
      },
    );
  }

  function handleHapusSemuaRiwayat() {
    konfirmasiAksi(
      "Kosongkan Riwayat",
      "Apakah Anda yakin ingin menghapus seluruh 10 riwayat pencarian terakhir?",
      async () => {
        await hapusSemuaRiwayatPencarian();
        setDaftarRiwayat([]);
      },
      "Kosongkan",
    );
  }

  // 3. Penghapusan Favorit
  function handleHapusFavoritItem(kota: KotaFavorit) {
    konfirmasiAksi(
      "Hapus dari Favorit",
      `Hapus ${kota.nama} dari daftar kota favorit?`,
      async () => {
        await hapusFavorit(kota.id);
        setDaftarFavorit((prev) => prev.filter((k) => k.id !== kota.id));
      },
    );
  }

  // 4. Penghapusan Cache SQLite per Kota (Task 3)
  function handleHapusCacheItem(kota: RingkasanKotaTersimpan) {
    konfirmasiAksi(
      "Hapus Cache Offline",
      `Hapus data cache SQLite untuk kota ${kota.nama}? Data offline untuk kota ini akan dibersihkan.`,
      async () => {
        await hapusCacheKota(kota.kunci);
        setDaftarCache((prev) => prev.filter((k) => k.kunci !== kota.kunci));
      },
    );
  }

  function formatWaktu(epochMs: number): string {
    const selisihMenit = Math.floor((Date.now() - epochMs) / 60000);
    if (selisihMenit < 1) return "Baru saja";
    if (selisihMenit < 60) return `${selisihMenit} menit lalu`;
    const selisihJam = Math.floor(selisihMenit / 60);
    if (selisihJam < 24) return `${selisihJam} jam lalu`;
    return `${Math.floor(selisihJam / 24)} hari lalu`;
  }

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Segmented Control / Tab Switcher */}
      <View
        style={[
          styles.segmentContainer,
          {
            backgroundColor: theme.tagBackground,
            borderColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setSegmen("riwayat")}
          style={[
            styles.segmentBtn,
            segmen === "riwayat" && {
              backgroundColor: theme.cardBackground,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            },
          ]}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={segmen === "riwayat" ? theme.primary : theme.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color:
                  segmen === "riwayat" ? theme.primary : theme.textSecondary,
                fontWeight: segmen === "riwayat" ? "700" : "500",
              },
            ]}
          >
            Pencarian ({daftarRiwayat.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSegmen("favorit")}
          style={[
            styles.segmentBtn,
            segmen === "favorit" && {
              backgroundColor: theme.cardBackground,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            },
          ]}
        >
          <Ionicons
            name="heart-outline"
            size={16}
            color={segmen === "favorit" ? theme.primary : theme.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color:
                  segmen === "favorit" ? theme.primary : theme.textSecondary,
                fontWeight: segmen === "favorit" ? "700" : "500",
              },
            ]}
          >
            Favorit ({daftarFavorit.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSegmen("cache")}
          style={[
            styles.segmentBtn,
            segmen === "cache" && {
              backgroundColor: theme.cardBackground,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            },
          ]}
        >
          <Ionicons
            name="cloud-offline-outline"
            size={16}
            color={segmen === "cache" ? theme.primary : theme.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color:
                  segmen === "cache" ? theme.primary : theme.textSecondary,
                fontWeight: segmen === "cache" ? "700" : "500",
              },
            ]}
          >
            Cache ({daftarCache.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= SEKSI 1: RIWAYAT PENCARIAN TERAKHIR ================= */}
        {segmen === "riwayat" && (
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  10 Pencarian Terakhir
                </Text>
                <Text
                  style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
                >
                  Ketuk kota untuk memuat data cuaca secara instan.
                </Text>
              </View>
              {daftarRiwayat.length > 0 && (
                <TouchableOpacity
                  onPress={handleHapusSemuaRiwayat}
                  style={[
                    styles.clearAllBtn,
                    { backgroundColor: theme.dangerLight },
                  ]}
                >
                  <Text style={[styles.clearAllText, { color: theme.danger }]}>
                    Kosongkan
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {daftarRiwayat.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={40}
                  color={theme.textMuted}
                />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Belum ada riwayat pencarian kota.
                </Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  Cari kota pada halaman Beranda untuk menyimpannya di sini.
                </Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {daftarRiwayat.map((item) => (
                  <TouchableOpacity
                    key={`${item.id}-${item.waktuPencarian}`}
                    onPress={() => bukaDiBeranda(item)}
                    activeOpacity={0.7}
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor: theme.cardBackground,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <View
                        style={[
                          styles.itemIconCircle,
                          { backgroundColor: theme.primaryLight },
                        ]}
                      >
                        <Ionicons
                          name="location"
                          size={18}
                          color={theme.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemTitle, { color: theme.text }]}>
                          {item.nama}
                        </Text>
                        <Text
                          style={[
                            styles.itemSubtitle,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {item.country ? `${item.country} • ` : ""}
                          {formatWaktu(item.waktuPencarian)}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleHapusRiwayatItem(item)}
                      style={[
                        styles.deleteIconBtn,
                        { backgroundColor: theme.dangerLight },
                      ]}
                      accessibilityLabel={`Hapus riwayat pencarian ${item.nama}`}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={theme.danger}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ================= SEKSI 2: KOTA FAVORIT ================= */}
        {segmen === "favorit" && (
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Kota Favorit Tersimpan
                </Text>
                <Text
                  style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
                >
                  Kota pilihan Anda tersimpan aman di AsyncStorage.
                </Text>
              </View>
            </View>

            {daftarFavorit.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="heart-dislike-outline"
                  size={40}
                  color={theme.textMuted}
                />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Belum ada kota favorit yang disimpan.
                </Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  Tekan "Tambahkan ke Favorit" pada hasil cuaca di Beranda.
                </Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {daftarFavorit.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => bukaDiBeranda(item)}
                    activeOpacity={0.7}
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor: theme.cardBackground,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <View
                        style={[
                          styles.itemIconCircle,
                          { backgroundColor: theme.primaryLight },
                        ]}
                      >
                        <Ionicons
                          name="bookmark"
                          size={18}
                          color={theme.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemTitle, { color: theme.text }]}>
                          {item.nama}
                        </Text>
                        <Text
                          style={[
                            styles.itemSubtitle,
                            { color: theme.textSecondary },
                          ]}
                        >
                          Koordinat: {item.latitude.toFixed(2)},{" "}
                          {item.longitude.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleHapusFavoritItem(item)}
                      style={[
                        styles.deleteIconBtn,
                        { backgroundColor: theme.dangerLight },
                      ]}
                      accessibilityLabel={`Hapus favorit ${item.nama}`}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={theme.danger}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ================= SEKSI 3: CACHE KOTA OFFLINE (SQLITE) ================= */}
        {segmen === "cache" && (
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Cache Offline SQLite
                </Text>
                <Text
                  style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
                >
                  Salinan data cuaca lokal SQLite yang dapat dibuka tanpa internet.
                </Text>
              </View>
            </View>

            {daftarCache.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="server-outline"
                  size={40}
                  color={theme.textMuted}
                />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Belum ada cache cuaca di SQLite.
                </Text>
                <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                  Data cuaca kota yang dibuka saat online akan disimpan otomatis.
                </Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {daftarCache.map((item) => (
                  <TouchableOpacity
                    key={item.kunci}
                    onPress={() => bukaDiBeranda(item)}
                    activeOpacity={0.7}
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor: theme.cardBackground,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <View
                        style={[
                          styles.itemIconCircle,
                          { backgroundColor: theme.statusSegarBg },
                        ]}
                      >
                        <Ionicons
                          name="cloud-done-outline"
                          size={18}
                          color={theme.statusSegarText}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemTitle, { color: theme.text }]}>
                          {item.nama}
                        </Text>
                        <Text
                          style={[
                            styles.itemSubtitle,
                            { color: theme.textSecondary },
                          ]}
                        >
                          Disimpan: {formatWaktu(item.disimpanPada)}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleHapusCacheItem(item)}
                      style={[
                        styles.deleteIconBtn,
                        { backgroundColor: theme.dangerLight },
                      ]}
                      accessibilityLabel={`Hapus cache ${item.nama}`}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color={theme.danger}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  sectionWrapper: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  clearAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyCard: {
    padding: 32,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    gap: 8,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptySub: {
    fontSize: 12,
    textAlign: "center",
  },
  listContainer: {
    gap: 10,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  itemIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
