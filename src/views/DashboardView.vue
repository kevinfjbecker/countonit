<script setup lang="ts">
import { LayoutDashboard } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
    <div class="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
      <LayoutDashboard class="w-8 h-8" />
    </div>
    <div class="space-y-1">
      <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard & Trends</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        View daily point progress, streaks, 7-day trends, and taxonomy roll-ups.
      </p>
    </div>
  </div>
</template>
