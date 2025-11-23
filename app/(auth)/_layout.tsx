import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={
        {
            headerShown : false,
            statusBarStyle : 'dark',
        }
        
    }>
      <Stack.Screen name="login"  />
      <Stack.Screen name="confirm-otp"  />
      </Stack>
  )
}