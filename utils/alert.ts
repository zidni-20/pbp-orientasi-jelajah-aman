import { Alert, Platform } from "react-native";

/**
 * Dialog konfirmasi aman yang berfungsi baik di platform Mobile (Expo Go)
 * maupun Web browser tanpa menyebabkan crash atau error konsol.
 */
export function konfirmasiAksi(
  judul: string,
  pesan: string,
  onKonfirmasi: () => void,
  labelKonfirmasi = "Hapus",
  labelBatal = "Batal",
) {
  if (Platform.OS === "web") {
    // Pada platform web, Alert.alert tidak selalu memunculkan modal interaktif bawaan.
    // window.confirm memberikan pengalaman konfirmasi native browser yang reliabel.
    if (typeof window !== "undefined" && typeof window.confirm === "function") {
      const setuju = window.confirm(`${judul}\n\n${pesan}`);
      if (setuju) {
        onKonfirmasi();
      }
    } else {
      // Fallback jika window tidak terdefinisi
      onKonfirmasi();
    }
  } else {
    Alert.alert(judul, pesan, [
      { text: labelBatal, style: "cancel" },
      { text: labelKonfirmasi, style: "destructive", onPress: onKonfirmasi },
    ]);
  }
}
