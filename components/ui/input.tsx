import { View, Text, TextInput } from "react-native";
import React from "react";

export default function Input({
  error,
  value,
  label,
  setValue,
  placeholder,
  keyboardType,
  secure,
  required,
}: {
  required?: boolean;
  error?: string;
  secure: boolean;
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  keyboardType: "email-address" | "phone-pad" | "default";
}) {
  return (
    <View className="mb-4 flex-1">
      <Text className="text-base mb-2 ">
        {label} {required && <Text className="text-primary font-bold">*</Text>}
      </Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        keyboardType={keyboardType}
        autoCapitalize="none"
        onChangeText={setValue}
        placeholderTextColor={"gray"}
        secureTextEntry={secure}
        className={`border rounded-xl text-black px-4 text-base py-4 ${error ? "border-red-500" : "border-border"} `}
      />
      {!!error && <Text className="text-red-500 text-sm">{error}</Text>}
    </View>
  );
}
