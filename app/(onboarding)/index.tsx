import { View, Text, TouchableOpacity } from "react-native";
import { BookOpen } from "lucide-react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function r() {
  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      <View className="flex-1 px-8 pt-20 items-center justify-center">
        <View className="w-full flex-1 ">
          <View className="flex-1 gap-6  items-center justify-center mb-2">
            <View className="h-32 w-32 bg-gradient-to-br bg-green-800 from-[#007A5E] to-[#005a45] rounded-3xl flex items-center justify-center shadow-2xl">
              <BookOpen strokeWidth={2} width={64} height={64} color={"#fff"} />
            </View>
            <View>
              <Text className="text-center text-2xl font-bold text-[#212121] mb-4">
                Learn Faster, Read Smarter
              </Text>
              <Text className="text-center text-gray-600 px-4">
                Get the key insights from bestselling books in just 15 minutes
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="p-8 pb-12">
        <View className="flex-row justify-center gap-2 mb-8">
          <View className="w-8 h-1 bg-[#007A5E] rounded-full"></View>
          <View className="w-8 h-1 bg-gray-200 rounded-full"></View>
          <View className="w-8 h-1 bg-gray-200 rounded-full"></View>
        </View>

        <Link asChild href={"/(onboarding)/welcome-two"}>
          <TouchableOpacity
            //   onClick={onNext}
            className="w-full bg-[#007A5E] hover:bg-[#005a45] text-white rounded-full py-4 transition-colors"
          >
            <Text className="text-center text-white font-bold text-2xl">
              Get Started
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
