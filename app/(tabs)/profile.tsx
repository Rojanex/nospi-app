import { Colors } from '@/assets/constants/Colors'
import { TabScreen } from '@/components/layout/TabScreen'
import { FounderCta } from '@/components/profile/FounderCta'
import { OnboardingBanner } from '@/components/profile/OnboardingBanner'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader'
import { RecentPlansSection } from '@/components/profile/RecentPlansSection'
import { strings } from '@/constants/strings'
import { getChatListCache, prefetchMessages } from '@/lib/chats/api'
import { FOUNDER_TYPEFORM_URL } from '@/lib/env_reader'
import {
  fetchProfile,
  fetchRecentJoinedPlans,
  type ProfileRecentPlan,
  type ProfileWithStats,
} from '@/lib/profiles/api'
import { subscribePlansChanged } from '@/lib/plans/plansEvents'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

function toProfileViewModel(data: ProfileWithStats): Profile {
  return {
    id: data.id,
    phone: null,
    display_name: data.display_name,
    avatar_url: data.avatar_url,
    role: data.role,
    plans_created_this_week: data.plansCreated,
    plans_joined_this_week: data.plansJoined,
    reputation_score: 0,
    home_city: data.home_city,
    is_founder: data.is_founder,
    onboarding_completed: data.onboarding_completed,
    created_at: '',
    updated_at: '',
  }
}

export default function ProfileScreen() {
  const router = useRouter()
  const hasLoadedRef = useRef(false)
  const [profileData, setProfileData] = useState<ProfileWithStats | null>(null)
  const [recentPlans, setRecentPlans] = useState<ProfileRecentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const profile = useMemo(
    () => (profileData ? toProfileViewModel(profileData) : null),
    [profileData],
  )

  const loadProfile = useCallback(async (background = false) => {
    if (!background) setError(null)
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw authError ?? new Error('Not authenticated')
      }

      const [nextProfile, nextPlans] = await Promise.all([
        fetchProfile(user.id),
        fetchRecentJoinedPlans(user.id),
      ])

      setProfileData(nextProfile)
      setRecentPlans(nextPlans)
      hasLoadedRef.current = true
    } catch (err) {
      if (!background) {
        console.error('[profile] load', err)
        setError(strings.profile.loadError)
      }
    }
  }, [])

  useEffect(() => {
    loadProfile().finally(() => setLoading(false))
  }, [loadProfile])

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedRef.current) return
      void loadProfile(true)
    }, [loadProfile]),
  )

  useEffect(() => {
    return subscribePlansChanged(() => {
      void loadProfile(true)
    })
  }, [loadProfile])

  function handleSettingsPress() {
    router.push('/settings' as never)
  }

  function handleOnboardingPress() {
    router.push('/(onboarding)/dni-verify' as never)
  }

  function handleFounderPress() {
    Linking.openURL(FOUNDER_TYPEFORM_URL)
  }

  function handleSeeAllPlans() {
    router.push('/(tabs)/chats' as never)
  }

  function handlePlanPress(planId: string) {
    const cached = getChatListCache()?.find(item => item.id === planId) ?? null
    if (cached) prefetchMessages(planId)
    router.push({
      pathname: '/chats/[id]',
      params: cached ? { id: planId, chat: JSON.stringify(cached) } : { id: planId },
    } as never)
  }

  function handleEmptyCtaPress() {
    router.push('/(tabs)/' as never)
  }

  if (loading) {
    return (
      <TabScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.buttons.orange} />
        </View>
      </TabScreen>
    )
  }

  if (error && !profile) {
    return (
      <TabScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center text-body text-ink-50">{error}</Text>
          <TouchableOpacity onPress={() => loadProfile()} hitSlop={8}>
            <Text className="text-body font-semibold text-buttons-orange">
              {strings.profile.retry}
            </Text>
          </TouchableOpacity>
        </View>
      </TabScreen>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <TabScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <ProfileScreenHeader onSettingsPress={handleSettingsPress} />

        {error ? (
          <View className="mb-4 items-center">
            <Text className="mb-2 text-center text-body text-ink-50">{error}</Text>
            <TouchableOpacity onPress={() => loadProfile()} hitSlop={8}>
              <Text className="text-body font-semibold text-buttons-orange">
                {strings.profile.retry}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <ProfileHeader
          profile={profile}
          plansCreated={profile.plans_created_this_week} //Todo - this should be this week's plans created
          plansJoined={profile.plans_joined_this_week}
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
