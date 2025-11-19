import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { Check } from "lucide-react-native";

const categories = [
  { id: "business", name: "Business & Career", icon: "💼" },
  { id: "psychology", name: "Psychology", icon: "🧠" },
  { id: "productivity", name: "Productivity", icon: "⚡" },
  { id: "health", name: "Health & Fitness", icon: "💪" },
  { id: "finance", name: "Money & Investing", icon: "💰" },
  { id: "science", name: "Science & Nature", icon: "🔬" },
  { id: "technology", name: "Technology", icon: "💻" },
  { id: "history", name: "History", icon: "📜" },
  { id: "philosophy", name: "Philosophy", icon: "🤔" },
  { id: "parenting", name: "Parenting", icon: "👶" },
  { id: "creativity", name: "Creativity", icon: "🎨" },
  { id: "communication", name: "Communication", icon: "💬" },
];

interface InterestSelectionProps {
  onComplete: () => void;
}

export default function InterestSelection({
  onComplete,
}: InterestSelectionProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <View className="h-full flex flex-col bg-[#F9F9F9]">
      <View className="px-6 pt-12 pb-6 mt-6">
        <Text className="text-[#212121] mb-2 font-bold text-2xl">
          What are you interested in?
        </Text>
        <Text className="text-gray-600">
          Select at least 3 topics to personalize your experience
        </Text>
      </View>

      <ScrollView className="flex-1 overflow-y-auto px-6 pb-6">
        <View className="w-full flex-1 gap-3">
          <View className="flex-row flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <Pressable
                  key={category.id}
                  onPress={() => toggleCategory(category.id)}
                  className={`relative w-[46%] min-h-[100px] p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-[#007A5E] bg-[#007A5E]/10"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <View className="absolute top-2 right-2 w-6 h-6 bg-[#007A5E] rounded-full flex items-center justify-center">
                      <Check className=" text-white" size={15} color={'#fff'} strokeWidth={3} />
                    </View>
                  )}
                    <View className={` flex-1 gap-2 items-center justify-center`}>
                    <Text className="text-4xl">{category.icon}</Text>
                    <Text
                      className={`text-sm ${isSelected ? "text-[#212121]" : "text-gray-700"}`}
                    >
                      {category.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className="p-6 border-t border-gray-100">
        <TouchableOpacity
          onPress={onComplete}
          disabled={selectedCategories.length < 3}
          className={`w-full rounded-full py-4 transition-colors ${
            selectedCategories.length >= 3
              ? "bg-[#007A5E] hover:bg-[#005a45] text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Text className="text-center text-lg text-white font-bold">Continue ({selectedCategories.length}/ {categories.length + 1})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
