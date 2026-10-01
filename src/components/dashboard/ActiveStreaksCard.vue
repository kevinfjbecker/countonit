<script setup lang="ts">
import { storeToRefs } from 'pinia'
import * as icons from 'lucide-vue-next'
import { Flame, CheckCircle2, Activity, Zap } from 'lucide-vue-next'
import { useTrackerStore } from '@/stores/tracker'
import { getColorConfig } from '@/utils/colors'

const store = useTrackerStore()
const { activeStreaks } = storeToRefs(store)

function getIconComponent(iconName: string) {
  if (iconName && iconName in icons) {
    return (icons as Record<string, any>)[iconName]
  }
  return Activity
}

function getProgressWidth(todayQuantity: number, targetFrequency: number): number {
  if (targetFrequency <= 0) return 0
  return Math.min(Math.floor((todayQuantity / targetFrequency) * 100), 100)
}
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors space-y-4"
    data-testid="active-streaks-card"
    role="region"
    aria-label="Habit Streaks"
  >
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Flame class="w-4 h-4 fill-amber-500/20" />
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Habit Streaks
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Consecutive daily frequency targets
          </p>
        </div>
      </div>

      <span
        v-if="activeStreaks.length > 0"
        class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300"
      >
        <Flame class="w-3 h-3 text-amber-500" />
        <span>{{ activeStreaks.filter(s => s.streak.currentStreak > 0).length }} Active</span>
      </span>
    </div>

    <!-- Empty State when no habit frequency targets exist -->
    <div
      v-if="activeStreaks.length === 0"
      class="flex flex-col items-center justify-center py-6 text-center space-y-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800"
      data-testid="streak-empty-state"
    >
      <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
        <Zap class="w-5 h-5" />
      </div>
      <p class="text-xs font-medium text-slate-600 dark:text-slate-300">No habit targets configured</p>
      <p class="text-[11px] text-slate-400 max-w-xs">
        Set daily frequency targets on your event types to start building consecutive-day streaks!
      </p>
    </div>

    <!-- Streak Cards Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      data-testid="streak-list"
    >
      <div
        v-for="item in activeStreaks"
        :key="item.eventType.id"
        :data-testid="`streak-card-${item.eventType.id}`"
        class="group relative flex flex-col justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700"
      >
        <!-- Top Row: Event Icon, Name & Flame Counter -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              :class="[
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                getColorConfig(item.eventType.colorBadge).iconBg
              ]"
            >
              <component :is="getIconComponent(item.eventType.icon)" class="w-4 h-4" />
            </div>

            <div class="min-w-0">
              <span class="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {{ item.eventType.name }}
              </span>
              <span class="block text-[11px] text-slate-500 dark:text-slate-400">
                Target: {{ item.targetFrequency }} {{ item.eventType.defaultUnit }}/day
              </span>
            </div>
          </div>

          <!-- Flame & Streak Badge -->
          <div class="flex flex-col items-end shrink-0">
            <div
              :class="[
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-colors',
                item.streak.currentStreak > 0
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
                  : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              ]"
            >
              <Flame
                :class="[
                  'w-3.5 h-3.5',
                  item.streak.currentStreak > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                ]"
                data-testid="streak-flame-icon"
              />
              <span data-testid="streak-count">
                {{ item.streak.currentStreak }} {{ item.streak.currentStreak === 1 ? 'day' : 'days' }}
              </span>
            </div>

            <span
              v-if="item.streak.longestStreak > item.streak.currentStreak"
              class="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5"
            >
              Best: {{ item.streak.longestStreak }}d
            </span>
          </div>
        </div>

        <!-- Progress Bar & Status Footer -->
        <div class="mt-3 space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-medium">
            <span class="text-slate-500 dark:text-slate-400">
              Today: <strong class="text-slate-700 dark:text-slate-200">{{ item.todayQuantity }}</strong> / {{ item.targetFrequency }}
            </span>

            <span
              v-if="item.isTargetMet"
              data-testid="streak-achieved-badge"
              class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"
            >
              <CheckCircle2 class="w-3 h-3" />
              <span>Achieved</span>
            </span>

            <span v-else class="text-slate-400">
              {{ item.targetFrequency - item.todayQuantity }} left
            </span>
          </div>

          <!-- Progress Bar Track -->
          <div class="w-full h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60 overflow-hidden">
            <div
              :class="[
                'h-full rounded-full transition-all duration-300',
                item.isTargetMet
                  ? 'bg-emerald-500 dark:bg-emerald-400'
                  : 'bg-indigo-500 dark:bg-indigo-400'
              ]"
              :style="{ width: `${getProgressWidth(item.todayQuantity, item.targetFrequency)}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
