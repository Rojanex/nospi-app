import { TabScreen } from '@/components/layout/TabScreen'
import { SettingsHeader } from '@/components/settings/SettingsHeader'
import { SettingsRow } from '@/components/settings/SettingsRow'
import { SettingsSection } from '@/components/settings/SettingsSection'
import { strings } from '@/constants/strings'
import { PRIVACY_URL, TERMS_URL } from '@/lib/env_reader'
import { appVersion } from '@/lib/settings/support'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { ScrollView } from 'react-native'

function openLegalPage(url: string) {
  void WebBrowser.openBrowserAsync(url).catch(err => {
    console.error('[about] open legal page', err)
  })
}

export default function AboutScreen() {
  const version = appVersion()

  return (
    <TabScreen>
      <SettingsHeader title={strings.settings.about} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-2 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection first>
          <SettingsRow
            icon="document-text-outline"
            label={strings.settings.terms}
            trailing="external"
            onPress={() => openLegalPage(TERMS_URL)}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label={strings.settings.privacy}
            trailing="external"
            onPress={() => openLegalPage(PRIVACY_URL)}
          />
          {version ? (
            <SettingsRow
              icon="phone-portrait-outline"
              label={strings.settings.appVersion}
              value={version}
              trailing="none"
            />
          ) : null}
        </SettingsSection>
      </ScrollView>
    </TabScreen>
  )
}
