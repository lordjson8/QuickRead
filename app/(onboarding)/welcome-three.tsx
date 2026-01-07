import SkipOnboardingButton from "@/components/onboarding/SkipOnboardingButton";
import { useAuthStore } from "@/store/auth.store";
import { Link, Stack } from "expo-router";
import { Headphones, Zap } from "lucide-react-native";

import { View, Text, TouchableOpacity } from "react-native";

export default function WelcomeOnboarding() {
  const { completeOnboarding } = useAuthStore();
  return (
    <View className=" bg-background backdrop-blur-lg font-sans text-foreground flex-1">
      <View className="flex-1 relative  px-6 pt-16 pb-12 justify-between">
        <View className="absolute inset-0">
          <View className="absolute -top-20 -right-32 w-96 h-96 bg-primary rounded-full opacity-90 blur-3xl" />
          <View className="absolute top-1/4 -left-24 w-80 h-80 bg-primary rounded-full opacity-40 blur-2xl" />
          <View className="absolute top-32 left-12 w-32 h-32 bg-accent rounded-full opacity-60 blur-xl" />
          <View className="absolute bottom-1/3 right-8 w-24 h-24 bg-accent rounded-full opacity-50 blur-lg" />
          <View className="absolute bottom-20 left-1/4 w-64 h-64 bg-primary rounded-full opacity-20 blur-3xl" />
          <View className="absolute top-1/2 right-1/3 w-16 h-16 bg-accent rounded-full opacity-70 blur-md" />
        </View>
        <View className="relative z-10 flex-1 ">
          <View className="mb-8 flex-1">
            <View className=" flex-1 ">
              <View className="w-full flex-1 ">
                <View className="flex-1 gap-6  items-center justify-center mb-2">
                  <View className="h-32 w-32 bg-gradient-to-br bg-green-800 from-[#007A5E] to-[#005a45] rounded-3xl flex items-center justify-center shadow-2xl">
                    <Headphones
                      strokeWidth={2}
                      width={64}
                      height={64}
                      color={"#fff"}
                    />
                  </View>
                  <View>
                    <Text className="text-center text-2xl font-bold text-[#212121] mb-4">
                      Read or Listen
                    </Text>
                    <Text className="text-center text-gray-600 px-4">
                      Enjoy your blinks however you like - read at your own pace
                      or listen on the go
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View className="relative z-10 space-y-8">
          <View className="flex justify-center gap-2 flex-row mb-6">
            <View className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            <View className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            <View className="w-2 h-2 rounded-full bg-accent shadow-sm" />
          </View>
          <TouchableOpacity onPress={completeOnboarding}>
            <TouchableOpacity className="w-full py-4 px-6 bg-primary  rounded-2xl  shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
              <Text className="text-center text-primary-foreground font-bold text-lg">
                Continue
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <View className="">
            <SkipOnboardingButton />
          </View>
        </View>
      </View>
    </View>
  );
}
