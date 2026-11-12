// NOS-13 · delete-account Edge Function
//
// 1. Identifies the caller from their JWT. The user id NEVER comes from the request body.
// 2. Deletes their folder in the `avatars` bucket: avatars/{user_id}/... (NOS-31).
// 3. Deletes the auth user. The foreign keys do the rest (checked 2026-11-10):
//      auth.users -> profiles                         cascade
//      profiles   -> plans (created_by)               cascade   (their hosted plans go)
//      profiles   -> plan_members, plan_likes, blocks cascade
//      profiles   -> messages (user_id)               set null  (shown as "Usuario eliminado")
//      profiles   -> reports (reporter_id)            set null  (report kept)
//
// Every step can be repeated safely, so if one fails the app can just call again.
// Push tokens: when that table exists, give user_id an FK to profiles with
// ON DELETE CASCADE and it will be cleaned up here with no code change.

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
// Injected by Supabase into every Edge Function. Never logged, never returned.
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Must match AVATARS_BUCKET in lib/env_reader.ts and Nospi/sql/NOS-31_avatars_bucket.sql.
const AVATARS_BUCKET = 'avatars'

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

Deno.serve(async req => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return json(401, { error: 'unauthorized' })

  // Bypasses RLS. Every call below is scoped to userId, which comes from the token.
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // ── 1. Who is calling ────────────────────────────────────────
  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) return json(401, { error: 'unauthorized' })
  const userId = userData.user.id

  try {
    // ── 2. Avatar folder (Storage files have no FK, so nothing cascades) ──
    const { data: files, error: listError } = await admin.storage
      .from(AVATARS_BUCKET)
      .list(userId, { limit: 1000 })
    if (listError) throw listError

    if (files && files.length > 0) {
      const paths = files.map((f: { name: string }) => `${userId}/${f.name}`)
      const { error: removeError } = await admin.storage.from(AVATARS_BUCKET).remove(paths)
      if (removeError) throw removeError
    }

    // ── 3. Auth user (last: after this the JWT is useless). The FKs do the rest ──
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    return json(200, { ok: true })
  } catch (err) {
    console.error('[delete-account]', userId, err)
    return json(500, { error: 'delete_failed' })
  }
})
