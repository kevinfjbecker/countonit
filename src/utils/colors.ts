import type { ColorBadge } from '@/types/domain'

export interface ColorBadgeConfig {
  badge: ColorBadge
  label: string
  bgClass: string
  ringClass: string
  iconBg: string
  pointBadge: string
  cardBorderHover?: string
  activeRing?: string
}

export const COLOR_CONFIGS: Record<ColorBadge, ColorBadgeConfig> = {
  emerald: {
    badge: 'emerald',
    label: 'Emerald',
    bgClass: 'bg-emerald-500',
    ringClass: 'ring-emerald-500',
    cardBorderHover: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400',
    pointBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50',
    activeRing: 'focus-visible:ring-emerald-500'
  },
  amber: {
    badge: 'amber',
    label: 'Amber',
    bgClass: 'bg-amber-500',
    ringClass: 'ring-amber-500',
    cardBorderHover: 'hover:border-amber-300 dark:hover:border-amber-700',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400',
    pointBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50',
    activeRing: 'focus-visible:ring-amber-500'
  },
  sky: {
    badge: 'sky',
    label: 'Sky',
    bgClass: 'bg-sky-500',
    ringClass: 'ring-sky-500',
    cardBorderHover: 'hover:border-sky-300 dark:hover:border-sky-700',
    iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400',
    pointBadge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/50',
    activeRing: 'focus-visible:ring-sky-500'
  },
  rose: {
    badge: 'rose',
    label: 'Rose',
    bgClass: 'bg-rose-500',
    ringClass: 'ring-rose-500',
    cardBorderHover: 'hover:border-rose-300 dark:hover:border-rose-700',
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400',
    pointBadge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/50',
    activeRing: 'focus-visible:ring-rose-500'
  },
  violet: {
    badge: 'violet',
    label: 'Violet',
    bgClass: 'bg-violet-500',
    ringClass: 'ring-violet-500',
    cardBorderHover: 'hover:border-violet-300 dark:hover:border-violet-700',
    iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-950/70 dark:text-violet-400',
    pointBadge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/50',
    activeRing: 'focus-visible:ring-violet-500'
  },
  indigo: {
    badge: 'indigo',
    label: 'Indigo',
    bgClass: 'bg-indigo-500',
    ringClass: 'ring-indigo-500',
    cardBorderHover: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400',
    pointBadge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/50',
    activeRing: 'focus-visible:ring-indigo-500'
  },
  slate: {
    badge: 'slate',
    label: 'Slate',
    bgClass: 'bg-slate-500',
    ringClass: 'ring-slate-500',
    cardBorderHover: 'hover:border-slate-300 dark:hover:border-slate-600',
    iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    pointBadge: 'bg-slate-50 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    activeRing: 'focus-visible:ring-slate-500'
  }
}

export function getColorConfig(badge?: ColorBadge | null): ColorBadgeConfig {
  return (badge && COLOR_CONFIGS[badge]) || COLOR_CONFIGS.slate
}
