<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  History,
  Plus,
  Search,
  Filter,
  X,
  RotateCcw,
  Calendar
} from 'lucide-vue-next'
import { useTrackerStore, getLocalDateString } from '@/stores/tracker'
import type { Occurrence, LogOccurrenceDto } from '@/types/domain'
import HistoryGroup from '@/components/history/HistoryGroup.vue'
import BackfillModal from '@/components/history/BackfillModal.vue'
import EditOccurrenceModal from '@/components/history/EditOccurrenceModal.vue'
import DeleteConfirmModal from '@/components/history/DeleteConfirmModal.vue'

const store = useTrackerStore()

type DateFilterPreset = 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'custom'

// State for filters
const dateFilter = ref<DateFilterPreset>('all')
const customDate = ref<string>(getLocalDateString(new Date()))
const selectedEventTypeFilter = ref<string>('all')
const searchQuery = ref<string>('')

// State for modals
const showBackfillModal = ref<boolean>(false)
const showEditModal = ref<boolean>(false)
const showDeleteModal = ref<boolean>(false)
const editingOccurrence = ref<Occurrence | null>(null)
const deletingOccurrence = ref<Occurrence | null>(null)

// Active and archived event types for filter dropdown
const allEventTypes = computed(() => store.eventTypes)
const activeEventTypes = computed(() => store.activeEventTypes)

// Filtered Occurrences
const filteredOccurrences = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const today = getLocalDateString(new Date())
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = getLocalDateString(yesterdayDate)

  const now = new Date()
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)
  const endOfTodayMs = endOfToday.getTime()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  sevenDaysAgo.setHours(0, 0, 0, 0)
  const sevenDaysAgoMs = sevenDaysAgo.getTime()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)
  const thirtyDaysAgoMs = thirtyDaysAgo.getTime()

  return store.sortedOccurrences.filter((occ) => {
    // 1. Search Query Filter
    if (query) {
      const nameMatch = occ.snapshot.eventTypeName.toLowerCase().includes(query)
      const subtypeMatch = occ.subtypeName?.toLowerCase().includes(query) ?? false
      const taxPath = store.getTaxonomyPath(occ.snapshot.taxonomyNodeId).toLowerCase()
      const taxMatch = taxPath.includes(query)
      if (!nameMatch && !subtypeMatch && !taxMatch) {
        return false
      }
    }

    // 2. Event Type Filter
    if (selectedEventTypeFilter.value !== 'all') {
      if (occ.eventTypeId !== selectedEventTypeFilter.value) {
        return false
      }
    }

    // 3. Date Preset Filter
    const occDateStr = getLocalDateString(occ.timestamp)
    const occTimeMs = new Date(occ.timestamp).getTime()

    if (dateFilter.value === 'today') {
      return occDateStr === today
    }
    if (dateFilter.value === 'yesterday') {
      return occDateStr === yesterday
    }
    if (dateFilter.value === '7days') {
      return occTimeMs >= sevenDaysAgoMs && occTimeMs <= endOfTodayMs
    }
    if (dateFilter.value === '30days') {
      return occTimeMs >= thirtyDaysAgoMs && occTimeMs <= endOfTodayMs
    }
    if (dateFilter.value === 'custom') {
      return occDateStr === customDate.value
    }

    return true // 'all'
  })
})

// Group filtered occurrences by date (YYYY-MM-DD), sorted newest date first
const groupedOccurrences = computed(() => {
  const groupsMap = new Map<string, Occurrence[]>()

  for (const occ of filteredOccurrences.value) {
    const dateStr = getLocalDateString(occ.timestamp)
    const existing = groupsMap.get(dateStr)
    if (existing) {
      existing.push(occ)
    } else {
      groupsMap.set(dateStr, [occ])
    }
  }

  // Sort groups descending by date key
  const sortedDateKeys = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a))

  return sortedDateKeys.map((dateString) => ({
    dateString,
    // Occurrences within group sorted descending by timestamp
    occurrences: (groupsMap.get(dateString) || []).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }))
})

// Handlers
function openBackfillModal() {
  showBackfillModal.value = true
}

async function handleBackfillSubmit(dto: LogOccurrenceDto) {
  await store.logOccurrence(dto)
}

function handleEdit(occurrence: Occurrence) {
  editingOccurrence.value = occurrence
  showEditModal.value = true
}

async function handleEditSave(payload: { id: string; quantity: number; timestamp: string }) {
  await store.updateOccurrence(payload.id, {
    quantity: payload.quantity,
    timestamp: payload.timestamp
  })
  editingOccurrence.value = null
}

function handleDelete(occurrence: Occurrence) {
  deletingOccurrence.value = occurrence
  showDeleteModal.value = true
}

async function handleDeleteConfirm(occurrenceId: string) {
  await store.deleteOccurrence(occurrenceId)
  deletingOccurrence.value = null
}

function resetFilters() {
  dateFilter.value = 'all'
  selectedEventTypeFilter.value = 'all'
  searchQuery.value = ''
}
</script>

