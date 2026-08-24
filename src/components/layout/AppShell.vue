<script setup lang="ts">
import BottomNav from '@/components/navigation/BottomNav.vue'
import type { NavTabId } from '@/types/navigation'

const props = withDefaults(
  defineProps<{
    activeTab?: NavTabId
    title?: string
  }>(),
  {
    activeTab: 'log',
    title: 'Count On It',
  },
)

const emit = defineEmits<{
  (e: 'update:activeTab', value: NavTabId): void
}>()

function onTabChange(tab: NavTabId) {
  emit('update:activeTab', tab)
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-start antialiased">
    <!-- Responsive mobile frame: full width on mobile, max-w-md centered on desktop -->
    <div class="w-full max-w-md min-h-[100dvh] h-[100dvh] flex flex-col bg-white dark:bg-slate-900 shadow-lg relative overflow-hidden">
      <!-- Top App Header -->
      <header class="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-10 shrink-0">
        <slot name="header">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              C
            </div>
            <h1 class="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {{ title }}
            </h1>
          </div>
        </slot>
      </header>

      <!-- Scrollable Main Content Area -->
      <main class="flex-1 overflow-y-auto overscroll-contain relative p-4 bg-slate-50/50 dark:bg-slate-900/50">
        <slot />
      </main>

      <!-- Sticky / Fixed Bottom Navigation Bar -->
      <footer class="shrink-0 sticky bottom-0 z-20">
        <BottomNav
          :model-value="props.activeTab"
          @update:model-value="onTabChange"
        />
      </footer>
    </div>
  </div>
</template>
