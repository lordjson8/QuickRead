import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState, useRef } from "react";
import { Mail } from "lucide-react-native";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    // auto-move to next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      
      {/* ICON */}
      <View className="w-20 h-20 bg-blue-100 rounded-3xl items-center justify-center self-center mb-8">
        <Mail size={40} color="#2563eb" />
      </View>

      {/* TITLE */}
      <Text className="text-3xl font-bold text-center mb-3">
        Enter Verification Code
      </Text>

      <Text className="text-gray-600 text-center mb-10">
        We’ve sent a 6-digit code to your email.  
      </Text>

      {/* OTP INPUT ROW */}
      <View className="flex-row justify-between mx-auto w-full max-w-[330px] mb-10">

        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            value={digit}
            onChangeText={(val) => handleChange(val.replace(/[^0-9]/g, ""), index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            className="w-12 h-14 border-2 border-gray-300 rounded-xl text-center text-2xl font-semibold"
          />
        ))}

      </View>

      {/* TIMER */}
      <Text className="text-center text-gray-500 mb-6">
        Code expires in <Text className="font-bold">00:30</Text>
      </Text>

      {/* VERIFY BUTTON */}
      <TouchableOpacity className="w-full bg-blue-600 h-14 rounded-2xl items-center justify-center active:opacity-80">
        <Text className="text-white text-lg font-semibold">Verify Code</Text>
      </TouchableOpacity>

      {/* RESEND */}
      <Text className="text-center text-gray-600 mt-6">
        Didn’t receive the code?
      </Text>

      <TouchableOpacity className="mt-1">
        <Text className="text-center text-blue-600 font-semibold underline">
          Resend Code
        </Text>
      </TouchableOpacity>

      {/* SUPPORT */}
      <View className="absolute bottom-10 w-full flex-row justify-center">
        <Text className="text-gray-600">Need help?</Text>
        <Text className="text-blue-600 ml-1 font-semibold underline">
          Contact support
        </Text>
      </View>
    </View>
  );
}