<template>
  <div class="space-y-4 max-w-4xl mx-auto pb-10">
    <!-- View Header -->
    <div class="flex items-center justify-between px-1">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Activity History</span>
          <History class="w-4 h-4 text-indigo-500" />
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review, edit, and backfill your event occurrences
        </p>
      </div>

      <!-- Backfill Action Button -->
      <button
        type="button"
        data-testid="open-backfill-btn"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
        @click="openBackfillModal"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Backfill</span>
      </button>
    </div>

    <!-- Filter & Search Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-xs">
      <!-- Search Input & Event Type Select -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <!-- Search Input -->
        <div class="relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            v-model="searchQuery"
            data-testid="history-search-input"
            type="text"
            placeholder="Search events or taxonomies..."
            class="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            v-if="searchQuery"
            type="button"
            aria-label="Clear search"
            class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            @click="searchQuery = ''"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Event Type Filter Dropdown -->
        <div class="relative">
          <Filter class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <select
            v-model="selectedEventTypeFilter"
            data-testid="event-type-filter"
            class="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Event Types</option>
            <option
              v-for="et in allEventTypes"
              :key="et.id"
              :value="et.id"
            >
              {{ et.name }} {{ et.archived ? '(Archived)' : '' }}
            </option>
          </select>
        </div>
      </div>

      <!-- Date Presets Scrollable Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          type="button"
          data-testid="filter-date-all"
          :class="[
            'px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0',
            dateFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          ]"
          @click="dateFilter = 'all'"
        >
          All
        </button>
        <button
          type="button"
          data-testid="filter-date-today"
          :class="[
            'px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0',
            dateFilter === 'today'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          ]"
          @click="dateFilter = 'today'"
        >
          Today
        </button>
        <button
          type="button"
          data-testid="filter-date-yesterday"
          :class="[
            'px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0',
            dateFilter === 'yesterday'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          ]"
          @click="dateFilter = 'yesterday'"
        >
          Yesterday
        </button>
        <button
          type="button"
          data-testid="filter-date-7days"
          :class="[
            'px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0',
            dateFilter === '7days'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          ]"
          @click="dateFilter = '7days'"
        >
          Past 7 Days
        </button>
        <button
          type="button"
          data-testid="filter-date-30days"
          :class="[
            'px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0',
            dateFilter === '30days'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          ]"
          @click="dateFilter = '30days'"
        >
          Past 30 Days
        </button>
        <button
          type="button"
          data-testid="filter-date-custom"
          :class="[
            'px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1',
            dateFilter === 'custom'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          ]"
          @click="dateFilter = 'custom'"
        >
          <Calendar class="w-3 h-3" />
          <span>Custom</span>
        </button>
      </div>

      <!-- Custom Date Input (shown when dateFilter === 'custom') -->
      <div v-if="dateFilter === 'custom'" class="pt-1">
        <label for="custom-date-filter" class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
          Pick Specific Date:
        </label>
        <input
          id="custom-date-filter"
          v-model="customDate"
          data-testid="custom-date-picker"
          type="date"
          class="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>

    <!-- Empty State: No Occurrences in Database at All -->
    <div
      v-if="store.occurrences.length === 0"
      data-testid="history-empty-state"
      class="flex flex-col items-center justify-center min-h-[260px] text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3"
    >
      <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shadow-xs">
        <History class="w-7 h-7" />
      </div>
      <div class="space-y-1">
        <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">
          No activity recorded yet
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          Log events in Quick Log or backfill past occurrences with custom dates.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
        @click="openBackfillModal"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Backfill Past Occurrence</span>
      </button>
    </div>

    <!-- Filtered Empty State: Occurrences exist, but no matches for active filters -->
    <div
      v-else-if="groupedOccurrences.length === 0"
      data-testid="history-filtered-empty-state"
      class="flex flex-col items-center justify-center min-h-[220px] text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3"
    >
      <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
        <Search class="w-6 h-6" />
      </div>
      <div class="space-y-1">
        <h2 class="text-sm font-semibold text-slate-800 dark:text-slate-100">
          No occurrences match your filters
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          Try adjusting your date range, search query, or event type filter.
        </p>
      </div>
      <button
        type="button"
        data-testid="reset-filters-btn"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
        @click="resetFilters"
      >
        <RotateCcw class="w-3 h-3" />
        <span>Clear Filters</span>
      </button>
    </div>

    <!-- Chronological Grouped Timeline -->
    <div v-else data-testid="timeline-container" class="space-y-6 pt-1">
      <HistoryGroup
        v-for="group in groupedOccurrences"
        :key="group.dateString"
        :date-string="group.dateString"
        :occurrences="group.occurrences"
        :event-types="allEventTypes"
        :get-taxonomy-path="store.getTaxonomyPath"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Modals -->
    <BackfillModal
      v-model="showBackfillModal"
      :event-types="activeEventTypes"
      @submit="handleBackfillSubmit"
    />

    <EditOccurrenceModal
      v-model="showEditModal"
      :occurrence="editingOccurrence"
      @save="handleEditSave"
    />

    <DeleteConfirmModal
      v-model="showDeleteModal"
      :occurrence="deletingOccurrence"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
