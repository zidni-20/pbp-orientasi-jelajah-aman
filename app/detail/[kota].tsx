import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WeatherCard from "../../components/WeatherCard";
import { useTheme } from "../../context/ThemeContext";

export default function HalamanDetail() {
  const { theme } = useTheme();
  const { kota } = useLocalSearchParams<{ kota: string }>();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <WeatherCard kota={kota ?? "Kota"} suhu={29} tingkatAQI="BAIK" />
      <TouchableOpacity
        onPress={() => router.push("/tambah-favorit")}
        style={[styles.btn, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.btnText}>Tambahkan ke Favorit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
