import { strings } from '@/constants/strings'
import { SUPPORT_EMAIL } from '@/lib/env_reader'
import Constants from 'expo-constants'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Linking, Platform } from 'react-native'

const MAIL_ERROR_MS = 4000

export function appVersion(): string {
  return Constants.expoConfig?.version ?? ''
}

function platformLabel(): string {
  const os = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : Platform.OS
  return `${os} ${Platform.Version}`
}

function supportMailUrl(subject: string): string {
  const footer = strings.settings.supportFooter(appVersion(), platformLabel())
  const body = `\n\n\n—\n${footer}`
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/**
 * Opens the mail app to soporte with the app version in the body.
 * `mailError` is a self-dismissing message for when no mail app is installed.
 */
export function useSupportMail() {
  const [mailError, setMailError] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const openSupportMail = useCallback((subject: string) => {
    Linking.openURL(supportMailUrl(subject)).catch(err => {
      console.error('[support] open mail', err)
      setMailError(strings.settings.mailError(SUPPORT_EMAIL))
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setMailError(null), MAIL_ERROR_MS)
    })
  }, [])

  return { openSupportMail, mailError }
}
