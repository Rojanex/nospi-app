import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="name" />
      <Stack.Screen name="dni-verify" />
      <Stack.Screen name="selfie" />
    </Stack>
  )
}