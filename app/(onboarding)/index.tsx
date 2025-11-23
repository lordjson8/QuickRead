import { Link, Stack } from "expo-router";

import { View, Text, TouchableOpacity } from "react-native";

export default function WelcomeOnboarding() {
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
        <View className="relative z-10 flex-1 justify-center">
          <View className="mb-8">
            <Text className="text-5xl font-bold flex-col font-heading text-foreground leading-tight tracking-tight">
              Big Ideas
            </Text>
            <Text className="text-5xl font-bold flex-col font-heading text-foreground leading-tight tracking-tight mb-6">
              in 15 Minutes
            </Text>
            <Text className="text-lg text-foreground/70 leading-relaxed max-w-sm">
              Discover powerful insights from the world&apos;s best books,
              distilled into bite-sized summaries you can read or listen to in
              minutes.
            </Text>
          </View>
        </View>
        <View className="relative z-10 space-y-8">
          <View className="flex justify-center gap-2 flex-row mb-6">
            <View className="w-2 h-2 rounded-full bg-accent shadow-sm" />
            <View className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            <View className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          </View>
          <Link href="/(onboarding)/welcome-two" asChild>
            <TouchableOpacity className="w-full py-4 px-6 bg-primary  rounded-2xl  shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
              <Text className="text-center text-primary-foreground font-bold text-lg">
                Get Started
              </Text>
            </TouchableOpacity>
          </Link>

          <Link asChild href={'/(auth)/confirm-otp'} className="">
            <TouchableOpacity className=" ">
              <Text className="text-center py-2 text-sm font-medium text-muted-foreground">
                Skip
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
