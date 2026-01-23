import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useAuthStore } from "@/store/auth.store";
import { router } from "expo-router";

export default function SkipOnboardingButton() {
  const { completeOnboarding } = useAuthStore();

  return (
    <TouchableOpacity
      onPress={() => {
        completeOnboarding();
        router.push("/(auth)/signup");
      }}
      className=" bg-secondary rounded-lg mt-2 py-2"
    >
      <Text className="text-center py-2 text-md font-bold text-muted-foreground">
        Skip
      </Text>
    </TouchableOpacity>
  );
}
