import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ArrowLeft, Mail, ArrowRight } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword() {
  return (
         <SafeAreaView className="flex-1 bg-background">
   
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 min-h-screen bg-background px-6">
            {/* Header with back button */}
            <View className="w-full pt-4 pb-4">
              <TouchableOpacity className="w-11 h-11 -ml-2 items-center justify-center rounded-xl active:opacity-70">
                <ArrowLeft size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View className="flex-1 justify-between">
              <View>
                {/* Title section */}
                <View className="w-full pb-8">
                  <Text className="text-4xl font-bold text-foreground tracking-tight mb-4">
                    Forgot Password
                  </Text>
                  <Text className="text-base text-muted-foreground leading-6 max-w-sm">
                    Enter your email address to receive a verification code
                  </Text>
                </View>

                {/* Form section */}
                <View className="w-full pb-8 space-y-8 flex-1">
                  {/* Email Input */}
                  <View className="space-y-3">
                    <Text className="text-sm font-medium text-foreground/80 ml-1">
                      Email Address
                    </Text>
                    <View className="relative">
                      <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <Mail size={24} color="#6B7280" />
                      </View>
                      <TextInput
                        className="w-full h-16 pl-14 pr-5 bg-white border border-border rounded-2xl text-base text-foreground placeholder:text-neutral-400"
                        placeholder="name@example.com"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    </View>
                  </View>
                </View>
              </View>
              {/* Send Code Button */}
              <View className="pt-4">
                <TouchableOpacity className="w-full h-16 bg-primary rounded-2xl shadow-lg shadow-primary/20 active:opacity-90 flex-row items-center justify-center gap-2">
                  <Text className="text-white text-lg font-semibold">
                    Send Code
                  </Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="pb-12 pt-8 items-center px-8">
              <View className="flex-row items-center">
                <Text className="text-sm text-muted-foreground">
                  Remember password?
                </Text>
                <TouchableOpacity className="ml-1">
                  <Text className="text-primary font-semibold text-sm underline">
                    Log In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}