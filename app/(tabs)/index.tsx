import React from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Index() {
  return (
    <SafeAreaView className='flex-1 items-center justify-center'>
    <Text className='text-center font-bold text-5xl capitalize text-white'>
      {/* <Text className='text-green-500'>Idrissou Zira</Text> ton <Text className='text-red-500'>bangala</Text>  */}
    </Text>
    <View className='mt-4'>
      <Text className='text-white font-3xl font bold'>
        Tes gros noyaeux
      </Text>
    </View>
    </SafeAreaView>
  )
}
