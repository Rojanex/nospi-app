import { CURRENT_TERMS_VERSION } from '@/constants/legal'
import { supabase } from '@/lib/supabase'

export type ProfileAccess = {
  needsName: boolean   /** No display_name yet: start full onboarding. */
  needsTerms: boolean /** terms_version is missing or older than CURRENT_TERMS_VERSION (NOS-18 legal pages). */
}

export async function fetchProfileAccess(userId: string): Promise<ProfileAccess> {
  const { data } = await supabase
    .from('profiles')
    .select('display_name, terms_version')
    .eq('id', userId)
    .maybeSingle()

  return {
    needsName: !data?.display_name?.trim(),
    needsTerms: data?.terms_version !== CURRENT_TERMS_VERSION,
  }
}

export async function acceptCurrentTerms(userId: string): Promise<{ error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ terms_version: CURRENT_TERMS_VERSION })
    .eq('id', userId)
    .select('id')

  if (error) return { error }
  if (!data?.length) return { error: new Error('Profile not updated') }
  return { error: null }
}

// Consent ticked on the phone screen, before an account exists. The root layout saves
// it right after OTP sign-in; if that fails, the accept-terms screen asks again.
let pendingTermsAcceptance = false

export function markTermsAcceptedPending() {
  pendingTermsAcceptance = true
}

export function consumePendingTermsAcceptance(): boolean {
  const pending = pendingTermsAcceptance
  pendingTermsAcceptance = false
  return pending
}

type UnlockListener = () => void
const unlockListeners = new Set<UnlockListener>()

/** Call after display_name is saved so tabs/chats become reachable (skip, later steps). */
export function unlockAppAfterDisplayName() {
  unlockListeners.forEach(listener => listener())
}

export function subscribeAppUnlocked(listener: UnlockListener) {
  unlockListeners.add(listener)
  return () => {
    unlockListeners.delete(listener)
  }
}

const termsListeners = new Set<UnlockListener>()

export function notifyTermsAccepted() {
  termsListeners.forEach(listener => listener())
}

export function subscribeTermsAccepted(listener: UnlockListener) {
  termsListeners.add(listener)
  return () => {
    termsListeners.delete(listener)
  }
}
