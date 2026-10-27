// context/ThemeContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  background: string;
  cardBackground: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  cardBorder: string;
  primary: string;
  primaryLight: string;
  danger: string;
  dangerLight: string;
  inputBackground: string;
  inputBorder: string;
  tagBackground: string;
  statusBar: "light" | "dark";
  statusBasiBg: string;
  statusBasiText: string;
  statusSegarBg: string;
  statusSegarText: string;
}

export const lightColors: ThemeColors = {
  background: "#F8FAFC",
  cardBackground: "#FFFFFF",
  surface: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  cardBorder: "#E2E8F0",
  primary: "#0284C7",
  primaryLight: "#E0F2FE",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  inputBackground: "#FFFFFF",
  inputBorder: "#CBD5E1",
  tagBackground: "#F1F5F9",
  statusBar: "dark",
  statusBasiBg: "#FEF3E2",
  statusBasiText: "#B45309",
  statusSegarBg: "#EAFBF6",
  statusSegarText: "#13795F",
};

export const darkColors: ThemeColors = {
  background: "#0B1120",
  cardBackground: "#1E293B",
  surface: "#1E293B",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  border: "#334155",
  cardBorder: "#334155",
  primary: "#38BDF8",
  primaryLight: "#0C4A6E",
  danger: "#F87171",
  dangerLight: "#450A0A",
  inputBackground: "#1E293B",
  inputBorder: "#475569",
  tagBackground: "#334155",
  statusBar: "light",
  statusBasiBg: "#451A03",
  statusBasiText: "#FBBF24",
  statusSegarBg: "#064E3B",
  statusSegarText: "#34D399",
};

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  theme: ThemeColors;
}

const KUNCI_STORAGE_TEMA = "@jelajah_aman:theme_mode";

const ThemeContext = createContext<ThemeContextType>({
  mode: "system",
  setMode: async () => {},
  isDark: false,
  theme: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(KUNCI_STORAGE_TEMA).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await AsyncStorage.setItem(KUNCI_STORAGE_TEMA, newMode);
  };

  const isDark = useMemo(() => {
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return systemScheme === "dark";
  }, [mode, systemScheme]);

  const theme = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDark, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
