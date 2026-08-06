import 'react-native-gesture-handler'
import SplashAnimation from '@/components/SplashAnimation'
import {
  profileNeedsOnboarding,
  subscribeAppUnlocked,
} from '@/lib/profiles/onboarding'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import './globals.css'

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [allowApp, setAllowApp] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    return subscribeAppUnlocked(() => setAllowApp(true))
  }, [])

  useEffect(() => {
    let mounted = true

    async function applySession(next: Session | null, event: string) {
      if (!mounted) return

      if (!next) {
        setSession(null)
        setAllowApp(false)
        setLoading(false)
        return
      }

      if (event === 'TOKEN_REFRESHED') {
        setSession(next)
        return
      }

      if (event === 'INITIAL_SESSION') {
        const { error } = await supabase.auth.getUser()
        if (!mounted) return
        if (error) {
          await supabase.auth.signOut()
          return
        }
      }

      // Know allowApp before session is set so tabs never mount for new users.
      const needsOnboarding = await profileNeedsOnboarding(next.user.id)
      if (!mounted) return

      setAllowApp(!needsOnboarding)
      setSession(next)
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      void applySession(next, event)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

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
        {/* Locked until display_name exists — no feed flash after OTP */}
        <Stack.Protected guard={!!session && allowApp}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="chats/[id]"
            options={{
              headerShown: false,
              statusBarTranslucent: true,
              statusBarBackgroundColor: 'transparent',
            }}
          />
          <Stack.Screen name="chats/archived" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  )
}
