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
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<any | null>(null);

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
    try {
      setLoading(true);
      const response = await authService.login(data);
    } catch (error) {
      if (
        error.status === 403 &&
        error.response.data.error_code === "ACCOUNT_NOT_VERIFIED"
      ) {
        console.log(JSON.stringify(error.response.data.data));

        router.push({
          pathname: "/(auth)/confirm-otp",
          params: {
            user_id: error.response.data.data.user_id,
            email: error.response.data.data.email,
            email_mask: error.response.data.data.email_masked,
            otp_expiry_minutes: error.response.data.data.otp_expiry_minutes,
          },
        });
      } else {
        if (error.response.data) {
          console.log(
            JSON.stringify(error.response.data),
            error.response.data.error.errors[0]
          );
          setError(error.response.data.error.errors[0]);
          console.log(validationError);
        } else {
          setError("Error men");
        }
      }
    } finally {
      setLoading(false);
    }
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
                  onPress={() => {}}
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
