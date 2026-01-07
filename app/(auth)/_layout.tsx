import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";


export default function AuthLayout() {
  
  return (
    <KeyboardProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          statusBarStyle: "dark",
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="confirm-otp" />
      </Stack>
    </KeyboardProvider>
  );
}
