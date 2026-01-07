import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useAuthStore } from "@/store/auth.store";

export default function SkipOnboardingButton() {

    const {completeOnboarding} = useAuthStore()

  return (
    <TouchableOpacity onPress={completeOnboarding} className=" ">
      <Text className="text-center py-2 text-sm font-medium text-muted-foreground">
        Skip
      </Text>
    </TouchableOpacity>
  );
}
