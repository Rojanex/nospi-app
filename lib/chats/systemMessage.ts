import { strings } from '@/constants/strings'
import { SystemPayload } from '@/types'

export function systemPayloadFromName(name?: string | null): SystemPayload | undefined {
  const trimmed = name?.trim()
  if (!trimmed) return undefined
  return { name: trimmed }
}

export function resolveSystemContent(raw: string, payload?: SystemPayload): string {
  const key = raw.trim()
  const entry = (strings.systemMessages as Record<string, unknown>)[key]
  if (typeof entry === 'string') return entry
  if (typeof entry === 'function') {
    return (entry as (payload: SystemPayload) => string)(payload ?? {})
  }
  return raw
}
