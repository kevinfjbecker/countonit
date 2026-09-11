<script setup lang="ts">
import { computed } from 'vue'
import * as icons from 'lucide-vue-next'
import { Activity, Pencil, Trash2 } from 'lucide-vue-next'
import type { Occurrence, EventType, ColorBadge } from '@/types/domain'
import { formatUnitQuantity } from '@/utils/formatters'

interface Props {
  occurrence: Occurrence
  eventType?: EventType
  taxonomyPath?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', occurrence: Occurrence): void
  (e: 'delete', occurrence: Occurrence): void
}>()

const COLOR_CONFIGS: Record<
  ColorBadge,
  {
    iconBg: string
    iconColor: string
    dotBg: string
  }
> = {
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/70',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    dotBg: 'bg-emerald-500'
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-950/70',
    iconColor: 'text-amber-600 dark:text-amber-400',
    dotBg: 'bg-amber-500'
  },
  sky: {
    iconBg: 'bg-sky-100 dark:bg-sky-950/70',
    iconColor: 'text-sky-600 dark:text-sky-400',
    dotBg: 'bg-sky-500'
  },
  rose: {
    iconBg: 'bg-rose-100 dark:bg-rose-950/70',
    iconColor: 'text-rose-600 dark:text-rose-400',
    dotBg: 'bg-rose-500'
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-950/70',
    iconColor: 'text-violet-600 dark:text-violet-400',
    dotBg: 'bg-violet-500'
  },
  indigo: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/70',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    dotBg: 'bg-indigo-500'
  },
  slate: {
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-300',
    dotBg: 'bg-slate-500'
  }
}

const colorConfig = computed(() => {
  const badge: ColorBadge = props.eventType?.colorBadge || 'slate'
  return COLOR_CONFIGS[badge] || COLOR_CONFIGS.slate
})

const iconComponent = computed(() => {
  const iconName = props.eventType?.icon
  if (iconName && iconName in icons) {
    return (icons as Record<string, any>)[iconName]
  }
  return Activity
})

const formattedTime = computed(() => {
  try {
    const d = new Date(props.occurrence.timestamp)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
})

const formattedPoints = computed(() => {
  const pts = props.occurrence.snapshot.calculatedPoints ?? 0
  if (pts > 0) return `+${pts} pts`
  return `${pts} pts`
})

const formattedUnit = computed(() => {
  return formatUnitQuantity(props.occurrence.quantity, props.occurrence.snapshot.unit)
})
</script>

<template>
  <div
    class="group relative flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-150"
    :data-testid="`occurrence-item-${occurrence.id}`"
  >
    <!-- Icon Container -->
    <div
      :class="[
        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105',
        colorConfig.iconBg,
        colorConfig.iconColor
      ]"
    >
      <component :is="iconComponent" class="w-5 h-5" />
    </div>

    <!-- Occurrence Details -->
    <div class="flex-1 min-w-0 space-y-1">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
              {{ occurrence.snapshot.eventTypeName }}
            </span>

            <!-- Subtype Badge -->
            <span
              v-if="occurrence.subtypeName"
              class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {{ occurrence.subtypeName }}
            </span>
          </div>

          <!-- Taxonomy path if available -->
          <div
            v-if="taxonomyPath"
            class="text-[11px] text-slate-400 dark:text-slate-500 truncate"
          >
            {{ taxonomyPath }}
          </div>
        </div>

        <!-- Calculated Points Badge -->
        <span
          :class="[
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 tracking-tight',
            occurrence.snapshot.calculatedPoints > 0
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50'
              : occurrence.snapshot.calculatedPoints < 0
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50'
                : 'bg-slate-50 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          ]"
        >
          {{ formattedPoints }}
        </span>
      </div>

      <!-- Quantity, Time & Action Buttons -->
      <div class="flex items-center justify-between pt-0.5 text-xs text-slate-500 dark:text-slate-400">
        <div class="flex items-center gap-2">
          <span class="font-medium text-slate-700 dark:text-slate-300">
            {{ formattedUnit }}
          </span>
          <span>•</span>
          <span>{{ formattedTime }}</span>
        </div>

        <!-- Action Buttons (Edit / Delete) -->
        <div class="flex items-center gap-1 opacity-90 group-hover:opacity-100">
          <button
            type="button"
            :aria-label="`Edit ${occurrence.snapshot.eventTypeName}`"
            class="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            @click="emit('edit', occurrence)"
          >
            <Pencil class="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            :aria-label="`Delete ${occurrence.snapshot.eventTypeName}`"
            class="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            @click="emit('delete', occurrence)"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
