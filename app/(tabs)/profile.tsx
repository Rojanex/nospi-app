import { Colors } from '@/assets/constants/Colors'
import { TabScreen } from '@/components/layout/TabScreen'
import { PlanDetailModal } from '@/components/plans/PlanDetailModal'
import { FounderCta } from '@/components/profile/FounderCta'
import { LikedPlansSection } from '@/components/profile/LikedPlansSection'
import { OnboardingBanner } from '@/components/profile/OnboardingBanner'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileScreenHeader } from '@/components/profile/ProfileScreenHeader'
import { RecentPlansSection } from '@/components/profile/RecentPlansSection'
import { strings } from '@/constants/strings'
import { fetchChatList, getChatListCache, prefetchMessages } from '@/lib/chats/api'
import { FOUNDER_TYPEFORM_URL, VERIFICATION_ENABLED } from '@/lib/env_reader'
import {
  fetchProfile,
  fetchRecentJoinedPlans,
  type ProfileRecentPlan,
  type ProfileWithStats,
} from '@/lib/profiles/api'
import { fetchLikedPlans } from '@/lib/plans/api'
import { joinPlan, markPlanJoined } from '@/lib/plans/lifecycle'
import { subscribePlansChanged } from '@/lib/plans/plansEvents'
import { supabase } from '@/lib/supabase'
import type { Plan, Profile } from '@/types'
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
  const [likedPlans, setLikedPlans] = useState<Plan[]>([])
  const [detailPlan, setDetailPlan] = useState<Plan | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
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

      const [nextProfile, nextPlans, nextLikedPlans] = await Promise.all([
        fetchProfile(user.id),
        fetchRecentJoinedPlans(user.id),
        // Secondary section: a failure here must not block the profile.
        fetchLikedPlans().catch(() => null),
      ])

      setProfileData(nextProfile)
      setRecentPlans(nextPlans)
      if (nextLikedPlans) setLikedPlans(nextLikedPlans)
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

  function handleLikedPlanPress(plan: Plan) {
    setDetailPlan(plan)
    setDetailVisible(true)
  }

  async function handleJoinLikedPlan(planId: string) {
    const current = likedPlans.find(plan => plan.id === planId)
    if (!current) return
    if (current.user_joined) {
      handlePlanPress(planId)
      return
    }

    const joined = markPlanJoined(current)
    setLikedPlans(prev => prev.map(plan => (plan.id === planId ? joined : plan)))
    setDetailPlan(prev => (prev?.id === planId ? joined : prev))
    try {
      await joinPlan(planId)
      void fetchChatList().catch(() => {})
      handlePlanPress(planId)
    } catch (err) {
      console.error('[profile] join liked plan', err)
      setLikedPlans(prev => prev.map(plan => (plan.id === planId ? current : plan)))
      setDetailPlan(prev => (prev?.id === planId ? current : prev))
    }
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

        {VERIFICATION_ENABLED && !profile.onboarding_completed ? (
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

        <LikedPlansSection plans={likedPlans} onPlanPress={handleLikedPlanPress} />
      </ScrollView>

      {detailPlan ? (
        <PlanDetailModal
          visible={detailVisible}
          plan={detailPlan}
          onClose={() => setDetailVisible(false)}
          onJoin={id => void handleJoinLikedPlan(id)}
        />
      ) : null}
    </TabScreen>
  )
}
