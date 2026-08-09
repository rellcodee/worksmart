import { Platform } from 'react-native';

export const theme = {
  colors: {
    // Premium dark palette
    background: '#09090B',       // Zinc-950 (deep charcoal black)
    surface: '#18181B',          // Zinc-900 (cards, headers)
    surfaceLight: '#27272A',     // Zinc-800 (modal inputs, hover states)
    border: '#27272A',           // Zinc-800 (subtle dividers)
    borderFocus: '#3F3F46',      // Zinc-700
    putihDekil: '#d8d6d6ff',

    // Typography colors
    text: '#F4F4F5',             // Zinc-100 (high contrast text)
    textMuted: '#A1A1AA',        // Zinc-400 (secondary details)
    textDark: '#71717A',         // Zinc-500 (placeholder text)

    // Accents
    primary: '#d46617',          // Claude orange (Focus areas, brand color)
    primaryGlow: 'rgba(212, 102, 23, 0.15)',
    claude: '#d46617ff',
    accent: '#F97316',           // Orange-500 (Alerts, highlights, custom tags)
    accentGlow: 'rgba(249, 115, 22, 0.15)',

    // Statuses
    success: '#10B981',          // Emerald-500 (Completed)
    warning: '#F59E0B',          // Amber-500 (Short break / warnings)
    danger: '#EF4444',           // Red-500 (Long break / delete/ errors)
    info: '#06B6D4',             // Cyan-500 (Information widgets)
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  fonts: Platform.select({
    ios: {
      sans: 'System',
      mono: 'Courier',
    },
    default: {
      sans: 'normal',
      mono: 'monospace',
    },
    web: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
  }),
};

export default theme;
