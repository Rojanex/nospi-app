/**
 * Version of the Términos y Condiciones + Política de Privacidad the user accepts.
 * Stored in profiles.terms_version; profiles.terms_accepted_at is stamped by a DB trigger.
 * Bump it (a date works) whenever the legal text changes: every user sees the
 * accept-terms screen again on their next app open. Pages: NOS-18.
 */
export const CURRENT_TERMS_VERSION = '2026-10-25'
