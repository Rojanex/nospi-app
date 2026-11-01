/**
 * App public config from EXPO_PUBLIC_* vars. In Expo they are inlined at bundle time —
 * use different .env / EAS env per build profile to change values for each release.
 *
 * Every value must be read as `process.env.EXPO_PUBLIC_X` (never `process.env[name]`),
 * otherwise it is empty in release builds. Parsing lives in `@/lib/utils/env`.
 */
import { readEnvBool, readEnvInt, readEnvString } from '@/lib/utils/env'

export const SUPABASE_URL = readEnvString(
  'EXPO_PUBLIC_SUPABASE_URL',
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  '',
)
export const SUPABASE_ANON_KEY = readEnvString(
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  '',
)

// Auth flow env_vars needed
export const RESEND_COUNTDOWN_IN_SECONDS = readEnvInt(
  'EXPO_PUBLIC_RESEND_SECONDS',
  process.env.EXPO_PUBLIC_RESEND_SECONDS,
  60 + 30, //(default 1:30)
)
export const OTP_LENGTH = readEnvInt(
  'EXPO_PUBLIC_OTP_LENGTH',
  process.env.EXPO_PUBLIC_OTP_LENGTH,
  6,
)
export const SIGN_IN_PHONE_MIN_DIGITS = readEnvInt(
  'EXPO_PUBLIC_SIGN_IN_PHONE_MIN_DIGITS',
  process.env.EXPO_PUBLIC_SIGN_IN_PHONE_MIN_DIGITS,
  4,
)

// New plan sheet
export const NEW_PLAN_TITLE_MAX = readEnvInt(
  'EXPO_PUBLIC_NEW_PLAN_TITLE_MAX',
  process.env.EXPO_PUBLIC_NEW_PLAN_TITLE_MAX,
  80,
)
export const NEW_PLAN_DESCRIPTION_MAX = readEnvInt(
  'EXPO_PUBLIC_NEW_PLAN_DESCRIPTION_MAX',
  process.env.EXPO_PUBLIC_NEW_PLAN_DESCRIPTION_MAX,
  300,
)
export const NEW_PLAN_MAX_SPOTS = readEnvInt(
  'EXPO_PUBLIC_NEW_PLAN_MAX_SPOTS',
  process.env.EXPO_PUBLIC_NEW_PLAN_MAX_SPOTS,
  6,
)

// Google Places
export const GOOGLE_PLACES_KEY = readEnvString(
  'EXPO_PUBLIC_GOOGLE_PLACES_KEY',
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY,
  '',
)

// Identity verification (document + selfie/liveness). When off, phone OTP is the only check:
// onboarding ends after the name step and local/explorer labels and "solo locales" are hidden.
export const VERIFICATION_ENABLED = readEnvBool(
  'EXPO_PUBLIC_VERIFICATION_ENABLED',
  process.env.EXPO_PUBLIC_VERIFICATION_ENABLED,
  false,
)

// Profile
export const FOUNDER_TYPEFORM_URL = readEnvString(
  'EXPO_PUBLIC_FOUNDER_TYPEFORM_URL',
  process.env.EXPO_PUBLIC_FOUNDER_TYPEFORM_URL,
  'https://form.typeform.com/to/PLACEHOLDER',
)

// Legal pages linked from the signup consent checkbox and the accept-terms screen.
// Published on nospi.club (version 2026-10-30); source text lives in nospi-astro/src/legal/.
export const TERMS_URL = readEnvString(
  'EXPO_PUBLIC_TERMS_URL',
  process.env.EXPO_PUBLIC_TERMS_URL,
  'https://nospi.club/terminos',
)
export const PRIVACY_URL = readEnvString(
  'EXPO_PUBLIC_PRIVACY_URL',
  process.env.EXPO_PUBLIC_PRIVACY_URL,
  'https://nospi.club/privacidad',
)

// Chat performance
export const CHAT_LIST_CACHE_TTL_MS = readEnvInt(
  'EXPO_PUBLIC_CHAT_LIST_CACHE_TTL_MS',
  process.env.EXPO_PUBLIC_CHAT_LIST_CACHE_TTL_MS,
  60_000,
)
export const MESSAGES_CACHE_TTL_MS = readEnvInt(
  'EXPO_PUBLIC_MESSAGES_CACHE_TTL_MS',
  process.env.EXPO_PUBLIC_MESSAGES_CACHE_TTL_MS,
  30_000,
)
export const MESSAGES_PAGE_SIZE = readEnvInt(
  'EXPO_PUBLIC_MESSAGES_PAGE_SIZE',
  process.env.EXPO_PUBLIC_MESSAGES_PAGE_SIZE,
  70,
)
