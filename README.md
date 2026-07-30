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

## Codebase structure (guidelines)

Structure is feature-oriented. Screens stay thin; domain logic and data access live under `lib/{feature}/`; UI pieces live under `components/{feature}/`.

### Where things go

| Concern | Location | Examples |
|---|---|---|
| Routes / screens | `app/` | `(tabs)/chats.tsx`, `chats/[id].tsx` |
| Feature UI | `components/{feature}/` | `components/chats/ChatRow.tsx` |
| Shared layout / chrome | `components/layout/`, `components/ui/`, `components/tabs/` | `TabScreen`, `Skeleton` |
| Feature data + domain logic | `lib/{feature}/` | `lib/chats/api.ts`, `lib/plans/lifecycle.ts` |
| Shared helpers | `lib/utils/` | `avatar.ts`, `env.ts` |
| Supabase client / env | `lib/supabase.ts`, `lib/env_reader.ts` | — |
| Domain types | `types/index.ts` | `Plan`, `ChatListItem`, `PlanMetaRow` |
| UI copy (Spanish) | `constants/strings.ts` | `strings.losMios.*`, `strings.tabs.*` |
| Feature constants | `constants/` | `activityMeta.ts`, `planStatus.ts` |
| Colour tokens | `assets/constants/Colors.ts` | Mirrored in `tailwind.config.js` |
| Custom SVG icons | `assets/icons/` | Tab / brand icons via `Icon` |

### Feature folders

Mirror the same feature name across layers:

```
components/chats/     ← ChatRow, MessageBubble, ChatComposer, …
lib/chats/            ← api.ts (fetch/send/archive), filters.ts
app/(tabs)/chats.tsx  ← list screen
app/chats/[id].tsx    ← thread screen
app/chats/archived.tsx
```

```
components/plans/     ← PlanCard, NewPlanSheet, PlansHeader, …
lib/plans/            ← createPlan, lifecycle (delete/leave), mapRowToPlan, …
app/(tabs)/index.tsx  ← plans feed
```

**Plan lifecycle** (`create` / `delete` / `leave`) belongs in `lib/plans/`, not under chats — even when the UI trigger lives in a chat screen.

### Screens stay thin

- Screens compose components, call `lib/*`, and hold local UI state.
- Prefer `lib/{feature}/api.ts` (or focused modules like `lifecycle.ts`) over inline Supabase queries in screens.
- Shared screen chrome uses `TabScreen` (`components/layout/TabScreen.tsx`) for tab screens **and** stack screens under `app/chats/` (thread, archived). Do not roll a one-off `SafeAreaView` + `bg-primary-300` shell.

### Types

- Export shared domain types from `types/index.ts`.
- Keep DB-row / mapping helpers private inside `lib/` when they are not part of the app-facing model.
- Do not redefine the same exported type in two components (e.g. import `ActivePicker` from `NewPlanFields` instead of duplicating it in `NewPlanSheet`).

### Strings

All user-facing copy lives in `constants/strings.ts` (Spanish), grouped by area:

- `onboarding.*` — auth + onboarding
- `plansFeed.*` — home feed
- `newPlan.*` — create-plan sheet
- `tabs.*` — tab bar titles
- `losMios.*` — chats list / thread / archived
- `systemMessages.*` — seeded chat system lines

No hardcoded UI labels in screens or layouts (including tab `title` options).

### Icons (mixed, intentional)

| Kind | Use |
|---|---|
| **Custom SVG + `Icon` / `IconMap`** | Brand and product icons that need a specific drawing (tab bar, logo) |
| **Ionicons** | Conventional chrome: back, lock, send, close, search, calendar, etc. |

**Add a custom icon:**
1. Create `assets/icons/MyIcon.tsx` — copy the pattern from `Home.tsx`
2. Register it in `assets/icons/index.tsx`: import, named export, `IconMap` entry, `IconName` union

```tsx
import { Icon } from '@/assets/icons'

<Icon name="home" size={24} color={Colors.primary[100]} />
```

```tsx
import { Ionicons } from '@expo/vector-icons'

<Ionicons name="chevron-back" size={24} color={Colors.ink.DEFAULT} />
```

### Styling

- Prefer NativeWind `className` and shared classes in `app/globals.css`.
- Use `Colors` from `@/assets/constants/Colors` (or Tailwind colour tokens) — avoid raw hex in components when a token exists.
- Keep `Colors.ts` and `tailwind.config.js` in sync when adding tokens.
- `StyleSheet` is fine for cases NativeWind handles poorly (complex absolute layouts, animated styles).

### Code style

- Single quotes, no semicolons (match the majority of the repo).
- Path alias: `@/*` → project root.

---

## Folder map

