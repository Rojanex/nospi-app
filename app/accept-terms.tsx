import { Colors } from '@/assets/constants/Colors'
import { ConsentCheckbox } from '@/components/ui/ConsentCheckbox'
import { strings } from '@/constants/strings'
import { acceptCurrentTerms, notifyTermsAccepted } from '@/lib/profiles/onboarding'
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

/**
 * One-time accept screen for users without the current terms version (existing accounts,
 * or after CURRENT_TERMS_VERSION is bumped). The root layout keeps the app blocked until
 * this succeeds. Legal pages: NOS-18.
 */
export default function AcceptTerms() {
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async () => {
    if (!checked || loading) return
    setLoading(true)
    setError(null)

    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      setError(strings.onboarding.acceptTermsError)
      setLoading(false)
      return
    }

    const { error: acceptError } = await acceptCurrentTerms(data.user.id)
    if (acceptError) {
      console.error('[AcceptTerms] accept', acceptError)
      setError(strings.onboarding.acceptTermsError)
      setLoading(false)
      return
    }

    notifyTermsAccepted()
  }

  const handleLogout = () => {
    void supabase.auth.signOut()
  }

  const isDisabled = !checked || loading

  return (
    <View className="screen-root">
      <SafeAreaView className="screen-safe">
        <View className="flex-1 justify-between px-7 pb-12" style={{ paddingTop: 48 }}>
          <View className="gap-4">
            <View
              className="h-16 w-16 items-center justify-center rounded-[20px]"
              style={{ backgroundColor: Colors.surface.orangeLight }}
            >
              <Ionicons name="shield-checkmark-outline" size={32} color={Colors.tone.orange} />
            </View>
            <Text className="auth-title">{strings.onboarding.acceptTermsTitle}</Text>
            <Text className="text-lead leading-[24px]" style={{ color: Colors.neutral.body }}>
              {strings.onboarding.acceptTermsSubtitle}
            </Text>
          </View>

          <View className="gap-4">
            <View className="rounded-[20px] bg-white p-[18px]">
              <ConsentCheckbox checked={checked} onChange={setChecked} />
            </View>

            {error ? <Text className="form-error-text">{error}</Text> : null}

            {/* TouchableOpacity animates its own opacity and misses className changes, so the
                disabled style lags one render (shown inverted). Remount on toggle, as sign-in does. */}
            <TouchableOpacity
              key={isDisabled ? 'disabled' : 'enabled'}
              className={`btn-primary ${isDisabled ? 'btn-primary--disabled' : ''}`}
              onPress={handleAccept}
              disabled={isDisabled}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text className="btn-primary-text">{strings.onboarding.acceptTermsButton}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="h-11 items-center justify-center"
              onPress={handleLogout}
              disabled={loading}
            >
              <Text className="text-body font-semibold" style={{ color: Colors.neutral.body }}>
                {strings.onboarding.acceptTermsLogout}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}
