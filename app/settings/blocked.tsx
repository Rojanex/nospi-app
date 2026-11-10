import { Colors } from '@/assets/constants/Colors'
import { TabScreen } from '@/components/layout/TabScreen'
import { BlockSheet, type BlockSheetTarget } from '@/components/moderation/BlockSheet'
import { SettingsHeader } from '@/components/settings/SettingsHeader'
import { SettingsSection } from '@/components/settings/SettingsSection'
import { strings } from '@/constants/strings'
import { fetchBlockedUsers, type BlockedUser } from '@/lib/moderation/api'
import { Image } from 'expo-image'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'

export default function BlockedUsersScreen() {
  const [users, setUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheetTarget, setSheetTarget] = useState<BlockSheetTarget | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setUsers(await fetchBlockedUsers())
    } catch {
      setError(strings.settings.blockedLoadError)
    }
  }, [])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [load])

  function retry() {
    setLoading(true)
    load().finally(() => setLoading(false))
  }

  // BlockSheet runs unblockUser(), which also refreshes plans and chat caches.
  function handleDone(userId: string, blocked: boolean) {
    if (!blocked) setUsers(current => current.filter(user => user.id !== userId))
  }

  let body: React.ReactNode
  if (loading) {
    body = (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.buttons.orange} />
      </View>
    )
  } else if (error) {
    body = (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-4 text-center text-body text-ink-50">{error}</Text>
        <TouchableOpacity onPress={retry} hitSlop={8}>
          <Text className="text-body font-semibold text-buttons-orange">
            {strings.settings.retry}
          </Text>
        </TouchableOpacity>
      </View>
    )
  } else if (users.length === 0) {
    body = (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-body text-ink-40">{strings.settings.blockedEmpty}</Text>
      </View>
    )
  } else {
    body = (
      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-2 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection first>
          {users.map(user => (
            <View key={user.id} className="flex-row items-center gap-3 px-5 py-3">
              {user.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  className="h-10 w-10 rounded-full"
                  cachePolicy="memory-disk"
                  contentFit="cover"
                />
              ) : (
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: user.avatarBg }}
                >
                  <Text className="text-caption font-bold" style={{ color: user.avatarText }}>
                    {user.initials}
                  </Text>
                </View>
              )}
              <Text className="flex-1 text-body font-medium text-ink" numberOfLines={1}>
                {user.name}
              </Text>
              <Pressable
                onPress={() => setSheetTarget({ userId: user.id, name: user.name, block: false })}
                accessibilityRole="button"
                className="rounded-full border border-neutral-border px-4 py-2 active:bg-neutral-softTint"
              >
                <Text className="text-caption font-semibold text-ink">
                  {strings.moderation.unblock}
                </Text>
              </Pressable>
            </View>
          ))}
        </SettingsSection>
      </ScrollView>
    )
  }

  return (
    <TabScreen>
      <SettingsHeader title={strings.settings.blockedUsers} />
      {body}
      <BlockSheet target={sheetTarget} onClose={() => setSheetTarget(null)} onDone={handleDone} />
    </TabScreen>
  )
}
