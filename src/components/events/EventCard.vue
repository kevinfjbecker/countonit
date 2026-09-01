<script setup lang="ts">
import { computed } from 'vue'
import * as icons from 'lucide-vue-next'
import { Activity } from 'lucide-vue-next'
import type { EventType, ColorBadge } from '@/types/domain'

interface Props {
  eventType: EventType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'tap', eventType: EventType): void
}>()

const COLOR_CONFIGS: Record<
  ColorBadge,
  {
    cardBorderHover: string
    iconBg: string
    pointBadge: string
    activeRing: string
  }
> = {
  emerald: {
    cardBorderHover: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400',
    pointBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50',
    activeRing: 'focus-visible:ring-emerald-500'
  },
  amber: {
    cardBorderHover: 'hover:border-amber-300 dark:hover:border-amber-700',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400',
    pointBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50',
    activeRing: 'focus-visible:ring-amber-500'
  },
  sky: {
    cardBorderHover: 'hover:border-sky-300 dark:hover:border-sky-700',
    iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400',
    pointBadge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/50',
    activeRing: 'focus-visible:ring-sky-500'
  },
  rose: {
    cardBorderHover: 'hover:border-rose-300 dark:hover:border-rose-700',
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400',
    pointBadge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/50',
    activeRing: 'focus-visible:ring-rose-500'
  },
  violet: {
    cardBorderHover: 'hover:border-violet-300 dark:hover:border-violet-700',
    iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-950/70 dark:text-violet-400',
    pointBadge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/50',
    activeRing: 'focus-visible:ring-violet-500'
  },
  indigo: {
    cardBorderHover: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400',
    pointBadge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/50',
    activeRing: 'focus-visible:ring-indigo-500'
  },
  slate: {
    cardBorderHover: 'hover:border-slate-300 dark:hover:border-slate-600',
    iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    pointBadge: 'bg-slate-50 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    activeRing: 'focus-visible:ring-slate-500'
  }
}

const iconComponent = computed(() => {
  const iconName = props.eventType.icon
  if (iconName && iconName in icons) {
    return (icons as Record<string, any>)[iconName]
  }
  return Activity
})

const colorConfig = computed(() => {
  const badge: ColorBadge = props.eventType.colorBadge || 'slate'
  return COLOR_CONFIGS[badge] || COLOR_CONFIGS.slate
})

const formattedPoints = computed(() => {
  const pts = props.eventType.basePoints
  if (pts > 0) return `+${pts} pts`
  return `${pts} pts`
})

const defaultUnitLabel = computed(() => {
  const inc = props.eventType.defaultIncrement ?? 1
  return `${inc} ${props.eventType.defaultUnit}`
})

function handleClick() {
  emit('tap', props.eventType)
}
</script>

<template>
  <button
    type="button"
    :aria-label="`Log ${eventType.name} (${formattedPoints})`"
    :class="[
      'group relative flex flex-col justify-between w-full h-full min-h-[140px] p-4 text-left rounded-2xl',
      'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md',
      'active:scale-[0.97] active:shadow-inner transition-all duration-150 ease-out select-none touch-manipulation cursor-pointer',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
      colorConfig.cardBorderHover,
      colorConfig.activeRing
    ]"
    @click="handleClick"
  >
    <!-- Top Row: Icon & Point Badge -->
    <div class="flex items-start justify-between w-full gap-2">
      <div
        :class="[
          'w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95',
          colorConfig.iconBg
        ]"
      >
        <component :is="iconComponent" class="w-5 h-5" />
      </div>

      <span
        :class="[
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border tracking-tight',
          colorConfig.pointBadge
        ]"
      >
        {{ formattedPoints }}
      </span>
    </div>

    <!-- Bottom Row: Name & Default Unit/Increment -->
    <div class="mt-3 space-y-0.5">
      <div class="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
        {{ eventType.name }}
      </div>
      <div class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
        {{ defaultUnitLabel }}
      </div>
    </div>
  </button>
</template>
