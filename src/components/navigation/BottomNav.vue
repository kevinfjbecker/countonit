<script setup lang="ts">
import {
  ListPlus,
  LayoutDashboard,
  History,
  Settings,
} from 'lucide-vue-next'
import type { NavTabId, NavTabItem } from '@/types/navigation'

const props = withDefaults(
  defineProps<{
    modelValue?: NavTabId
  }>(),
  {
    modelValue: 'log',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: NavTabId): void
}>()

const tabs: NavTabItem[] = [
  {
    id: 'log',
    label: 'Log',
    icon: ListPlus,
    ariaLabel: 'Log occurrences',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    ariaLabel: 'Dashboard and habit trends',
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    ariaLabel: 'Occurrence history timeline',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    ariaLabel: 'Application settings and taxonomies',
  },
]

function selectTab(id: NavTabId) {
  emit('update:modelValue', id)
}
</script>

<template>
  <nav
    aria-label="Main Navigation"
    class="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 select-none pb-[env(safe-area-inset-bottom)]"
  >
    <div
      role="tablist"
      aria-label="App Views"
      class="grid grid-cols-4 h-16 max-w-md mx-auto"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :data-tab="tab.id"
        role="tab"
        :aria-selected="props.modelValue === tab.id"
        :aria-label="tab.label"
        type="button"
        class="flex flex-col items-center justify-center gap-1 transition-colors duration-150 relative py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        :class="[
          props.modelValue === tab.id
            ? 'text-indigo-600 dark:text-indigo-400 font-medium'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        ]"
        @click="selectTab(tab.id)"
      >
        <component
          :is="tab.icon"
          class="w-5 h-5 transition-transform duration-150"
          :class="{ 'scale-110': props.modelValue === tab.id }"
          aria-hidden="true"
        />
        <span class="text-xs leading-none tracking-tight">{{ tab.label }}</span>
        
        <!-- Active indicator pill -->
        <span
          v-if="props.modelValue === tab.id"
          class="absolute top-1 w-8 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
          aria-hidden="true"
        />
      </button>
    </div>
  </nav>
</template>
