<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { TrendingUp, CheckCircle2, Target, Calendar } from 'lucide-vue-next'
import { useTrackerStore } from '@/stores/tracker'
import type { DayTrendItem } from '@/types/domain'

const store = useTrackerStore()
const { dailyPointGoalValue } = storeToRefs(store)

const trendData = computed<DayTrendItem[]>(() => {
  return store.sevenDayTrend()
})

// Explicit user selection (date string or null if using default)
const activeSelectedDate = ref<string | null>(null)

const selectedDay = computed<DayTrendItem | undefined>(() => {
  if (trendData.value.length === 0) return undefined
  if (activeSelectedDate.value) {
    const found = trendData.value.find(d => d.date === activeSelectedDate.value)
    if (found) return found
  }
  // Default to today / latest day in trend window
  return trendData.value[trendData.value.length - 1]
})

const daysGoalMetCount = computed(() => {
  return trendData.value.filter(d => d.isGoalMet).length
})

// Calculate max points for chart bar scaling (ensure minimum baseline of goal or 10)
const maxChartPoints = computed(() => {
  const points = trendData.value.map(d => d.totalPoints)
  return Math.max(...points, dailyPointGoalValue.value, 10)
})

function getBarHeightPercentage(points: number): number {
  if (points <= 0) return 6 // Minimum subtle pill height
  const pct = Math.round((points / maxChartPoints.value) * 100)
  return Math.max(pct, 12)
}

function selectDay(date: string) {
  activeSelectedDate.value = date
}
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors relative overflow-hidden"
    data-testid="seven-day-trend-card"
    role="region"
    aria-label="7-Day Activity Trend"
  >
    <!-- Header Row -->
    <div class="flex items-center justify-between gap-4 mb-5">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <TrendingUp class="w-4 h-4" />
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
            7-Day Trend
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Daily points and goal performance
          </p>
        </div>
      </div>

      <!-- Days Goal Met Summary Badge -->
      <div
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-300"
      >
        <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
        <span>{{ daysGoalMetCount }}/7 Days Met</span>
      </div>
    </div>

    <!-- Chart Bar Visualization Area -->
    <div class="pt-2 pb-4">
      <div class="flex items-end justify-between gap-2 sm:gap-3 h-44 px-1" role="group" aria-label="7-Day trend chart bars">
        <div
          v-for="day in trendData"
          :key="day.date"
          data-testid="trend-bar-col"
          role="button"
          tabindex="0"
          :aria-pressed="selectedDay?.date === day.date"
          :aria-label="`${day.dayOfWeek} ${day.formattedDate}: ${day.totalPoints} points, ${day.occurrenceCount} activities`"
          :class="[
            'flex-1 flex flex-col items-center h-full justify-end group cursor-pointer focus:outline-none transition-all',
            selectedDay?.date === day.date ? 'scale-[1.02]' : 'hover:opacity-90'
          ]"
          @click="selectDay(day.date)"
          @keydown.enter="selectDay(day.date)"
          @keydown.space.prevent="selectDay(day.date)"
        >
          <!-- Goal Met Checkmark Badge Above Bar -->
          <div class="h-6 flex items-center justify-center mb-1">
            <div
              v-if="day.isGoalMet"
              data-testid="goal-met-indicator"
              class="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs"
              title="Daily Goal Met"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
            </div>
          </div>

          <!-- Bar Visual Track -->
          <div class="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800/80 rounded-t-lg flex flex-col justify-end p-0.5 relative h-28">
            <div
              :style="{ height: `${getBarHeightPercentage(day.totalPoints)}%` }"
              :class="[
                'w-full rounded-t-md transition-all duration-300 relative',
                day.isGoalMet
                  ? 'bg-emerald-500 dark:bg-emerald-400 shadow-xs'
                  : day.totalPoints > 0
                    ? 'bg-indigo-500 dark:bg-indigo-400'
                    : 'bg-slate-200 dark:bg-slate-700/60',
                selectedDay?.date === day.date
                  ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-1 dark:ring-offset-slate-900'
                  : ''
              ]"
              data-testid="trend-bar"
            />
          </div>

          <!-- Labels: Day of Week & Date -->
          <div class="mt-2 text-center space-y-0.5">
            <span
              data-testid="day-label"
              :class="[
                'block text-xs font-bold transition-colors',
                day.isToday
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : selectedDay?.date === day.date
                    ? 'text-slate-900 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400'
              ]"
            >
              {{ day.dayLabel }}
            </span>
            <span class="block text-[10px] text-slate-400 dark:text-slate-500">
              {{ day.formattedDate }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Day Tooltip / Interactive Details Box -->
    <div
      v-if="selectedDay"
      data-testid="trend-tooltip"
      class="mt-2 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-all"
    >
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <Calendar class="w-3.5 h-3.5" />
        </div>
        <div>
          <span class="font-bold text-slate-900 dark:text-slate-100 block">
            {{ selectedDay.dayOfWeek }}, {{ selectedDay.formattedDate }}
            <span v-if="selectedDay.isToday" class="text-indigo-600 dark:text-indigo-400 font-semibold ml-1">(Today)</span>
          </span>
          <span class="text-slate-500 dark:text-slate-400">
            {{ selectedDay.occurrenceCount }} {{ selectedDay.occurrenceCount === 1 ? 'activity' : 'activities' }} logged
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3 self-end sm:self-auto">
        <div class="text-right">
          <span class="font-extrabold text-sm text-slate-900 dark:text-slate-100 block">
            {{ selectedDay.totalPoints }} pts
          </span>
          <span
            :class="[
              'text-[11px] font-medium block',
              selectedDay.isGoalMet
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 dark:text-slate-500'
            ]"
          >
            {{ selectedDay.isGoalMet ? 'Goal Achieved!' : `Goal: ${dailyPointGoalValue} pts` }}
          </span>
        </div>

        <div
          v-if="selectedDay.isGoalMet"
          class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
        >
          <Target class="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  </div>
</template>
