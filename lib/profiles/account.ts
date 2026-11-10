import { supabase } from '@/lib/supabase'

/** The root layout reacts to SIGNED_OUT: clears caches and shows the auth screens. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('[signOut]', error)
    throw error
  }
}

/**
 * TODO(NOS-13): call the `delete-account` Edge Function, then signOut().
 * Until then the confirmation UI is complete but always shows the error.
 */
export async function deleteAccount(): Promise<void> {
  throw new Error('delete-account Edge Function not implemented yet (NOS-13)')
}
