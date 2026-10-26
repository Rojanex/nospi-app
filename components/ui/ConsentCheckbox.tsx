import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import { PRIVACY_URL, TERMS_URL } from '@/lib/env_reader'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import { Pressable, Text, View } from 'react-native'

type ConsentCheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
}

function openLegalPage(url: string) {
  // In-app sheet: the user comes back to the same screen with the checkbox state intact.
  void WebBrowser.openBrowserAsync(url).catch(err => {
    console.warn('[ConsentCheckbox] open legal page', err)
  })
}

/** Terms + privacy consent (NOS-18 pages). Tapping the box or the text toggles; links open the page. */
export function ConsentCheckbox({ checked, onChange }: ConsentCheckboxProps) {
  const toggle = () => onChange(!checked)
  const label =
    strings.onboarding.consentPrefix +
    strings.onboarding.consentTermsLink +
    strings.onboarding.consentMiddle +
    strings.onboarding.consentPrivacyLink +
    strings.onboarding.consentSuffix

  return (
    <View className="flex-row items-start gap-3">
      <Pressable
        onPress={toggle}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: checked ? Colors.buttons.orange : Colors.white,
          borderWidth: checked ? 0 : 2,
          borderColor: Colors.neutral.hint,
        }}
      >
        {checked ? <Ionicons name="checkmark" size={16} color={Colors.white} /> : null}
      </Pressable>

      <Text
        onPress={toggle}
        className="flex-1 text-black-100"
        style={{ fontSize: 14, lineHeight: 20 }}
      >
        {strings.onboarding.consentPrefix}
        <Text
          accessibilityRole="link"
          className="font-bold underline"
          onPress={() => openLegalPage(TERMS_URL)}
        >
          {strings.onboarding.consentTermsLink}
        </Text>
        {strings.onboarding.consentMiddle}
        <Text
          accessibilityRole="link"
          className="font-bold underline"
          onPress={() => openLegalPage(PRIVACY_URL)}
        >
          {strings.onboarding.consentPrivacyLink}
        </Text>
        {strings.onboarding.consentSuffix}
      </Text>
    </View>
  )
}
