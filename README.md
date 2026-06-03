# Nospi Native

A React Native app built with Expo Router, NativeWind, TypeScript, and Supabase (phone OTP auth).

## Stack

| Layer | Tool |
|---|---|
| Framework | React Native 0.81 + Expo 54 |
| Routing | Expo Router 6 (file-based) |
| Styling | NativeWind 4 (Tailwind CSS) |
| Auth / DB | Supabase |
| Animations | React Native Reanimated 4 |
| Types | TypeScript 5.8, path alias `@/*` |

---

## Route Tree

```
app/
├── _layout.tsx          ← Root: session guard + splash animation
│
├── (auth)/              ← Unauthenticated flow
│   ├── welcome.tsx      ← Landing with image bg + 2 CTA buttons
│   ├── sign-in.tsx      ← Phone input + country picker → OTP
│   └── otp-verify.tsx   ← 6-box OTP input, resend countdown
│
├── (onboarding)/        ← New user flow (post-login, isNewUser check)
│   ├── name.tsx         ← Display name → saves to profiles.display_name
│   ├── dni-verify.tsx   ← CC / International doc → SHA256 hash → profiles
│   └── selfie.tsx       ← Liveness stub (SDK not wired yet)
│
└── (tabs)/              ← Authenticated app
    ├── index.tsx        ← Home
    ├── discover.tsx     ← Explore
    └── profile.tsx      ← Profile
```

---

## Folder Structure

```
app/                      # Screens + layouts (Expo Router)
assets/
  constants/Colors.ts     # Colour palette (mirrored in tailwind.config.js)
  icons/                  # SVG icon components + Icon factory
  fonts/                  # Rubik font files (NOT BEING USED)
  animations/             # Lottie JSON files (splash)
  images/                 # Static images per screen
components/
  SplashAnimation.tsx     # Lottie splash wrapper
constants/
  strings.ts              # All UI copy in Spanish
lib/
  supabase.ts             # Supabase client
  env_reader.ts           # EXPO_PUBLIC_* env exports
  utils/env.ts            # Low-level env parsing helpers
types/
  index.ts                # Domain interfaces
```

---

## Colors

| Token | Value | Use |
|---|---|---|
| `primary-100` | `#F2AD78` | Active tab, OTP box focus border |
| `primary-200` | `#F6EEEC` | — |
| `primary-300` | `#FBF7F6` | Screen background |
| `accent-100` | `#FBFBFD` | — |
| `black-100` | `#373026` | Headings, body text |
| `black-200` | `#666876` | Inactive tab |
| `black-300` | `#8C8E98` | — |
| `black-400` | `#888780` | Back arrow, secondary text |
| `neutral-hint` | `#B4B2A9` | Placeholders, hints |
| `buttons-orange` | `#ED862F` | Primary button, active pill |
| `buttons-brown` | `#373026` | Secondary button |
| `form-error` | `#D94F4F` | Inline form errors |
| `danger` | `#F75555` | — |

---

## Global CSS Classes (`app/globals.css`)

| Class | Definition |
|---|---|
| `.screen-root` | `flex-1 bg-primary-300` |
| `.screen-safe` | `flex-1 bg-transparent` |
| `.back-bar` | `pt-4 px-5 pb-2` |
| `.auth-title` | ExtraBold, `#373026`, 38px, 44px leading |
| `.auth-subtitle` | `#888780`, 15px, 22px leading |
| `.auth-content` | `flex-1 justify-end px-7 pb-12` |
| `.btn-primary` | `bg-buttons-orange h-14 rounded-[28px]` |
| `.btn-primary--disabled` | `opacity-50` |
| `.btn-primary-text` | White, bold, 15px |
| `.btn-secondary` | `bg-buttons-brown h-14 rounded-[28px]` |
| `.form-error-text` | `text-form-error`, 13px, centered |

---

## Strings (`constants/strings.ts`)

All UI copy is centralized here in Spanish. Grouped by screen:

- `onboarding.welcome*` — Welcome screen
- `onboarding.signIn*` — Phone input screen
- `onboarding.verify*` — OTP screen
- `onboarding.name*` — Name input screen
- `onboarding.dni*` — Document input screen
- `onboarding.liveness*` — Selfie/liveness screen

---

## Screen Status

| Screen | Status |
|--------|--------|
| Welcome | Done |
| Sign-in (phone + country picker) | Done |
| OTP verify | Done |
| Name (onboarding) | Done — saves to `profiles.display_name` |
| DNI verify (onboarding) | Done — SHA256 hash, dupe check, CC/DNI toggle |
| Selfie / Liveness (onboarding) | Stub — UI done, SDK not wired |
| Tabs (Home / Discover / Profile) | Placeholder screens |

---

## Auth Flow

```
welcome.tsx
  → sign-in.tsx
      → supabase.auth.signInWithOtp({ phone })
      → otp-verify.tsx
          → supabase.auth.verifyOtp({ phone, token, type: 'sms' })
          → isNewUser? /(onboarding)/name : /(tabs)/
```

New user detection: `user.created_at === user.last_sign_in_at` at OTP verification.

---

## Onboarding Flow

```
name.tsx
  → profiles.update({ display_name })
  → dni-verify.tsx
      → SHA256(dni) → profiles.update({ dni_hash, dni_type, dni_verified })
      → (CC only) triggerRNECVerification()   ← TODO: Supabase edge function
      → selfie.tsx
          → liveness SDK                       ← TODO: not wired
          → /(tabs)/
```

Both DNI and selfie steps have a "do this later" skip link that goes directly to `/(tabs)/`.

---

## Env Variables

| Variable | Default | Description |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | — | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | — | Supabase anon key |
| `EXPO_PUBLIC_RESEND_SECONDS` | `170` (2:50) | OTP resend countdown |
| `EXPO_PUBLIC_OTP_LENGTH` | `6` | OTP digit count |
| `EXPO_PUBLIC_SIGN_IN_PHONE_MIN_DIGITS` | `4` | Min digits to enable send button |

---

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Supabase** — create a `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Start the dev server**
   ```bash
   npx expo start
   ```

---

## Icon System

Icons live in `assets/icons/`. Each is a named SVG export accepting `{ size, color }`.

**Add an icon:**
1. Create `assets/icons/MyIcon.tsx` — copy the pattern from `Home.tsx`
2. Add it to `assets/icons/index.tsx`: import, named export, `IconMap` entry, `IconName` union

**Use an icon:**
```tsx
import { Icon } from '@/assets/icons'

<Icon name="home" size={24} color="#F2AD78" />
```
