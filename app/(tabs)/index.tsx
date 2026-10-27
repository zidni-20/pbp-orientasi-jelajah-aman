// src/app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import SearchBox from "../../components/SearchBox";
import StatusData from "../../components/StatusData";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useTheme } from "../../context/ThemeContext";
import { useDebounce } from "../../hooks/use-debounce";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { cariKota } from "../../services/geocodingService";
import {
  ambilKoordinatSaatIni,
  mintaIzinLokasi,
} from "../../services/locationService";
import { tambahRiwayatPencarian } from "../../services/searchHistoryStorage";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { HasilGeocoding } from "../../types/geocoding";
import { konfirmasiAksi } from "../../utils/alert";

export default function HalamanUtama() {
  const { theme, isDark } = useTheme();
  const params = useLocalSearchParams<{
    kotaDipilih?: string;
    timestamp?: string;
  }>();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [sudahFavorit, setSudahFavorit] = useState(false);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan(20));
  }

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);

  // Tangkap pemilihan kota dari tab Riwayat / Favorit
  useEffect(() => {
    if (params.kotaDipilih) {
      try {
        const kotaObj: HasilGeocoding = JSON.parse(params.kotaDipilih);
        pilihKota(kotaObj);
      } catch (err) {
        console.error("Gagal memproses pemilihan kota:", err);
      }
    }
  }, [params.kotaDipilih, params.timestamp]);

  // Pencarian kota dengan debounce
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  // Sinkronisasi status favorit saat layar difokuskan atau kota terpilih berganti
  useFocusEffect(
    useCallback(() => {
      if (!kotaTerpilih) {
        setSudahFavorit(false);
        return;
      }
      ambilSemuaFavorit().then((daftar) => {
        setSudahFavorit(daftar.some((k) => k.id === kotaTerpilih.id));
      });
      muatKotaTersimpan();
    }, [kotaTerpilih]),
  );

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    setHasilPencarian([]); // sembunyikan dropdown pencarian setelah dipilih
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    // Simpan ke riwayat pencarian (maksimal 10) kecuali lokasi GPS sementara
    if (kota.id !== -1) {
      tambahRiwayatPencarian({
        id: kota.id,
        nama: kota.name,
        latitude: kota.latitude,
        longitude: kota.longitude,
        country: kota.country ?? "",
      }).catch(() => {});
    }

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui },
      );
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setHasil(data);
      muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi.",
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();
    if (status === "denied") {
      setPesanLokasi(
        "Izin lokasi ditolak. Silakan cari kota secara manual di atas.",
      );
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi(
        "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.",
      );
      return;
    }
    setPesanLokasi(null);
    try {
      setSedangMemuat(true);
      const koordinat = await ambilKoordinatSaatIni();
      pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch {
      setPesanLokasi("Gagal memperoleh koordinat GPS saat ini.");
      setSedangMemuat(false);
    }
  }

  // Penghapusan cache kota tertentu langsung dari Beranda (Task 3)
  function handleHapusCacheKota(k: RingkasanKotaTersimpan) {
    konfirmasiAksi(
      "Hapus Cache Offline",
      `Hapus data cuaca tersimpan untuk kota ${k.nama}? Data offline untuk kota ini akan dihapus dari SQLite.`,
      async () => {
        await hapusCacheKota(k.kunci);
        await muatKotaTersimpan();
      },
    );
  }

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Kolom Pencarian */}
        <SearchBox onCari={setTeksCari} />

        {/* Tombol GPS */}
        <TouchableOpacity
          onPress={gunakanLokasiSaatIni}
          activeOpacity={0.8}
          style={[
            styles.gpsButton,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons name="navigate-circle" size={20} color={theme.primary} />
          <Text style={[styles.gpsButtonText, { color: theme.primary }]}>
            Gunakan Lokasi Saat Ini
          </Text>
        </TouchableOpacity>

        {pesanLokasi && (
          <View
            style={[
              styles.messageBanner,
              { backgroundColor: theme.statusBasiBg },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={theme.statusBasiText}
            />
            <Text
              accessibilityLabel={pesanLokasi}
              style={[styles.messageBannerText, { color: theme.statusBasiText }]}
            >
              {pesanLokasi}
            </Text>
          </View>
        )}

        {/* Dropdown Hasil Pencarian Geocoding */}
        {hasilPencarian.length > 0 && (
          <View
            style={[
              styles.searchResultBox,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            {hasilPencarian.map((kota, idx) => (
              <TouchableOpacity
                key={kota.id}
                onPress={() => pilihKota(kota)}
                style={[
                  styles.searchResultItem,
                  idx !== hasilPencarian.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={theme.primary}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.searchResultText, { color: theme.text }]}>
                    {kota.name}
                  </Text>
                  {kota.country ? (
                    <Text
                      style={[
                        styles.searchResultSub,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {kota.country}
                      {kota.admin1 ? ` • ${kota.admin1}` : ""}
                    </Text>
                  ) : null}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Daftar Tersimpan di Perangkat (SQLite Cache) */}
        {kotaTersimpan.length > 0 && (
          <View
            style={[
              styles.savedSection,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.savedHeader}>
              <Ionicons
                name="cloud-offline"
                size={18}
                color={theme.statusSegarText}
              />
              <Text style={[styles.savedSectionTitle, { color: theme.text }]}>
                Tersimpan di perangkat (Bisa dibuka offline)
              </Text>
            </View>

            <View style={styles.savedList}>
              {kotaTersimpan.map((k) => (
                <View
                  key={k.kunci}
                  style={[
                    styles.savedRow,
                    {
                      backgroundColor: theme.tagBackground,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() =>
                      pilihKota({
                        id: k.id,
                        name: k.nama,
                        latitude: k.latitude,
                        longitude: k.longitude,
                        country: "",
                      })
                    }
                    style={styles.savedRowContent}
                  >
                    <Ionicons
                      name="location"
                      size={16}
                      color={theme.primary}
                    />
                    <Text style={[styles.savedCityName, { color: theme.text }]}>
                      {k.nama}
                    </Text>
                  </TouchableOpacity>

                  {/* Tombol Hapus Cache per item kota (Task 3) */}
                  <TouchableOpacity
                    onPress={() => handleHapusCacheKota(k)}
                    style={[
                      styles.trashIconBtn,
                      { backgroundColor: theme.dangerLight },
                    ]}
                    accessibilityLabel={`Hapus cache offline ${k.nama}`}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      color={theme.danger}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Indikator Loading */}
        {sedangMemuat && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text
              style={[styles.loadingText, { color: theme.textSecondary }]}
            >
              Memuat data cuaca & kualitas udara...
            </Text>
          </View>
        )}

        {/* Tampilan Error */}
        {pesanError && (
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.danger,
              },
            ]}
          >
            <Ionicons name="warning-outline" size={24} color={theme.danger} />
            <Text
              accessibilityLabel={pesanError}
              style={[styles.errorText, { color: theme.danger }]}
            >
              {pesanError}
            </Text>
            <TouchableOpacity
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
              style={[styles.retryBtn, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tampilan Kartu Hasil Cuaca */}
        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={styles.resultContainer}>
            {/* Label Status Data (Jaringan / Cache Segar / Cache Basi) */}
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />

            {/* Kartu Suhu & AQI Utama */}
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
            />

            {/* Informasi Detail Kondisi & Angin */}
            <View
              style={[
                styles.detailBox,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.detailRow}>
                <Ionicons
                  name="partly-sunny-outline"
                  size={18}
                  color={theme.primary}
                />
                <Text style={[styles.detailText, { color: theme.text }]}>
                  Kondisi:{" "}
                  <Text style={{ fontWeight: "700" }}>
                    {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
                  </Text>
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="speedometer-outline"
                  size={18}
                  color={theme.primary}
                />
                <Text style={[styles.detailText, { color: theme.text }]}>
                  Kecepatan Angin:{" "}
                  <Text style={{ fontWeight: "700" }}>
                    {hasil.cuaca.saatIni.kecepatanAngin} km/j
                  </Text>
                </Text>
              </View>

              {hasil.kualitasUdara && (
                <View style={styles.detailRow}>
                  <Ionicons
                    name="leaf-outline"
                    size={18}
                    color={theme.primary}
                  />
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    PM2.5:{" "}
                    <Text style={{ fontWeight: "700" }}>
                      {hasil.kualitasUdara.pm25} µg/m³
                    </Text>{" "}
                    • PM10:{" "}
                    <Text style={{ fontWeight: "700" }}>
                      {hasil.kualitasUdara.pm10} µg/m³
                    </Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Tombol Perbarui Sekarang */}
            <TouchableOpacity
              onPress={() => pilihKota(kotaTerpilih, true)}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Ionicons name="sync-outline" size={18} color={theme.primary} />
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>
                Perbarui Sekarang (Paksa Internet)
              </Text>
            </TouchableOpacity>

            {/* Tombol Tambahkan ke Favorit */}
            <TouchableOpacity
              disabled={sudahFavorit}
              onPress={() =>
                router.push({
                  pathname: "/tambah-favorit",
                  params: {
                    id: String(kotaTerpilih.id),
                    nama: kotaTerpilih.name,
                    lat: String(kotaTerpilih.latitude),
                    lon: String(kotaTerpilih.longitude),
                  },
                })
              }
              style={[
                styles.actionBtn,
                {
                  backgroundColor: sudahFavorit
                    ? theme.tagBackground
                    : theme.primary,
                  borderColor: sudahFavorit ? theme.border : theme.primary,
                },
              ]}
            >
              <Ionicons
                name={sudahFavorit ? "checkmark-circle" : "heart"}
                size={18}
                color={sudahFavorit ? theme.textSecondary : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  { color: sudahFavorit ? theme.textSecondary : "#FFFFFF" },
                ]}
              >
                {sudahFavorit ? "Sudah Ada di Favorit" : "Tambahkan ke Favorit"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <AtribusiCuaca />
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
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  gpsButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  messageBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  messageBannerText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  searchResultBox: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  searchResultText: {
    fontSize: 14,
    fontWeight: "700",
  },
  searchResultSub: {
    fontSize: 12,
    marginTop: 2,
  },
  savedSection: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  savedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  savedSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  savedList: {
    gap: 8,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  savedRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  savedCityName: {
    fontSize: 14,
    fontWeight: "600",
  },
  trashIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  errorCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  resultContainer: {
    gap: 14,
  },
  detailBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
