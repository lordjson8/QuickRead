import React from "react";
import { Stack } from "expo-router";
import { baseURL } from "@/services/api.service";


export default function AuthLayout() {
   console.log(baseURL)
  return (
      <Stack
        screenOptions={{
          headerShown: false,
          statusBarStyle: "dark",
          animation: "flip",
          animationDuration : 1000
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="confirm-otp" />
      </Stack>
  );
}
