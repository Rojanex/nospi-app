import { TabScreen } from '@/components/layout/TabScreen'
import { FounderCta } from '@/components/profile/FounderCta'
import { OnboardingBanner } from '@/components/profile/OnboardingBanner'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileIdentity } from '@/components/profile/ProfileIdentity'
import { ProfileStats } from '@/components/profile/ProfileStats'
import {
  ProfileRecentPlan,
  RecentPlansSection,
} from '@/components/profile/RecentPlansSection'
import { FOUNDER_TYPEFORM_URL } from '@/lib/env_reader'
import type { Profile } from '@/types'
import { useRouter } from 'expo-router'
import React from 'react'
import { Linking, ScrollView } from 'react-native'

// TODO: replace MOCK_PROFILE + MOCK_RECENT_PLANS with Supabase fetch (lib/profiles/api.ts)

const MOCK_PROFILE: Profile = {
  id: 'mock-user-001',
  phone: '+573001112233',
  display_name: 'Camila R.',
  avatar_url: null,
  role: 'explorer',
  plans_created_this_week: 2,
  plans_joined_this_week: 5,
  reputation_score: 0,
  home_city: 'Cartagena',
  is_founder: false,
  onboarding_completed: false,
  created_at: '2026-06-01T12:00:00.000Z',
  updated_at: '2026-08-10T12:00:00.000Z',
}

const MOCK_RECENT_PLANS: ProfileRecentPlan[] = [
  {
    id: 'plan-mock-1',
    title: 'Ceviche en Bazurto',
    activity_type: 'comida',
    date_time: '2026-08-12T19:00:00.000Z',
  },
  {
    id: 'plan-mock-2',
    title: 'Atardecer en La Boquilla',
    activity_type: 'playa',
    date_time: '2026-08-11T17:30:00.000Z',
  },
  {
    id: 'plan-mock-3',
    title: 'Fútbol 5 en Manga',
    activity_type: 'deporte',
    date_time: '2026-08-10T18:00:00.000Z',
  },
  {
    id: 'plan-mock-4',
    title: 'Rumba en Getsemaní',
    activity_type: 'rumba',
    date_time: '2026-08-09T22:00:00.000Z',
  },
  {
    id: 'plan-mock-5',
    title: 'Café y charla',
    activity_type: 'social',
    date_time: '2026-08-08T16:00:00.000Z',
  },
  {
    id: 'plan-mock-6',
    title: 'Museo del Oro',
    activity_type: 'cultura',
    date_time: '2026-08-07T11:00:00.000Z',
  },
]

export default function ProfileScreen() {
  const router = useRouter()
  const profile = MOCK_PROFILE
  const recentPlans = MOCK_RECENT_PLANS

  function handleSettingsPress() {
    // Stub — settings screen lands in a follow-up prompt
    router.push('/settings' as never)
  }

  function handleOnboardingPress() {
    router.push('/(onboarding)/dni-verify' as never)
  }

  function handleFounderPress() {
    Linking.openURL(FOUNDER_TYPEFORM_URL)
  }

  function handleSeeAllPlans() {
    // Stub — full history list comes later
  }

  function handlePlanPress(planId: string) {
    router.push({
      pathname: '/chats/[id]',
      params: { id: planId },
    } as never)
  }

  function handleEmptyCtaPress() {
    router.push('/(tabs)/' as never)
  }

  return (
    <TabScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader onSettingsPress={handleSettingsPress} />

        <ProfileIdentity profile={profile} />

        <ProfileStats
          created={profile.plans_created_this_week}
          attended={profile.plans_joined_this_week}
        />

        {!profile.onboarding_completed ? (
          <OnboardingBanner onPress={handleOnboardingPress} />
        ) : null}

        {!profile.is_founder ? (
          <FounderCta onPress={handleFounderPress} />
        ) : null}

        <RecentPlansSection
          plans={recentPlans}
          onSeeAll={handleSeeAllPlans}
          onPlanPress={handlePlanPress}
          onEmptyCtaPress={handleEmptyCtaPress}
        />
      </ScrollView>
    </TabScreen>
  )
}
