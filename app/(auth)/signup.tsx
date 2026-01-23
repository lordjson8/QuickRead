import { Link, router } from "expo-router";
import { Eye, EyeClosed } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
  GoogleSigninButton,
  statusCodes,
  SignInResponse,
  isErrorWithCode,
  isSuccessResponse,
  User,
} from "@react-native-google-signin/google-signin";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, G } from "react-native-svg";
import { Controller, useForm } from "react-hook-form";
import { SignupFormData, SignupSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { baseURL } from "@/services/api.service";
import authService from "@/services/auth.service";
import { AxiosError } from "axios";

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

GoogleSignin.configure({
  webClientId:
    "592514759965-u8djt882it06mqiiornalvovgskjt49k.apps.googleusercontent.com", // From Google Cloud Console
  // webClientId: "592514759965-62mmuvev6m38vri9gifef85qdiirkhp2.apps.googleusercontent.com",
  offlineAccess: true, // If you need to access Google API on behalf of the user
  forceCodeForRefreshToken: true, // [Android] related to offlineAccess
  iosClientId:
    "592514759965-45f4urfaqpki8qkoug2p10hk6n12ur3g.apps.googleusercontent.com", // [iOS]
  profileImageSize: 120, // [iOS] The desired dimension (width/height) of the profile image
});

export default function SignUp() {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<any | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      first_name: "",
      email: "",
      password: "",
    },
  });

  const OnSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true);
      setError(null)
      setValidationError(null)
      const response = await authService.register(data);
      console.log(response.data);
      router.push({
        pathname: "/(auth)/confirm-otp",
        params: {
          user_id: response.data.data.user_id,
          email: response.data.data.email,
          email_mask: response.data.data.email_mask,
          otp_expiry_minutes: response.data.data.otp_expiry_minutes,
        },
      });
    } catch (error: any) {
      if (error.response.data) {
        console.log(JSON.stringify(error.response.data));
        setValidationError(error.response.data.error.details);
        console.log(validationError);
      } else {
        setError("Error men");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already signed in
  // useEffect(() => {
  //   checkIfUserIsSignedIn();
  // }, []);

  // const checkIfUserIsSignedIn = async () => {
  //   try {
  //     const isSignedIn = await GoogleSignin.getCurrentUser();
  //     if (isSignedIn) {
  //       const user = await GoogleSignin.getCurrentUser();
  //       setUserInfo(user);
  //     }
  //   } catch (error) {
  //     console.log("Error checking sign-in status:", error);
  //   }
  // };

  // const signIn = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     setUserInfo(userInfo.data);

  //     // Get access token if needed for backend
  //     const tokens = await GoogleSignin.getTokens();
  //     console.log('Access Token:', tokens.accessToken);

  //     // Send token to your backend for verification
  //     // await verifyTokenWithBackend(tokens.accessToken);

  //   } catch (error: any) {

  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const signOut = async () => {
  //   try {
  //     await GoogleSignin.signOut();
  //     setUserInfo(null);
  //     setError(null);
  //   } catch (error) {
  //     console.log('Sign out error:', error);
  //     setError('Error signing out');
  //   }
  // };

  // const revokeAccess = async () => {
  //   try {
  //     await GoogleSignin.revokeAccess();
  //     await GoogleSignin.signOut();
  //     setUserInfo(null);
  //     setError(null);
  //   } catch (error) {
  //     console.log('Revoke access error:', error);
  //   }
  // };

  // if (loading) {
  //   return (
  //     <View >
  //       <ActivityIndicator size="large" color="#4285F4" />
  //      </View>
  //   );
  // }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log("proc");
      const suceess = await GoogleSignin.hasPlayServices();
      console.log("success", suceess);
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data;
        const { name, id, photo, email } = user;
        console.log("user", user);
      }
      // setError(null);
    } catch (error: any) {
      console.log(error);
      console.log("Google Sign-In Error:", error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setError("Sign in was cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setError("Sign in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError("Play services not available");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
      console.log("fin");
    }
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
              <View className="flex-1 rounded-lg border-2 border-red-400 bg-red-300 px-4 py-2">
                <Text className="text-white font-bold">{error}</Text>
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
                    <Text>→</Text>
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
                <TouchableOpacity className="flex-1 h-14 bg-white border-2 border-border rounded-xl flex-row items-center justify-center gap-2 active:bg-neutral-50">
                  <Facebook />
                  <Text className="font-semibold text-foreground">
                    Facebook
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center items-center mt-8 mb-8 bg-secondary">
                <Text className="text-muted-foreground text-base">
                  Already have an account?
                </Text>
                <Link disabled={loading} href={"/(auth)/login"} asChild>
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
