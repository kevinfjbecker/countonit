<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Sliders } from 'lucide-vue-next'
import { useTrackerStore } from '@/stores/tracker'
import type { EventType, CreateEventTypeDto, UpdateEventTypeDto } from '@/types/domain'
import EventTypeListItem from '@/components/settings/EventTypeListItem.vue'
import EventTypeEditorModal from '@/components/settings/EventTypeEditorModal.vue'

const store = useTrackerStore()

const activeEventTypes = computed(() => store.activeEventTypes)
const taxonomyNodes = computed(() => store.taxonomyNodes)

// Modal state
const isModalOpen = ref(false)
const selectedEventType = ref<EventType | null>(null)

function openCreateModal() {
  selectedEventType.value = null
  isModalOpen.value = true
}

function openEditModal(eventType: EventType) {
  selectedEventType.value = eventType
  isModalOpen.value = true
}

async function handleSave(dto: CreateEventTypeDto | UpdateEventTypeDto) {
  if (selectedEventType.value) {
    await store.updateEventType(selectedEventType.value.id, dto)
  } else {
    await store.addEventType(dto as CreateEventTypeDto)
  }
}
</script>

<template>
  <div class="space-y-6 max-w-2xl mx-auto pb-12">
    <!-- Header Section -->
    <div class="flex items-center justify-between px-1">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Settings & Taxonomies</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage event types, taxonomies, goals, and preferences
        </p>
      </div>
    </div>

    <!-- Event Types Management Section -->
    <section class="space-y-3">
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-2">
          <Sliders class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 class="text-base font-bold text-slate-800 dark:text-slate-200">
            Event Types
          </h2>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {{ activeEventTypes.length }}
          </span>
        </div>

        <button
          type="button"
          data-testid="add-event-type-btn"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          @click="openCreateModal"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add New</span>
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-if="activeEventTypes.length === 0"
        class="flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2"
      >
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">
          No active event types configured
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          Click "Add New" above to configure your first event type.
        </p>
      </div>

      <!-- List of Event Types -->
      <div v-else class="space-y-2.5">
        <EventTypeListItem
          v-for="eventType in activeEventTypes"
          :key="eventType.id"
          :event-type="eventType"
          :taxonomy-path="store.getTaxonomyPath(eventType.taxonomyNodeId)"
          @edit="openEditModal"
        />
      </div>
    </section>

    <!-- Event Type Creator / Editor Modal -->
    <EventTypeEditorModal
      v-model="isModalOpen"
      :event-type="selectedEventType"
      :taxonomy-nodes="taxonomyNodes"
      @save="handleSave"
    />
  </div>
</template>
