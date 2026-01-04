import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Stack } from 'expo-router'

export default function OnboardingLayout() {
  return <Redirect href={'/(auth)/signup'}/>
  return (
    <Stack screenOptions={
        {
            headerShown : false,
            animation: 'fade',
            statusBarHidden : true,
        }
    }/>
  )
}