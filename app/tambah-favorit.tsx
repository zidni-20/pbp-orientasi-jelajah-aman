// src/app/tambah-favorit.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { tambahFavorit } from "../services/favoritStorage";

export default function ModalTambahFavorit() {
  const { theme } = useTheme();
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  async function simpan() {
    await tambahFavorit({
      id: Number(id),
      nama: nama ?? "Kota Tanpa Nama",
      latitude: Number(lat),
      longitude: Number(lon),
    });
    router.back();
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <View
        style={[
          styles.modalCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons name="bookmark" size={32} color={theme.primary} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          Simpan ke Favorit
        </Text>
        <Text style={[styles.desc, { color: theme.textSecondary }]}>
          Tambahkan kota <Text style={{ fontWeight: "bold", color: theme.text }}>{nama}</Text> ke dalam daftar kota favorit Anda untuk akses cepat kapan saja.
        </Text>

        <View style={styles.btnRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.cancelBtn,
              {
                backgroundColor: theme.tagBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
              Batal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={simpan}
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Simpan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  modalCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  desc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
