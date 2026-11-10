import { Colors } from '@/assets/constants/Colors'
import { TabScreen } from '@/components/layout/TabScreen'
import { LogoutSheet } from '@/components/settings/LogoutSheet'
import { MailErrorBubble } from '@/components/settings/MailErrorBubble'
import { SettingsHeader } from '@/components/settings/SettingsHeader'
import { SettingsRow } from '@/components/settings/SettingsRow'
import { SettingsSection } from '@/components/settings/SettingsSection'
import { strings } from '@/constants/strings'
import { fetchOwnBasics, type OwnBasics } from '@/lib/profiles/api'
import { useSupportMail } from '@/lib/settings/support'
import { supabase } from '@/lib/supabase'
import { avatarColorsForId, initialsFromName } from '@/lib/utils/avatar'
import { formatPhone } from '@/lib/utils/phone'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

type SettingsData = OwnBasics & {
  id: string
  phone: string
}

export default function SettingsScreen() {
  const router = useRouter()
  const [data, setData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoutVisible, setLogoutVisible] = useState(false)
  const { openSupportMail, mailError } = useSupportMail()

  const load = useCallback(async () => {
    setError(null)
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) throw authError ?? new Error('Not authenticated')

      const basics = await fetchOwnBasics(user.id)
      setData({ ...basics, id: user.id, phone: formatPhone(user.phone) })
    } catch (err) {
      console.error('[settings] load', err)
      setError(strings.settings.loadError)
    }
  }, [])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [load])

  function retry() {
    setLoading(true)
    load().finally(() => setLoading(false))
  }

  let body: React.ReactNode
  if (loading) {
    body = (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.buttons.orange} />
      </View>
    )
  } else if (error || !data) {
    body = (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-4 text-center text-body text-ink-50">
          {error ?? strings.settings.loadError}
        </Text>
        <TouchableOpacity onPress={retry} hitSlop={8}>
          <Text className="text-body font-semibold text-buttons-orange">
            {strings.settings.retry}
          </Text>
        </TouchableOpacity>
      </View>
    )
  } else {
    const name = data.display_name?.trim() || strings.common.userFallback
    const colors = avatarColorsForId(data.id)

    body = (
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center pb-4 pt-2">
          {data.avatar_url ? (
            <Image
              source={{ uri: data.avatar_url }}
              className="h-24 w-24 rounded-full"
              cachePolicy="memory-disk"
              contentFit="cover"
            />
          ) : (
            <View
              className="h-24 w-24 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.bg }}
            >
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                {initialsFromName(name)}
              </Text>
            </View>
          )}
          {/* TODO(NOS-31): open the image picker and upload. */}
          <Text className="mt-3 text-body font-semibold text-buttons-orange">
            {strings.settings.changePhoto}
          </Text>
        </View>

        <SettingsSection
          first
          title={strings.settings.sectionAccount}
          footer={
            <Text className="text-caption text-black-300">
              {strings.settings.phoneLinked} {strings.settings.changeSomething}{' '}
              <Text
                className="font-semibold text-buttons-orange"
                onPress={() => openSupportMail(strings.settings.changeDataSubject)}
                accessibilityRole="link"
              >
                {strings.settings.writeUs}
              </Text>
            </Text>
          }
        >
          <SettingsRow
            icon="person-outline"
            label={strings.settings.nameLabel}
            value={name}
            trailing="lock"
          />
          <SettingsRow
            icon="call-outline"
            label={strings.settings.phoneLabel}
            value={data.phone}
            trailing="lock"
          />
        </SettingsSection>

        <SettingsSection title={strings.settings.sectionPrivacy}>
          <SettingsRow
            icon="ban-outline"
            label={strings.settings.blockedUsers}
            onPress={() => router.push('/settings/blocked' as never)}
          />
        </SettingsSection>

        <SettingsSection title={strings.settings.sectionHelp}>
          <SettingsRow
            icon="mail-outline"
            label={strings.settings.contactSupport}
            trailing="external"
            onPress={() => openSupportMail(strings.settings.supportSubject)}
          />
          <SettingsRow
            icon="information-circle-outline"
            label={strings.settings.about}
            onPress={() => router.push('/settings/about' as never)}
          />
        </SettingsSection>

        <View className="px-5">
          <MailErrorBubble message={mailError} />
        </View>
        <SettingsRow
            icon="trash-outline"
            label={strings.settings.deleteAccount}
            tone="danger"
            trailing="none"
            onPress={() => router.push('/settings/delete-account' as never)}
          />

        <SettingsSection>
          <SettingsRow
            icon="log-out-outline"
            label={strings.settings.logout}
            trailing="none"
            onPress={() => setLogoutVisible(true)}
          />
          
        </SettingsSection>
      </ScrollView>
    )
  }

  return (
    <TabScreen>
      <SettingsHeader title={strings.settings.title} />
      {body}
      <LogoutSheet visible={logoutVisible} onClose={() => setLogoutVisible(false)} />
    </TabScreen>
  )
}
