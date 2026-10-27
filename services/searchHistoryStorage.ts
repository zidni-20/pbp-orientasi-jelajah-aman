// services/searchHistoryStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KUNCI_RIWAYAT_PENCARIAN = "@jelajah_aman:riwayat_pencarian";
const MAKSIMAL_RIWAYAT = 10;

export interface RiwayatPencarian {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  country?: string;
  waktuPencarian: number; // epoch ms
}

/**
 * Mengambil seluruh riwayat pencarian kota yang tersimpan di AsyncStorage.
 */
export async function ambilSemuaRiwayatPencarian(): Promise<RiwayatPencarian[]> {
  try {
    const json = await AsyncStorage.getItem(KUNCI_RIWAYAT_PENCARIAN);
    if (!json) return [];
    const parsed: RiwayatPencarian[] = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Gagal membaca riwayat pencarian:", error);
    return [];
  }
}

/**
 * Menambahkan kota ke riwayat pencarian terakhir (maksimal 10 entri).
 * Jika kota sudah pernah dicari, posisi item akan dipindahkan ke paling atas.
 */
export async function tambahRiwayatPencarian(kota: {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  country?: string;
}): Promise<void> {
  try {
    const daftar = await ambilSemuaRiwayatPencarian();

    // Hapus kota dengan ID atau nama + koordinat yang sama agar tidak duplikat
    const filtered = daftar.filter(
      (k) =>
        k.id !== kota.id &&
        !(
          k.nama.toLowerCase() === kota.nama.toLowerCase() &&
          k.latitude.toFixed(2) === kota.latitude.toFixed(2) &&
          k.longitude.toFixed(2) === kota.longitude.toFixed(2)
        ),
    );

    const itemBaru: RiwayatPencarian = {
      ...kota,
      country: kota.country ?? "",
      waktuPencarian: Date.now(),
    };

    // Tempatkan di urutan paling awal dan batasi maksimal 10
    const daftarBaru = [itemBaru, ...filtered].slice(0, MAKSIMAL_RIWAYAT);

    await AsyncStorage.setItem(
      KUNCI_RIWAYAT_PENCARIAN,
      JSON.stringify(daftarBaru),
    );
  } catch (error) {
    console.error("Gagal menyimpan riwayat pencarian:", error);
  }
}

/**
 * Menghapus satu item dari riwayat pencarian berdasarkan ID.
 */
export async function hapusRiwayatPencarian(id: number): Promise<void> {
  try {
    const daftar = await ambilSemuaRiwayatPencarian();
    const daftarBaru = daftar.filter((k) => k.id !== id);
    await AsyncStorage.setItem(
      KUNCI_RIWAYAT_PENCARIAN,
      JSON.stringify(daftarBaru),
    );
  } catch (error) {
    console.error("Gagal menghapus item riwayat pencarian:", error);
  }
}

/**
 * Mengosongkan seluruh riwayat pencarian.
 */
export async function hapusSemuaRiwayatPencarian(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KUNCI_RIWAYAT_PENCARIAN);
  } catch (error) {
    console.error("Gagal mengosongkan riwayat pencarian:", error);
  }
}
