import { Facebook } from "@/components/icons/Facebook";
import { Google } from "@/components/icons/Google";
import { loginUser } from "@/lib/auth";
import { googleAuthHandler } from "@/lib/oauth/googleAuthHandler";
import {
  LoginFormData,
  LoginSchema,
  SignupSchema,
} from "@/lib/validations/auth";
import authService from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Link, router } from "expo-router";
import { ArrowRightIcon, Eye, EyeClosed, LogIn } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUp() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const OnSubmit = async (data: LoginFormData) => {
    await loginUser({
      setError,
      setLoading,
      data,
    });
  };

  const handleGoogleSignIn = async () => {
    await googleAuthHandler({ setLoading, setError });
  };


  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "height" : "height"}
    //   className="flex-1 bg-background"
    // >
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1  bg-background px-6">
            <View className="items-center flex-1 justify-between py-6  rounded-b-3xl mx-2 mb-8">
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
            {error && (
              <View className="flex-1 rounded-lg border-2 border-red-400 bg-red-300 px-4 py-2">
                <Text className="text-white font-bold">{error}</Text>
              </View>
            )}
            <View className="flex-1 gap-2">
              <View className="">
                <Text className="text-lg font-semibold text-foreground">
                  Email Address
                </Text>
                <View className="relative">
                  <Controller
                    control={control}
                    name="email"
                    render={({
                      field: { value, onChange, onBlur },
                      fieldState: { error },
                    }) => (
                      <>
                        <TextInput
                          className={`w-full h-14 px-3 placeholder:text-muted-foreground bg-card border-2 border-border rounded-lg text-lg text-foreground focus:border-primary ${error && "border-red-300"} shadow-sm`}
                          placeholder="name@example.com"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          editable={!loading}
                        />
                        <Text className="text-red-500 font-semibold">
                          {error?.message}
                        </Text>
                      </>
                    )}
                  />
                </View>
              </View>

              <View className="space-y-3">
                <Text className="text-lg font-semibold text-foreground">
                  Password
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({
                    field: { value, onChange, onBlur },
                    fieldState: { error },
                  }) => (
                    <>
                      <View
                        className={`relative  ${error && "border-red-300"} px-3 bg-card shadow-sm items-center border-2 rounded-xl border-border focus:border-primary placeholder:text-muted-foreground flex-row w-full`}
                      >
                        <TextInput
                          className="flex-1 h-14  placeholder:text-muted-foreground  text-lg text-foreground   "
                          placeholder="••••••••"
                          secureTextEntry={showPassword}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          // autoCapitalize="none"
                          editable={!loading}
                          autoComplete="password"
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          className=""
                        >
                          {showPassword ? <Eye /> : <EyeClosed />}
                        </TouchableOpacity>
                      </View>

                      <Text className="text-red-500 font-semibold">
                        {error?.message}
                      </Text>
                    </>
                  )}
                />
              </View>
              <View>
                <Link asChild href={"/(auth)/reset-password"}>
                  <TouchableOpacity className="my- items-end mx-2">
                    <Text className="text-primary">Forgot Password?</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <TouchableOpacity
                onPress={handleSubmit(OnSubmit)}
                disabled={loading}
                className="w-full h-14 bg-primary rounded-xl shadow-lg shadow-primary/30 active:opacity-90  flex-row items-center justify-center gap-2"
              >
                {loading ? (
                  <ActivityIndicator />
                ) : (
                  <>
                    <Text className="text-white text-lg font-semibold">
                      Log In
                    </Text>
                    <LogIn color={"#fff"} />
                  </>
                )}
              </TouchableOpacity>

              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-border" />
                <Text className="px-4 text-sm font-medium text-muted-foreground uppercase">
                  or continue with
                </Text>
                <View className="flex-1 h-px bg-border" />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                  className="flex-1 h-14 bg-white border-2 border-border rounded-xl flex-row items-center justify-center gap-2 active:bg-neutral-50"
                >
                  {loading ? <ActivityIndicator /> : <Google />}
                  <Text className="font-semibold text-foreground">Google</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 h-14 bg-white border-2 border-border rounded-xl flex-row items-center justify-center gap-2 active:bg-neutral-50">
                  <Facebook />
                  <Text className="font-semibold text-foreground">
                    Facebook
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center items-center mt-8 mb-8 ">
                <Text className="text-muted-foreground text-base">
                  Don&apos;t have an account?
                </Text>
                <Link href={"/(auth)/signup"} asChild>
                  <TouchableOpacity className="ml-2">
                    <Text className="text-primary font-semibold text-base underline">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
