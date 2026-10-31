import { Colors } from '@/assets/constants/Colors'
import 'react-native-gesture-handler'
import SplashAnimation from '@/components/SplashAnimation'
import {
  clearChatListCache,
  clearMessagesCache,
  clearUserIdCache,
  setCachedUserId,
} from '@/lib/chats/api'
import { VERIFICATION_ENABLED } from '@/lib/env_reader'
import {
  acceptCurrentTerms,
  consumePendingTermsAcceptance,
  fetchProfileAccess,
  subscribeAppUnlocked,
  subscribeTermsAccepted,
} from '@/lib/profiles/onboarding'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { StatusBar } from 'expo-status-bar'
import { Stack } from 'expo-router'
import { type ReactNode, useEffect, useState } from 'react'
import { ActivityIndicator, Appearance, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import './globals.css'

Appearance.setColorScheme('light')

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [allowApp, setAllowApp] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    return subscribeAppUnlocked(() => setAllowApp(true))
  }, [])

  useEffect(() => {
    return subscribeTermsAccepted(() => setTermsAccepted(true))
  }, [])

  useEffect(() => {
    let mounted = true

    async function applySession(next: Session | null, event: string) {
      if (!mounted) return

      if (!next) {
        clearUserIdCache()
        clearChatListCache()
        clearMessagesCache()
        setSession(null)
        setAllowApp(false)
        setTermsAccepted(false)
        setLoading(false)
        return
      }

      setCachedUserId(next.user.id)

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

      // Know allowApp/termsAccepted before session is set so tabs never mount for new users.
      const access = await fetchProfileAccess(next.user.id)
      let needsTerms = access.needsTerms

      const pendingConsent = event === 'SIGNED_IN' && consumePendingTermsAcceptance()
      if (needsTerms && pendingConsent) {
        const { error } = await acceptCurrentTerms(next.user.id)
        if (error) console.error('[RootLayout] save pending terms acceptance', error)
        else needsTerms = false
      }
      if (!mounted) return

      setAllowApp(!access.needsName)
      setTermsAccepted(!needsTerms)
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

  let content: ReactNode
  if (showSplash) {
    content = <SplashAnimation onFinish={() => setShowSplash(false)} />
  } else if (loading) {
    content = (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary[100]} />
      </View>
    )
  } else {
    content = (
      <Stack>
        {/* Locked until display_name exists and current terms are accepted — no feed flash after OTP */}
        <Stack.Protected guard={!!session && allowApp && termsAccepted}>
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

        <Stack.Protected guard={!!session && allowApp && !termsAccepted}>
          <Stack.Screen name="accept-terms" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!!session && (VERIFICATION_ENABLED || !allowApp)}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Light-only app: dark status bar content everywhere (switch to "auto" with dark mode, NOS-75) */}
      <StatusBar style={showSplash ? 'light': 'dark'} />
      {content}
    </GestureHandlerRootView>
  )
}
