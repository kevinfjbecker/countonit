<script setup lang="ts">
import { useTrackerStore } from '@/stores/tracker'
import DailyPointsSummaryCard from '@/components/dashboard/DailyPointsSummaryCard.vue'

const store = useTrackerStore()
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header Section -->
    <div class="flex items-center justify-between px-1">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Dashboard</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Overview of daily goal score progress and habit performance
        </p>
      </div>
    </div>

    <!-- Loading State while initializing -->
    <div
      v-if="!store.isInitialized"
      class="flex flex-col items-center justify-center min-h-[200px] text-center p-8 space-y-3"
      data-testid="loading-state"
    >
      <div class="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <p class="text-xs text-slate-400">Loading dashboard...</p>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- Top Summary Card: Daily Points & Circular Progress Ring -->
      <DailyPointsSummaryCard />
    </div>
  </div>
</template>