```
app/                         # Expo Router screens + layouts
├── _layout.tsx              # Session guard + splash
├── globals.css              # Shared NativeWind component classes
├── (auth)/                  # Welcome → sign-in → OTP
├── (onboarding)/            # Name → DNI → selfie
├── (tabs)/                  # Planes, new-plan (sheet), Los míos, Perfil
└── chats/                   # Thread + archived (stack, outside tabs)
    ├── [id].tsx
    └── archived.tsx

components/
├── chats/                   # Chat UI
├── plans/                   # Feed + create-plan UI
├── layout/                  # TabScreen and shared shells
├── tabs/                    # Tab header chrome
├── ui/                      # Generic primitives (Skeleton, …)
└── SplashAnimation.tsx

lib/
├── chats/                   # Chat list/messages/members API + filters
├── plans/                   # Create, lifecycle, mapping, form helpers, events
├── utils/                   # avatar, env helpers
├── supabase.ts
└── env_reader.ts

constants/                   # strings, activityMeta, planStatus
types/                       # Domain types
assets/
├── constants/Colors.ts
├── icons/                   # Custom SVGs + Icon factory
├── images/
├── animations/              # Lottie (splash)
└── fonts/                   # Rubik (unused for now)
```

---

## Route tree

```
app/
├── _layout.tsx              ← Root: session guard + splash animation
│
├── (auth)/                  ← Unauthenticated
│   ├── welcome.tsx
│   ├── sign-in.tsx          ← Phone + country picker → OTP
│   └── otp-verify.tsx
│
├── (onboarding)/            ← New user (post-login)
│   ├── name.tsx
│   ├── dni-verify.tsx
│   └── selfie.tsx           ← Liveness stub (SDK not wired)
│
├── (tabs)/                  ← Authenticated shell
│   ├── index.tsx            ← Plans feed
│   ├── new-plan.tsx         ← Stub; tab press opens NewPlanSheet
│   ├── chats.tsx            ← Los míos
│   └── profile.tsx
│
└── chats/                   ← Stack screens (pushed from Los míos)
    ├── [id].tsx             ← Thread
    └── archived.tsx
```

---

## Colors

Keep `assets/constants/Colors.ts` and `tailwind.config.js` mirrored.

| Token | Value | Use |
|---|---|---|
| `primary-100` | `#F2AD78` | Active tab, focus accents |
| `primary-200` | `#F6EEEC` | Sheet / soft surfaces |
| `primary-300` | `#FBF7F6` | Screen background (`.screen-root`) |
| `accent-100` | `#FBFBFD` | — |
| `black-100` | `#373026` | Headings, body |
| `black-200` | `#666876` | Inactive tab |
| `black-300` | `#8C8E98` | Secondary icons |
| `black-400` | `#888780` | Back / muted text |
| `ink` | `#1C1B19` (+ alpha steps) | Chat / dense UI text |
| `neutral-hint` | `#B4B2A9` | Placeholders |
| `buttons-orange` | `#ED862F` | Primary CTA |
| `buttons-brown` | `#373026` | Secondary CTA |
| `form-error` | `#D94F4F` | Inline form errors (Tailwind) |
| `danger` | `#F75555` | Destructive |

---

## Global CSS classes (`app/globals.css`)

| Class | Role |
|---|---|
| `.screen-root` | Full-screen root (`flex-1 bg-primary-300`) |
| `.screen-safe` | Transparent safe-area child |
| `.back-bar` | Auth/onboarding back row |
| `.auth-title` / `.auth-subtitle` | Auth typography |
| `.auth-content` | Auth bottom content stack |
| `.btn-primary` / `--disabled` / `-text` | Primary button |
| `.btn-secondary` | Secondary button |
| `.form-error-text` | Inline error |
| `.tab-header` / `.tab-body` / … | Tab chrome helpers |

---

## Auth flow

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

## Onboarding flow

```
name.tsx
  → profiles.update({ display_name })
  → dni-verify.tsx
      → SHA256(dni) → profiles.update({ dni_hash, dni_type, dni_verified })
      → (CC only) triggerRNECVerification()   ← TODO: edge function
      → selfie.tsx
          → liveness SDK                       ← TODO: not wired
          → /(tabs)/
```

DNI and selfie both offer a skip link to `/(tabs)/`.

---

## Screen status

| Screen | Status |
|--------|--------|
| Welcome / Sign-in / OTP | Done |
| Name / DNI verify | Done |
| Selfie / Liveness | Stub — UI done, SDK not wired |
| Plans feed | Done (live Supabase) |
| New plan sheet | Done |
| Los míos + thread + archived | Done (live Supabase; no realtime yet) |
| Profile | Placeholder |

---

## Env variables

| Variable | Default | Description |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | — | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | — | Supabase anon key |
| `EXPO_PUBLIC_RESEND_SECONDS` | `170` | OTP resend countdown |
| `EXPO_PUBLIC_OTP_LENGTH` | `6` | OTP digit count |
| `EXPO_PUBLIC_SIGN_IN_PHONE_MIN_DIGITS` | `4` | Min digits to enable send |
| `EXPO_PUBLIC_GOOGLE_PLACES_KEY` | — | Places autocomplete (new plan) |

---

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure env** — copy `.env.example` to `.env` and fill values:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Start the dev server**
   ```bash
   npx expo start
   ```
