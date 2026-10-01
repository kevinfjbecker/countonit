<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, Trophy, Target, CheckCircle2 } from 'lucide-vue-next'
import { useTrackerStore } from '@/stores/tracker'

const store = useTrackerStore()

const todayPoints = computed(() => store.todayPoints)
const goalValue = computed(() => store.dailyPointGoalValue)
const progressPercentage = computed(() => store.dailyPointProgressPercentage)
const isGoalAchieved = computed(() => store.isDailyGoalAchieved)

const pointsRemaining = computed(() => {
  const diff = goalValue.value - todayPoints.value
  return diff > 0 ? diff : 0
})

// Circular SVG ring math
const radius = 52
const circumference = 2 * Math.PI * radius

const clampedRatio = computed(() => {
  if (goalValue.value <= 0) return 0
  return Math.min(Math.max(todayPoints.value / goalValue.value, 0), 1)
})

const strokeDashoffset = computed(() => {
  return circumference * (1 - clampedRatio.value)
})
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors relative overflow-hidden"
    data-testid="daily-points-summary-card"
    role="region"
    aria-label="Daily Points Summary"
  >
    <!-- Background Glow Effect on Completion -->
    <div
      v-if="isGoalAchieved"
      class="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"
    />

    <div class="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
      <!-- Left Info Column -->
      <div class="space-y-3 text-center sm:text-left flex-1">
        <div class="flex items-center justify-center sm:justify-start gap-2">
          <div
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              isGoalAchieved
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
            ]"
          >
            <Trophy v-if="isGoalAchieved" class="w-4 h-4" />
            <Target v-else class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Daily Progress
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Target: <span class="font-medium text-slate-700 dark:text-slate-300">{{ goalValue }} pts</span>
            </p>
          </div>
        </div>

        <!-- Status & Celebration Badges -->
        <div>
          <div
            v-if="isGoalAchieved"
            data-testid="goal-achieved-badge"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-2xs animate-pulse"
          >
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Goal Achieved!</span>
            <Sparkles class="w-3 h-3 text-amber-500" />
          </div>

          <div
            v-else
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-medium"
          >
            <span>{{ pointsRemaining }} pts to goal</span>
          </div>
        </div>

        <!-- Metric Details Grid -->
        <div class="pt-1 flex items-center justify-center sm:justify-start gap-4 text-xs">
          <div>
            <span class="text-slate-400 dark:text-slate-500 block text-[11px]">Today's Total</span>
            <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ todayPoints }} pts</span>
          </div>
          <div class="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <span class="text-slate-400 dark:text-slate-500 block text-[11px]">Goal Score</span>
            <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ goalValue }} pts</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Animated Circular SVG Progress Ring -->
      <div class="relative flex items-center justify-center" data-testid="progress-ring">
        <svg
          class="w-32 h-32 transform -rotate-90"
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <!-- Track Circle -->
          <circle
            cx="60"
            cy="60"
            :r="radius"
            class="stroke-slate-100 dark:stroke-slate-800/80"
            stroke-width="10"
            fill="transparent"
          />

          <!-- Progress Ring Circle -->
          <circle
            cx="60"
            cy="60"
            :r="radius"
            :class="[
              'transition-all duration-500 ease-out',
              isGoalAchieved
                ? 'stroke-emerald-500 dark:stroke-emerald-400'
                : 'stroke-indigo-600 dark:stroke-indigo-400'
            ]"
            stroke-width="10"
            stroke-linecap="round"
            fill="transparent"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
          />
        </svg>

        <!-- Ring Inner Content (Percentage & Points) -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            :class="[
              'text-xl font-extrabold tracking-tight transition-colors',
              isGoalAchieved
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-900 dark:text-slate-100'
            ]"
          >
            {{ progressPercentage }}%
          </span>
          <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {{ todayPoints }} / {{ goalValue }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
