import { Linking, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function AtribusiCuaca() {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL("https://open-meteo.com/")}
      style={{ paddingVertical: 12 }}
    >
      <Text
        style={{
          fontSize: 12,
          color: theme.textSecondary,
          textAlign: "center",
          textDecorationLine: "underline",
        }}
      >
        Data cuaca disediakan oleh Open-Meteo.com
      </Text>
    </TouchableOpacity>
  );
}
