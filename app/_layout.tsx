import 'react-native-gesture-handler'
import SplashAnimation from '@/components/SplashAnimation'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import './globals.css'

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { error } = await supabase.auth.getUser()
        if (error) {
          await supabase.auth.signOut()
          setSession(null)
        } else {
          setSession(session)
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (loading || showSplash) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/welcome') //TODO - DEV only ('/(onboarding)/name')
    }
  }, [session, loading, showSplash, segments])

  if (showSplash) {
    return <SplashAnimation onFinish={() => setShowSplash(false)} />
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="Colors.primary.100" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="chats/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="chats/archived" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
