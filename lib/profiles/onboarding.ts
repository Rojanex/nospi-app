import { supabase } from '@/lib/supabase'

/** True when the profile has no display_name yet (start full onboarding). */
export async function profileNeedsOnboarding(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle()

  return !data?.display_name?.trim()
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
