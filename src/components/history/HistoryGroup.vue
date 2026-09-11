<script setup lang="ts">
import { computed } from 'vue'
import { Calendar } from 'lucide-vue-next'
import type { Occurrence, EventType } from '@/types/domain'
import { getLocalDateString } from '@/stores/tracker'
import HistoryTimelineItem from './HistoryTimelineItem.vue'

interface Props {
  dateString: string // YYYY-MM-DD
  occurrences: Occurrence[]
  eventTypes?: EventType[]
  getTaxonomyPath?: (nodeId?: string | null) => string
}

const props = withDefaults(defineProps<Props>(), {
  eventTypes: () => [],
  getTaxonomyPath: () => () => ''
})

const emit = defineEmits<{
  (e: 'edit', occurrence: Occurrence): void
  (e: 'delete', occurrence: Occurrence): void
}>()

const eventTypeMap = computed(() => {
  const map = new Map<string, EventType>()
  for (const et of props.eventTypes) {
    map.set(et.id, et)
  }
  return map
})

const formattedDateHeader = computed(() => {
  const today = getLocalDateString(new Date())
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = getLocalDateString(yesterdayDate)

  if (props.dateString === today) {
    return 'Today'
  }
  if (props.dateString === yesterday) {
    return 'Yesterday'
  }

  try {
    const [y, m, d] = props.dateString.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  } catch {
    return props.dateString
  }
})

const fullDateSubheader = computed(() => {
  try {
    const [y, m, d] = props.dateString.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return props.dateString
  }
})

const totalPoints = computed(() => {
  return props.occurrences.reduce(
    (sum, occ) => sum + (occ.snapshot.calculatedPoints || 0),
    0
  )
})

const formattedTotalPoints = computed(() => {
  const pts = totalPoints.value
  if (pts > 0) return `+${pts} pts`
  return `${pts} pts`
})

const itemCountLabel = computed(() => {
  const count = props.occurrences.length
  return count === 1 ? '1 item' : `${count} items`
})
</script>

<template>
  <section
    class="space-y-2.5"
    :aria-labelledby="`group-heading-${dateString}`"
    :data-testid="`history-group-${dateString}`"
  >
    <!-- Group Header Sticky/Pill -->
    <div class="flex items-center justify-between px-1.5 py-1">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Calendar class="w-3.5 h-3.5" />
        </div>
        <div class="flex items-baseline gap-1.5 truncate">
          <h2
            :id="`group-heading-${dateString}`"
            class="text-sm font-bold text-slate-900 dark:text-slate-100"
          >
            {{ formattedDateHeader }}
          </h2>
          <span
            v-if="formattedDateHeader === 'Today' || formattedDateHeader === 'Yesterday'"
            class="text-[11px] font-medium text-slate-400 dark:text-slate-500"
          >
            {{ fullDateSubheader }}
          </span>
        </div>
      </div>

      <!-- Group Summary: Points & Count -->
      <div class="flex items-center gap-2 text-xs shrink-0">
        <span class="text-slate-400 dark:text-slate-500 text-[11px] font-medium">
          {{ itemCountLabel }}
        </span>
        <span
          :class="[
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
            totalPoints > 0
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50'
              : totalPoints < 0
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          ]"
        >
          {{ formattedTotalPoints }}
        </span>
      </div>
    </div>

    <!-- Group Occurrences List with Connecting Spine -->
    <div class="space-y-2 relative pl-1">
      <HistoryTimelineItem
        v-for="occ in occurrences"
        :key="occ.id"
        :occurrence="occ"
        :event-type="eventTypeMap.get(occ.eventTypeId)"
        :taxonomy-path="getTaxonomyPath(occ.snapshot.taxonomyNodeId)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </section>
</template>
