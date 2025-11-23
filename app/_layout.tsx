import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "@/global.css";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect } from "react";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    "DMSans-italic": require("../assets/fonts/DMSans-Italic-VariableFont_opsz,wght.ttf"),
    "DMSans": require("../assets/fonts/DMSans-VariableFont_opsz,wght.ttf"),
  });

  // const [images] = useImages

  useEffect(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
