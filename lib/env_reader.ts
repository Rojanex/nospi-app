/**
 * App public config from EXPO_PUBLIC_* vars. In Expo they are inlined at bundle time —
 * use different .env / EAS env per build profile to change values for each release.
 *
 * Low-level parsing lives in `@/lib/utils/env` (integers today; strings / dates later).
 */
import { readEnvInt, readEnvString } from '@/lib/utils/env'

export const SUPABASE_URL = readEnvString('EXPO_PUBLIC_SUPABASE_URL', '')
export const SUPABASE_ANON_KEY = readEnvString('EXPO_PUBLIC_SUPABASE_ANON_KEY', '')


// Auth flow env_vars needed
export const RESEND_COUNTDOWN_IN_SECONDS = readEnvInt('EXPO_PUBLIC_RESEND_SECONDS', 60 + 30) //(default 1:30)
export const OTP_LENGTH = readEnvInt('EXPO_PUBLIC_OTP_LENGTH', 6)
export const SIGN_IN_PHONE_MIN_DIGITS = readEnvInt('EXPO_PUBLIC_SIGN_IN_PHONE_MIN_DIGITS', 4)

// New plan sheet
export const NEW_PLAN_TITLE_MAX = readEnvInt('EXPO_PUBLIC_NEW_PLAN_TITLE_MAX', 80)
export const NEW_PLAN_DESCRIPTION_MAX = readEnvInt('EXPO_PUBLIC_NEW_PLAN_DESCRIPTION_MAX', 300)
export const NEW_PLAN_MAX_SPOTS = readEnvInt('EXPO_PUBLIC_NEW_PLAN_MAX_SPOTS', 6)

// Google Places
export const GOOGLE_PLACES_KEY = readEnvString('EXPO_PUBLIC_GOOGLE_PLACES_KEY', '')

// Profile
export const FOUNDER_TYPEFORM_URL = readEnvString(
  'EXPO_PUBLIC_FOUNDER_TYPEFORM_URL',
  'https://form.typeform.com/to/PLACEHOLDER',
)

// Chat performance
export const CHAT_LIST_CACHE_TTL_MS = readEnvInt('EXPO_PUBLIC_CHAT_LIST_CACHE_TTL_MS', 60_000)
export const MESSAGES_CACHE_TTL_MS = readEnvInt('EXPO_PUBLIC_MESSAGES_CACHE_TTL_MS', 30_000)
export const MESSAGES_PAGE_SIZE = readEnvInt('EXPO_PUBLIC_MESSAGES_PAGE_SIZE', 70)