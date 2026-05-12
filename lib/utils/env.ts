export function readEnvInt(name: string, defaultValue: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return defaultValue

  const trimmed = raw.trim()
  const n = Number.parseInt(trimmed, 10)

  if (!Number.isFinite(n) || String(n) !== trimmed) {
    console.warn(`[readEnvInt] ${name}="${raw}" is not a valid integer; using default ${defaultValue}`)
    return defaultValue
  }

  return n
}

export function readEnvString(name: string, defaultValue: string): string {
  const raw = process.env[name]
  if (raw === undefined || raw === '') {
    console.warn(`[readEnvString] ${name} is not set; using default "${defaultValue}"`)
    return defaultValue
  }
  return raw.trim()
}
