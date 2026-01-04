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
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});


 GoogleSignin.configure({
    webClientId: "592514759965-u8djt882it06mqiiornalvovgskjt49k.apps.googleusercontent.com", // From Google Cloud Console
    // webClientId: "592514759965-62mmuvev6m38vri9gifef85qdiirkhp2.apps.googleusercontent.com",
    offlineAccess: true, // If you need to access Google API on behalf of the user
    forceCodeForRefreshToken: true, // [Android] related to offlineAccess
    iosClientId:"592514759965-45f4urfaqpki8qkoug2p10hk6n12ur3g.apps.googleusercontent.com", // [iOS]
    profileImageSize: 120, // [iOS] The desired dimension (width/height) of the profile image
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
