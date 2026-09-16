<script setup lang="ts">
import { computed } from 'vue'
import * as icons from 'lucide-vue-next'
import { Activity, Pencil, Target } from 'lucide-vue-next'
import type { EventType } from '@/types/domain'

interface Props {
  eventType: EventType
  taxonomyPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  taxonomyPath: ''
})

const emit = defineEmits<{
  (e: 'edit', eventType: EventType): void
}>()

import { getColorConfig } from '@/utils/colors'

const iconComponent = computed(() => {
  const iconName = props.eventType.icon
  if (iconName && iconName in icons) {
    return (icons as Record<string, any>)[iconName]
  }
  return Activity
})

const colorConfig = computed(() => {
  return getColorConfig(props.eventType.colorBadge)
})

const formattedPoints = computed(() => {
  const pts = props.eventType.basePoints
  if (pts > 0) return `+${pts} pts`
  return `${pts} pts`
})
</script>

<template>
  <div
    class="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow"
  >
    <!-- Left: Icon & Details -->
    <div class="flex items-center gap-3 min-w-0">
      <div
        :class="[
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          colorConfig.iconBg
        ]"
      >
        <component :is="iconComponent" class="w-5 h-5" />
      </div>

      <div class="min-w-0 space-y-0.5">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
            {{ eventType.name }}
          </span>
          <span
            :class="[
              'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border tracking-tight',
              colorConfig.pointBadge
            ]"
          >
            {{ formattedPoints }}
          </span>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <span class="font-medium">Unit: {{ eventType.defaultIncrement ?? 1 }} {{ eventType.defaultUnit }}</span>
          
          <span v-if="eventType.targetFrequency" data-testid="target-frequency-badge" class="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
            • <Target class="w-3 h-3 inline" /> {{ eventType.targetFrequency }}x / day
          </span>

          <span v-if="taxonomyPath" class="truncate">
            • {{ taxonomyPath }}
          </span>
        </div>
      </div>
    </div>

    <!-- Right: Edit Action -->
    <div class="flex items-center gap-1 shrink-0 ml-3">
      <button
        type="button"
        data-testid="edit-event-type-btn"
        :aria-label="`Edit ${eventType.name}`"
        class="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        @click="emit('edit', eventType)"
      >
        <Pencil class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
