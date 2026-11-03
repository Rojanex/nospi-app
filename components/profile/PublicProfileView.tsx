import { Colors } from '@/assets/constants/Colors'
import { BlockSheet, type BlockSheetTarget } from '@/components/moderation/BlockSheet'
import { ReportSheet } from '@/components/moderation/ReportSheet'
import { ActivityFingerprint } from '@/components/profile/ActivityFingerprint'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { strings } from '@/constants/strings'
import { isUserBlocked, type ReportTarget } from '@/lib/moderation/api'
import { fetchPublicProfile, type PublicProfile } from '@/lib/profiles/api'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'

type PublicProfileViewProps = {
  userId: string
  showModerationActions: boolean
  onBlockChange?: (userId: string, blocked: boolean) => void
  deferRefresh?: boolean
  headerLeft?: React.ReactNode
  headerRight?: React.ReactNode
}

/**
 * Someone else's profile for sheets: a fixed top bar (headerLeft · … · headerRight)
 * and a scrolling body with the header, activity and the blocked notice.
 */
export function PublicProfileView({
  userId,
  showModerationActions,
  onBlockChange,
  headerLeft,
  headerRight,
  deferRefresh = false,
}: PublicProfileViewProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  /** null = still loading (or failed) */
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null)
  const [blockTarget, setBlockTarget] = useState<BlockSheetTarget | null>(null)
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPublicProfile(userId)
      .then(data => {
        if (!cancelled) setProfile(data)
      })
      .catch(err => {
        console.error('[public-profile] profile', err)
        if (!cancelled) setError(strings.profile.publicLoadError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!showModerationActions) return

    let cancelled = false
    setIsBlocked(null)
    isUserBlocked(userId)
      .then(blocked => {
        if (!cancelled) setIsBlocked(blocked)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [userId, showModerationActions])

  function openBlockSheet() {
    if (isBlocked === null) return
    setBlockTarget({
      userId,
      name: profile?.display_name?.trim() || strings.common.userFallback,
      block: !isBlocked,
    })
  }

  function handleBlockDone(id: string, blocked: boolean) {
    setIsBlocked(blocked)
    onBlockChange?.(id, blocked)
  }

  const menuReady = showModerationActions && isBlocked !== null

  let body: React.ReactNode
  if (loading) {
    body = (
      <View className="items-center py-10">
        <ActivityIndicator size="large" color={Colors.buttons.orange} />
      </View>
    )
  } else if (error || !profile) {
    body = (
      <View className="items-center py-10">
        <Text className="text-center text-body text-ink-50">{error}</Text>
      </View>
    )
  } else {
    body = (
      <>
        <ProfileHeader
          profile={profile}
          plansCreated={profile.plansCreated}
          plansJoined={profile.plansJoined}
        />
        <ActivityFingerprint fingerprint={profile.fingerprint} />

        {showModerationActions && isBlocked ? (
          <Text className="mt-4 text-center text-body text-ink-50">
            {strings.moderation.blockedLabel}
          </Text>
        ) : null}
      </>
    )
  }

  return (
    <View className="relative shrink">
      <View className="mb-2 h-8 flex-row items-center justify-between px-5">
        <View>{headerLeft}</View>
        <View className="flex-row items-center gap-2">
          {showModerationActions ? (
            <Pressable
              onPress={() => setMenuOpen(open => !open)}
              disabled={!menuReady}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={strings.moderation.moreActions}
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ opacity: menuReady ? 1 : 0.4 }}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={Colors.black[400]} />
            </Pressable>
          ) : null}
          {headerRight}
        </View>
      </View>

      <ScrollView
        className="shrink flex-grow-0"
        contentContainerClassName="px-5 pb-8"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {body}
      </ScrollView>

      {profile ? (
        <DropdownMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          positionClassName="right-5 top-10"
          items={[
            {
              key: 'report',
              label: strings.moderation.reportUser,
              icon: 'flag-outline',
              destructive: true,
              onPress: () => setReportTarget({ type: 'user', id: profile.id }),
            },
            {
              key: 'block',
              label: isBlocked ? strings.moderation.unblock : strings.moderation.block,
              icon: isBlocked ? 'lock-open-outline' : 'ban-outline',
              destructive: !isBlocked,
              onPress: openBlockSheet,
            },
          ]}
        />
      ) : null}

      <ReportSheet target={reportTarget} onClose={() => setReportTarget(null)} />
      <BlockSheet
        target={blockTarget}
        onClose={() => setBlockTarget(null)}
        onDone={handleBlockDone}
        deferRefresh={deferRefresh}
      />
    </View>
  )
}
