import { Link } from "expo-router";
import { ArrowRight, Eye, EyeClosed } from "lucide-react-native";
import React, { useState } from "react";
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
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  User,
} from "@react-native-google-signin/google-signin";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { SignupFormData, SignupSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpUser } from "@/lib/auth";
import { Google } from "@/components/icons/Google";
import { Facebook } from "@/components/icons/Facebook";
import { googleAuthHandler } from "@/lib/oauth/googleAuthHandler";

export default function SignUpView() {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<any | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const { control, handleSubmit } = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      first_name: "",
      email: "",
      password: "",
    },
  });

  const OnSubmit = async (data: SignupFormData) => {
    await signUpUser({
      data,
      setLoading,
      setError,
      setValidationError,
    });
  };

  const handleGoogleSignIn = async () => {
    await googleAuthHandler({ setLoading, setError });
  };
  //  console.log(`base ${ba}`,baseURL)
  return (
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
              <View className="flex-1 items-center justify-center rounded-lg border-2 border-red-400 px-4 py-2 mb-2">
                <Text className="text-red-500 font-bold">{error}</Text>
              </View>
            )}
            <View className="flex-1 gap-2">
              <View className="">
                <Text className="text-lg font-semibold text-foreground">
                  Name
                </Text>
                <View className="relative">
                  <Controller
                    control={control}
                    name="first_name"
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
                          keyboardType="default"
                          autoCapitalize="words"
                          autoComplete="email"
                          editable={!loading}
                        />
                        {error && (
                          <Text className="text-red-500 font-semibold">
                            {error?.message}
                          </Text>
                        )}
                        {validationError?.first_name && (
                          <Text className="text-red-500 font-semibold">
                            {validationError.email[0]}
                          </Text>
                        )}
                      </>
                    )}
                  />
                </View>
              </View>
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
                        {error && (
                          <Text className="text-red-500 font-semibold">
                            {error?.message}
                          </Text>
                        )}
                        {validationError?.email && (
                          <Text className="text-red-500 font-semibold">
                            {validationError.email[0]}
                          </Text>
                        )}
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
                          secureTextEntry={!showPassword}
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

                      {error && (
                        <Text className="text-red-500 font-semibold">
                          {error?.message}
                        </Text>
                      )}
                      {validationError?.password && (
                        <Text className="text-red-500 font-semibold">
                          {validationError.email[0]}
                        </Text>
                      )}
                    </>
                  )}
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit(OnSubmit)}
                disabled={loading}
                className={` w-full h-14 bg-primary rounded-xl shadow-lg shadow-primary/30 active:opacity-90 mt-6 flex-row items-center justify-center gap-2`}
              >
                {loading ? (
                  <ActivityIndicator />
                ) : (
                  <>
                    <Text className="text-white text-lg font-semibold">
                      Create Account
                    </Text>
                    <ArrowRight color={"#fff"} />
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
                  onPress={() => handleGoogleSignIn()}
                  disabled={loading}
                  className="flex-1 h-14 bg-white border-2 border-border rounded-xl flex-row items-center justify-center gap-2 active:bg-neutral-50"
                >
                  {loading ? <ActivityIndicator /> : <Google />}
                  <Text className="font-semibold text-foreground">Google</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity className="flex-1 h-14 bg-white border-2 border-border rounded-xl flex-row items-center justify-center gap-2 active:bg-neutral-50">
                  <Facebook />
                  <Text className="font-semibold text-foreground">
                    Facebook
                  </Text>
                </TouchableOpacity> */}
              </View>

              <View className="flex-row justify-center items-center mt-8 mb-8 bg-secondary">
                <Text className="text-muted-foreground text-base">
                  Already have an account?
                </Text>
                <Link replace disabled={loading} href={"/(auth)/login"} asChild>
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
    </SafeAreaView>
  );
}
