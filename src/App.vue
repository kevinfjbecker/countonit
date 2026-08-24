<script setup lang="ts">
import { ref, computed } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import LogView from '@/views/LogView.vue'
import DashboardView from '@/views/DashboardView.vue'
import HistoryView from '@/views/HistoryView.vue'
import SettingsView from '@/views/SettingsView.vue'
import type { NavTabId } from '@/types/navigation'

const activeTab = ref<NavTabId>('log')

const currentViewComponent = computed(() => {
  switch (activeTab.value) {
    case 'log':
      return LogView
    case 'dashboard':
      return DashboardView
    case 'history':
      return HistoryView
    case 'settings':
      return SettingsView
  }
})
</script>

<template>
  <AppShell
    v-model:active-tab="activeTab"
  >
    <component :is="currentViewComponent" />
  </AppShell>
</template>
