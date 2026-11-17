import { INSTAGRAM_HANDLE_MAX, INSTAGRAM_PROFILE_BASE_URL } from '@/lib/env_reader'
import { supabase } from '@/lib/supabase'

/** Same rule as the profiles_instagram_handle_check constraint (length is checked separately). */
const HANDLE_PATTERN = /^[a-z0-9._]+$/

/**
 * Turns whatever the user typed or pasted into a bare, lowercase handle.
 * "@Luisa.R", "instagram.com/luisa.r/" and "https://www.instagram.com/luisa.r?igsh=abc"
 * all become "luisa.r". Returns '' for empty input.
 */
export function normalizeInstagramHandle(input: string): string {
  let value = input.trim().toLowerCase()
  value = value.replace(/^(https?:\/\/)?(www\.|m\.)?(instagram\.com|instagr\.am)\//, '')
  value = value.split(/[/?#\s]/)[0] ?? ''
  return value.replace(/^@+/, '')
}

export function isValidInstagramHandle(handle: string): boolean {
  return (
    handle.length >= 1 && handle.length <= INSTAGRAM_HANDLE_MAX && HANDLE_PATTERN.test(handle)
  )
}

/** Opens the Instagram app when installed (universal link), the website otherwise. */
export function instagramProfileUrl(handle: string): string {
  return `${INSTAGRAM_PROFILE_BASE_URL}${handle}`
}

/** Saves the current user's handle, or removes it with `null`. RLS limits this to their own row. */
export async function updateInstagramHandle(userId: string, handle: string | null): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ instagram_handle: handle })
    .eq('id', userId)

  if (error) {
    console.error('[updateInstagramHandle]', error)
    throw error
  }
}
