<script setup lang="ts">
import { ref, computed } from 'vue'
import { PlusCircle, Sparkles } from 'lucide-vue-next'
import { useTrackerStore } from '@/stores/tracker'
import type { EventType, Occurrence } from '@/types/domain'
import EventCard from '@/components/events/EventCard.vue'
import UndoToast from '@/components/feedback/UndoToast.vue'

const store = useTrackerStore()

const activeEventTypes = computed(() => store.activeEventTypes)
const lastLoggedOccurrence = ref<Occurrence | null>(null)
const showUndoToast = ref(false)

async function handleTap(eventType: EventType) {
  const occurrence = await store.logOccurrence({
    eventTypeId: eventType.id
  })
  if (occurrence) {
    lastLoggedOccurrence.value = occurrence
    showUndoToast.value = true
  }
}

async function handleUndo(occurrenceId: string) {
  await store.undoOccurrence(occurrenceId)
  showUndoToast.value = false
  lastLoggedOccurrence.value = null
}

function handleDismiss() {
  showUndoToast.value = false
  lastLoggedOccurrence.value = null
}
</script>

<template>
  <div class="space-y-4 max-w-4xl mx-auto">
    <!-- Header Section -->
    <div class="flex items-center justify-between px-1">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Quick Log</span>
          <Sparkles class="w-4 h-4 text-amber-500" />
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tap any card to record an occurrence instantly
        </p>
      </div>
    </div>

    <!-- Loading State while initializing -->
    <div
      v-if="!store.isInitialized"
      class="flex flex-col items-center justify-center min-h-[300px] text-center p-8 space-y-3"
      data-testid="loading-state"
    >
      <div class="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <p class="text-xs text-slate-400">Loading event types...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="activeEventTypes.length === 0"
      class="flex flex-col items-center justify-center min-h-[300px] text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3"
    >
      <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shadow-xs">
        <PlusCircle class="w-7 h-7" />
      </div>
      <div class="space-y-1">
        <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">No event types found</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          Configure new event types or unarchive existing ones in Settings to begin logging.
        </p>
      </div>
    </div>

    <!-- Active Event Type Cards Grid -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      <EventCard
        v-for="eventType in activeEventTypes"
        :key="eventType.id"
        :event-type="eventType"
        @tap="handleTap"
      />
    </div>

    <!-- Undo Toast Notification -->
    <UndoToast
      v-model="showUndoToast"
      :occurrence-id="lastLoggedOccurrence?.id"
      :event-type-name="lastLoggedOccurrence?.snapshot.eventTypeName"
      :points="lastLoggedOccurrence?.snapshot.calculatedPoints"
      @undo="handleUndo"
      @dismiss="handleDismiss"
    />
  </div>
</template>
