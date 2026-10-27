// src/components/WeatherCard.tsx
import { Text, View } from "react-native";
import { spacing, typeScale } from "../constants/styles";
import { useTheme } from "../context/ThemeContext";
import { TingkatAQI, WeatherCardProps } from "../types/cuaca";

const warnaPerTingkat: Record<TingkatAQI, string> = {
  BAIK: "#10B981",
  SEDANG: "#F59E0B",
  TIDAK_SEHAT: "#F97316",
  BERBAHAYA: "#EF4444",
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
}: WeatherCardProps) {
  const { theme } = useTheme();

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${tingkatAQI})`
      : `AQI: ${tingkatAQI}`;

  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang,
        borderRadius: 14,
        backgroundColor: theme.cardBackground,
        borderColor: theme.border,
        borderWidth: 1,
        gap: 6,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: typeScale.judul,
          color: theme.text,
        }}
      >
        {kota}
      </Text>
      <Text style={{ fontSize: 36, fontWeight: "800", color: theme.text }}>
        {suhu}°C
      </Text>
      <Text
        style={{
          color: warnaPerTingkat[tingkatAQI],
          fontSize: typeScale.isi,
          fontWeight: "700",
        }}
      >
        {teksAQI}
      </Text>
    </View>
  );
}
