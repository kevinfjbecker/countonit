<script setup lang="ts">
import { computed } from 'vue'
import { FolderTree, PieChart } from 'lucide-vue-next'
import { useTrackerStore } from '@/stores/tracker'
import { getColorConfig } from '@/utils/colors'
import type { TaxonomyCategoryBreakdownItem } from '@/types/domain'

const store = useTrackerStore()

const breakdownList = computed<TaxonomyCategoryBreakdownItem[]>(() => {
  return store.taxonomyCategoryBreakdown()
})

const totalCategoryCount = computed(() => breakdownList.value.length)
</script>

<template>
  <div
    class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors relative overflow-hidden"
    data-testid="taxonomy-breakdown-card"
    role="region"
    aria-label="Taxonomy Category Breakdown"
  >
    <!-- Header Row -->
    <div class="flex items-center justify-between gap-4 mb-5">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <FolderTree class="w-4 h-4" />
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Category Breakdown
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Points distribution by taxonomy node
          </p>
        </div>
      </div>

      <!-- Category Count Badge -->
      <div
        v-if="totalCategoryCount > 0"
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-300"
      >
        <span>{{ totalCategoryCount }} {{ totalCategoryCount === 1 ? 'Category' : 'Categories' }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="breakdownList.length === 0"
      data-testid="empty-breakdown-state"
      class="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-500 space-y-2 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800"
    >
      <PieChart class="w-8 h-8 stroke-1 text-slate-400 dark:text-slate-500" />
      <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
        No activities logged today yet
      </p>
      <p class="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs">
        Log habits to see how your points roll up across taxonomy categories.
      </p>
    </div>

    <!-- Category Distribution List -->
    <div v-else class="space-y-4" data-testid="category-breakdown-list">
      <div
        v-for="item in breakdownList"
        :key="item.nodeId"
        data-testid="category-breakdown-item"
        class="space-y-1.5"
      >
        <!-- Category Meta Row -->
        <div class="flex items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-2 min-w-0">
            <!-- Color Indicator Badge -->
            <span
              :class="[
                'w-2.5 h-2.5 rounded-full shrink-0',
                getColorConfig(item.color).bgClass
              ]"
            />
            <span class="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {{ item.name }}
            </span>
            <span class="text-slate-400 dark:text-slate-500 text-[11px] shrink-0">
              ({{ item.occurrenceCount }} {{ item.occurrenceCount === 1 ? 'activity' : 'activities' }})
            </span>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <span class="font-bold text-slate-800 dark:text-slate-200">
              {{ item.totalPoints }} pts
            </span>
            <span
              class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {{ item.percentage }}%
            </span>
          </div>
        </div>

        <!-- Proportion Progress Bar -->
        <div
          class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden"
          data-testid="category-progress-track"
        >
          <div
            data-testid="category-progress-bar"
            :class="[
              'h-full rounded-full transition-all duration-500 ease-out',
              getColorConfig(item.color).bgClass
            ]"
            :style="{ width: `${Math.max(item.percentage, item.totalPoints > 0 ? 3 : 0)}%` }"
            :title="`${item.name}: ${item.percentage}% (${item.totalPoints} pts)`"
          />
        </div>
      </div>
    </div>
  </div>
</template>
