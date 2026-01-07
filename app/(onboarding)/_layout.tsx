import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={
        {
            headerShown : false,
            animation: 'fade',
            statusBarHidden : true,
        }
    }>
      <Stack.Screen name='index'/>
      <Stack.Screen name='welcome-two'/>
      <Stack.Screen name='welcome-three'/>
      </Stack>
  )
}