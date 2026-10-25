// Single source of truth for every color in the app.
// Also read by tailwind.config.js, so keep this file free of imports and `@/` aliases.

/** Generic UI hues for icons, badges and states (not tied to an activity). */
const tone = {
  orange: '#E8642A',
  orangeDark: '#D4650E',
  green: '#2D8B5A',
  blue: '#185FA5',
  amber: '#BA7517',
}

/**
 * Per-activity palette, used by constants/activityMeta.ts.
 * accent: text, icons, borders · surface: card / chip background · surfaceStrong: icon circle on top of surface
 */
const activity = {
  social:     { accent: '#0F6E56',   surface: '#E1F5EE', surfaceStrong: '#CADFDA' },
  playa:      { accent: tone.orange, surface: '#FFF0E8', surfaceStrong: '#FADDD0' },
  rumba:      { accent: '#993556',   surface: '#FBEAF0', surfaceStrong: '#E9D3DA' },
  deporte:    { accent: tone.blue,   surface: '#E6F1FB', surfaceStrong: '#CCDCEB' },
  comida:     { accent: tone.amber,  surface: '#FAEEDA', surfaceStrong: '#F0E1CC' },
  cultura:    { accent: '#534AB7',   surface: '#EEEDFE', surfaceStrong: '#D9D7EF' },
  naturaleza: { accent: '#3B6D11',   surface: '#EAF3DE', surfaceStrong: '#D4DFCB' },
  chill:      { accent: '#8E44AD',   surface: '#F5ECF9', surfaceStrong: '#E4D4EC' },
  otro:       { accent: '#5F5E5A',   surface: '#F1EFE8', surfaceStrong: '#DCDCDB' },
}

export const Colors = {
  primary: {
    100: '#F2AD78', // TODO- check if this color works...
    200: '#F6EEEC',
    300: '#FBF7F6',
  },
  accent: {
    100: '#FBFBFD',
  },
  black: {
    DEFAULT: '#000000',
    100: '#373026',
    200: '#666876',
    300: '#8C8E98',
    400: '#888780',
    500: '#5F5E5A',
  },
  ink: {
    DEFAULT: '#1C1B19',
    25: '#1C1B1940',
    40: '#1C1B1966',
    50: '#1C1B1980',
    60: '#1C1B1999',
  },
  white: '#FFFFFF',
  neutral: {
    hint: '#B4B2A9',
    gray: '#EDEBE5',
    label: '#A09890',
    body: '#6B6560',
    divider: '#F0EBE5',
    border: '#E6E0D8',
    tinted: '#E0DDD7',
    softTint: '#F7F5F1',
  },
  surface: {
    sheet: '#F2EDE8',
    orangeLight: '#FEF3EA',
    greenLight: '#E8F4EE',
    blueLight: activity.deporte.surface,
  },
  overlay: {
    /** Modal / sheet backdrop: ink at 45% */
    backdrop: '#1C1B1973',
    /** White text glow, e.g. welcome title */
    glowStrong: '#FFFFFFE6',
    glowSoft: '#FFFFFF99',
  },
  tone,
  activity,
  form: {
    error: '#D94F4F',
  },
  danger: '#F75555',
  buttons: {
    orange: '#ED862F',
    brown: '#373026',
  },
};
