/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2563eb';
const tintColorDark = '#3b82f6';

export const Colors = {
  light: {
    bg: '#f4f7fb',
    bgSoft: '#eef4ff',
    surface: 'rgba(255, 255, 255, 0.9)',
    surfaceStrong: '#ffffff',
    surfaceMuted: '#edf3fb',
    text: '#0f172a',
    textMuted: '#5b6b84',
    border: 'rgba(148, 163, 184, 0.24)',
    borderStrong: 'rgba(148, 163, 184, 0.4)',
    primary: '#2563eb',
    primaryStrong: '#1d4ed8',
    primarySoft: 'rgba(37, 99, 235, 0.12)',
    success: '#059669',
    danger: '#dc2626',
    tint: tintColorLight,
    icon: '#5b6b84',
    tabIconDefault: '#5b6b84',
    tabIconSelected: tintColorLight,
    shadowLg: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.12,
      shadowRadius: 70,
      elevation: 16,
    },
    shadowMd: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.08,
      shadowRadius: 40,
      elevation: 8,
    },
    heroGradient: ['#f7fbff', '#f4f7fb', '#edf3fb'] as [string, string, string],
  },
  dark: {
    bg: '#0f172a',
    bgSoft: '#1e293b',
    surface: 'rgba(30, 41, 59, 0.9)',
    surfaceStrong: '#1e293b',
    surfaceMuted: '#334155',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.12)',
    borderStrong: 'rgba(148, 163, 184, 0.24)',
    primary: '#3b82f6',
    primaryStrong: '#2563eb',
    primarySoft: 'rgba(59, 130, 246, 0.15)',
    success: '#10b981',
    danger: '#ef4444',
    tint: tintColorDark,
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorDark,
    shadowLg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 24 },
      shadowOpacity: 0.3,
      shadowRadius: 70,
      elevation: 16,
    },
    shadowMd: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 40,
      elevation: 8,
    },
    heroGradient: ['#0f172a', '#1e293b', '#0f172a'] as [string, string, string],
  },
};

