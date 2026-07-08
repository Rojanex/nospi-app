export function formatSheetDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatSheetTime(time: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(time)
}
