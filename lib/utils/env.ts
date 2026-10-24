/**
 * Parsers for EXPO_PUBLIC_* values. Callers must pass `raw` as a static read
 * (`process.env.EXPO_PUBLIC_X`): Expo only inlines literal property access at bundle time,
 * so `process.env[name]` is undefined in release builds. `name` is only used in warnings.
 */

export function readEnvInt(name: string, raw: string | undefined, defaultValue: number): number {
  if (raw === undefined || raw === '') return defaultValue

  const trimmed = raw.trim()
  const n = Number.parseInt(trimmed, 10)

  if (!Number.isFinite(n) || String(n) !== trimmed) {
    console.warn(`[readEnvInt] ${name}="${raw}" is not a valid integer; using default ${defaultValue}`)
    return defaultValue
  }

  return n
}

export function readEnvBool(name: string, raw: string | undefined, defaultValue: boolean): boolean {
  if (raw === undefined || raw === '') return defaultValue

  const normalized = raw.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1') return true
  if (normalized === 'false' || normalized === '0') return false

  console.warn(`[readEnvBool] ${name}="${raw}" is not a valid boolean; using default ${defaultValue}`)
  return defaultValue
}

export function readEnvString(name: string, raw: string | undefined, defaultValue: string): string {
  if (raw === undefined || raw === '') {
    console.warn(`[readEnvString] ${name} is not set; using default "${defaultValue}"`)
    return defaultValue
  }
  return raw.trim()
}
