import { Link } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Svg, { Path, G } from "react-native-svg";

const Google = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

const Facebook = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#1877F2"
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    />
  </Svg>
);

export default function SignUp() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "height" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1  bg-background px-6">
          <View className="items-center flex-1 justify-center py-12 bg-primary/5 rounded-b-3xl mx-2 mb-8">
            <View className="w-20 h-20 bg-primary/10 rounded-2xl items-center justify-center mb-4 shadow-sm border border-primary/20">
              <Text className="text-2xl">✨</Text>
            </View>
            <Text className="text-4xl font-bold text-foreground">
              QuickRead<Text className="text-primary">.</Text>
            </Text>
            <Text className="text-muted-foreground mt-2 text-base font-medium">
              Lorem ipsum dolor sit amet.
            </Text>
          </View>

          <View className="flex-1 gap-2">
            <View className="">
              <Text className="text-lg font-semibold text-foreground">
                Name
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full h-14 px-3 placeholder:text-muted-foreground bg-card border-2 border-border rounded-lg text-lg text-foreground  focus:border-primary shadow-sm"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>
            <View className="">
              <Text className="text-lg font-semibold text-foreground">
                Email Address
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full h-14 px-3 bg-card border-2 border-border rounded-lg text-lg text-foreground placeholder:text-muted-foreground focus:border-primary shadow-sm"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View className="space-y-3">
              <Text className="text-lg font-semibold text-foreground">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full h-14 px-3 bg-card border-2 border-border rounded-xl text-lg text-foreground placeholder:text-muted-foreground focus:border-primary shadow-sm"
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity className="absolute right-4 top-1/2 -translate-y-1/2 p-2">
                  <Text>👁️</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity className="w-full h-14 bg-primary rounded-xl shadow-lg shadow-primary/30 active:opacity-90 mt-6 flex-row items-center justify-center gap-2">
              <Text className="text-white text-lg font-semibold">
                Create Account
              </Text>
              <Text>→</Text>
            </TouchableOpacity>

            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-border" />
              <Text className="px-4 text-sm font-medium text-muted-foreground uppercase">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 h-14 bg-white border-2 border-border rounded-xl flex-row items-center justify-center gap-2 active:bg-neutral-50">
                <Google />
                <Text className="font-semibold text-foreground">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-14 bg-white border-2 border-border rounded-xl flex-row items-center justify-center gap-2 active:bg-neutral-50">
                <Facebook />
                <Text className="font-semibold text-foreground">Facebook</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center items-center pt-8 pb-4">
              <Text className="text-muted-foreground text-base">
                Already have an account?
              </Text>
              <Link href={'/(auth)/login'} asChild>
                <TouchableOpacity className="ml-2">
                  <Text className="text-primary font-semibold text-base underline">
                    Log In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
