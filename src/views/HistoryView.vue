<script setup lang="ts">
import { History } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
    <div class="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
      <History class="w-8 h-8" />
    </div>
    <div class="space-y-1">
      <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">History Timeline</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        Browse, filter, edit, and backfill your past occurrences chronologically.
      </p>
    </div>
  </div>
</template>
