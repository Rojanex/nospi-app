/**
 * Supabase Auth stores phones as digits without "+" (e.g. "573001234567").
 * Colombian mobiles render as "+57 300 123 4567"; anything else as "+<digits>".
 */
export function formatPhone(phone: string | null | undefined): string {
  const digits = (phone ?? '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('57') && digits.length === 12) {
    return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }
  return `+${digits}`
}
