# Expo Boilerplate

A clean, opinionated React Native starter using Expo Router, NativeWind, TypeScript, and Supabase (phone OTP auth).

## Stack

| Layer | Tool |
|---|---|
| Framework | React Native 0.81 + Expo 54 |
| Routing | Expo Router 6 (file-based) |
| Styling | NativeWind 4 (Tailwind CSS) |
| Auth / DB | Supabase |
| Types | TypeScript 5.8, path alias `@/*` |
| Fonts | Rubik (Regular → ExtraBold) |

---

## Folder Structure

```
app/
  _layout.tsx          # Root stack — add auth guard here
  (auth)/
    _layout.tsx
    sign-in.tsx         # Phone number input
    verify.tsx          # OTP input
  (tabs)/
    _layout.tsx         # Tab navigator
    index.tsx           # Home tab
    discover.tsx        # Discover tab
    profile.tsx         # Profile tab

lib/
  supabase.ts           # Supabase client (configure via .env)

types/
  index.ts              # Domain interfaces — replace with your models

assets/
  constants/Colors.ts   # Colour palette
  icons/                # SVG icon components + Icon factory
  fonts/                # Rubik font files
```

---

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Supabase** — create a `.env` file in the project root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Start the dev server**
   ```bash
   npx expo start
   ```

---

## Auth Flow (phone OTP)

```
sign-in.tsx
  → supabase.auth.signInWithOtp({ phone })
  → router.push('/(auth)/verify')

verify.tsx
  → supabase.auth.verifyOtp({ phone, token, type: 'sms' })
  → router.replace('/(tabs)')
```

To add the auth guard to the root layout, uncomment the TODO block in `app/_layout.tsx`.

---

## Adding a Tab

1. Create `app/(tabs)/my-tab.tsx`
2. Add a `<Tabs.Screen name="my-tab" ... />` entry in `app/(tabs)/_layout.tsx`
3. Add or reuse an icon (see below)

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

---

## Styling

All components use NativeWind (Tailwind) classes. Custom colours and fonts are defined in `tailwind.config.js` and mirrored in `assets/constants/Colors.ts`.

```tsx
<Text className="text-black-100 font-rubik-bold text-2xl">Hello</Text>
```

Font classes: `font-rubik`, `font-rubik-medium`, `font-rubik-semibold`, `font-rubik-bold`, `font-rubik-extrabold`, `font-rubik-light`

Colour tokens: `primary-100` (#F2AD78), `primary-200` (#F6EEEC), `primary-300` (#FBF7F6), `accent-100` (#FBFBFD), `black` (#000000), `black-100` (#373026), `black-200` (#666876), `black-300` (#8C8E98), `black-400` (#888780), `buttons-orange` (#ED862F), `buttons-brown` (#373026), `danger` (#F75555)
