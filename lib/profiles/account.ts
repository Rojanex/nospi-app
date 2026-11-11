import { supabase } from '@/lib/supabase'

/** The root layout reacts to SIGNED_OUT: clears caches and shows the auth screens. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('[signOut]', error)
    throw error
  }
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' })
  if (error) {
    console.error('[deleteAccount]', error)
    throw error
  }
  await supabase.auth.signOut({ scope: 'local' })
}
