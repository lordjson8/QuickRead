import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRef, useState } from "react";
import { Mail } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpSchema } from "@/lib/validations/auth";
import { z } from "zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import authService from "@/services/auth.service";

export default function OTPVerification() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { email, email_mask, otp_expiry_minutes, user_id } =
    useLocalSearchParams<{
      user_id: string;
      email: string;
      email_mask: string;
      otp_expiry_minutes: string;
    }>();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
    defaultValues: {
      pin: "",
    },
  });

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const onSubmit = async (values: z.infer<typeof OtpSchema>) => {
    try {
      setLoading(true);
      const response = await authService.sendOTP({
        user_id: user_id,
        otp_code: values.pin,
      });
    } catch (error) {
      console.log(JSON.stringify(error.response.data))
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setLoading(true);
      const response = await authService.resendOTP(user_id);
      console.log(JSON.stringify(response));
    } catch (error) {
      console.log(JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };
  // router.

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      {/* ICON */}
      <View className="w-20 h-20 bg-green-100 rounded-3xl items-center justify-center self-center mb-8">
        <Mail size={40} color="#007A5E" />
      </View>

      {/* TITLE */}
      <Text className="text-3xl font-bold text-center mb-3">
        Enter Verification Code
      </Text>

      <Text className="text-gray-600 text-center mb-10">
        We’ve sent a 6-digit code to your email {email_mask}.
      </Text>

      {/* OTP INPUT ROW */}
      <Controller
        control={control}
        name="pin"
        render={({ field: { onChange, value } }) => (
          <View className="flex-row justify-between mx-auto w-full max-w-[330px] mb-10">
            {Array.from({ length: 6 }).map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={value[index] || ""}
                onChangeText={(text) => {
                  const newValue = value.split("");
                  newValue[index] = text;
                  onChange(newValue.join(""));
                  if (text && index < 5) {
                    inputRefs.current[index + 1]?.focus();
                  }
                }}
                onKeyPress={({ nativeEvent: { key } }) => {
                  if (key === "Backspace" && !value[index] && index > 0) {
                    inputRefs.current[index - 1]?.focus();
                  }
                }}
                editable={!loading}
                keyboardType="number-pad"
                maxLength={1}
                className="w-12 h-14 border-2 border-gray-300 rounded-xl text-center text-2xl font-semibold"
              />
            ))}
          </View>
        )}
      />
      {errors.pin && (
        <Text className="text-red-500 text-center -mt-8 mb-4">
          {errors.pin.message}
        </Text>
      )}

      {/* TIMER */}
      <Text className="text-center text-gray-500 mb-6">
        Code expires in <Text className="font-bold">{otp_expiry_minutes}</Text>{" "}
        minutes
      </Text>

      {/* VERIFY BUTTON */}
      <TouchableOpacity
        disabled={watch().pin.length < 6 || loading}
        onPress={handleSubmit(onSubmit)}
        className={`placeholder:w-full bg-primary disabled:bg-gray-400 h-14 rounded-2xl items-center justify-center active:opacity-80`}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-white text-lg font-semibold">Verify Code</Text>
        )}
      </TouchableOpacity>

      {/* RESEND */}
      <Text className="text-center text-gray-600 mt-6">
        Didn’t receive the code?
      </Text>

      <TouchableOpacity onPress={() => resendOTP()} className="mt-1">
        <Text className="text-center text-primary font-semibold underline">
          Resend Code
        </Text>
      </TouchableOpacity>

      {/* SUPPORT */}
      <View className="absolute bottom-10 w-full flex-row justify-center">
        <Text className="text-gray-600">Need help?</Text>
        <Text className="text-primary ml-1 font-semibold underline">
          Contact support
        </Text>
      </View>
    </View>
  );
}
