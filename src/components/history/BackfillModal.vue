<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Clock, Plus, Minus, Sparkles } from 'lucide-vue-next'
import type { EventType, LogOccurrenceDto } from '@/types/domain'
import { formatDateTimeForInput } from '@/utils/formatters'

interface Props {
  modelValue: boolean
  eventTypes: EventType[]
  initialDate?: string
}

const props = withDefaults(defineProps<Props>(), {
  eventTypes: () => []
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', dto: LogOccurrenceDto): void
}>()

const selectedEventTypeId = ref<string>('')
const selectedSubtypeId = ref<string>('')
const quantity = ref<number>(1)
const datetimeLocal = ref<string>(formatDateTimeForInput())

const selectedEventType = computed(() => {
  return props.eventTypes.find(e => e.id === selectedEventTypeId.value)
})

const availableSubtypes = computed(() => {
  return selectedEventType.value?.subtypes || []
})

const selectedSubtype = computed(() => {
  if (!selectedSubtypeId.value) return null
  return availableSubtypes.value.find(s => s.id === selectedSubtypeId.value) || null
})

// Initialize / reset fields when modal opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (props.eventTypes.length > 0 && !selectedEventTypeId.value) {
        selectedEventTypeId.value = props.eventTypes[0].id
      }
      const currentEt = props.eventTypes.find(e => e.id === selectedEventTypeId.value)
      quantity.value = currentEt?.defaultIncrement ?? 1
      selectedSubtypeId.value = ''
      datetimeLocal.value = formatDateTimeForInput(
        props.initialDate ? new Date(props.initialDate) : new Date()
      )
    }
  },
  { immediate: true }
)

// When event type changes, update quantity and reset subtype
watch(selectedEventTypeId, (newId) => {
  const et = props.eventTypes.find(e => e.id === newId)
  if (et) {
    quantity.value = et.defaultIncrement ?? 1
    selectedSubtypeId.value = ''
  }
})

// When subtype changes, update quantity override if specified
watch(selectedSubtypeId, (newSubtypeId) => {
  if (newSubtypeId && selectedSubtype.value?.quantityOverride) {
    quantity.value = selectedSubtype.value.quantityOverride
  }
})

const calculatedPoints = computed(() => {
  if (!selectedEventType.value) return 0
  let basePoints = selectedEventType.value.basePoints
  if (selectedSubtype.value?.pointOverride !== undefined && selectedSubtype.value.pointOverride !== null) {
    basePoints = selectedSubtype.value.pointOverride
  }
  return basePoints * (quantity.value || 0)
})

const formattedCalculatedPoints = computed(() => {
  const pts = calculatedPoints.value
  if (pts > 0) return `+${pts} pts`
  return `${pts} pts`
})

function handleIncrement() {
  const inc = selectedEventType.value?.defaultIncrement ?? 1
  quantity.value = Math.max(1, (quantity.value || 0) + inc)
}

function handleDecrement() {
  const inc = selectedEventType.value?.defaultIncrement ?? 1
  quantity.value = Math.max(1, (quantity.value || 0) - inc)
}

function handleSetQuickDate(offsetDays: number) {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  datetimeLocal.value = formatDateTimeForInput(d)
}

function handleSubmit() {
  if (!selectedEventTypeId.value) return

  const isoTimestamp = new Date(datetimeLocal.value).toISOString()

  const dto: LogOccurrenceDto = {
    eventTypeId: selectedEventTypeId.value,
    quantity: quantity.value,
    subtypeId: selectedSubtypeId.value || null,
    timestamp: isoTimestamp
  }

  emit('submit', dto)
  emit('update:modelValue', false)
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <div
    v-if="modelValue"
    data-testid="backfill-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    role="dialog"
    aria-modal="true"
    aria-labelledby="backfill-title"
  >
    <div
      class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
    >
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock class="w-4 h-4" />
          </div>
          <div>
            <h2 id="backfill-title" class="text-base font-bold text-slate-900 dark:text-slate-100">
              Backfill Past Occurrence
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Record an event with a custom past timestamp
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close"
          class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          @click="handleClose"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body (Form) -->
      <form class="p-5 space-y-4 overflow-y-auto" @submit.prevent="handleSubmit">
        <!-- 1. Event Type Select -->
        <div class="space-y-1.5">
          <label
            for="backfill-event-type"
            class="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Event Type
          </label>
          <select
            id="backfill-event-type"
            v-model="selectedEventTypeId"
            data-testid="event-type-select"
            required
            class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option
              v-for="et in eventTypes"
              :key="et.id"
              :value="et.id"
            >
              {{ et.name }} ({{ et.basePoints > 0 ? `+${et.basePoints}` : et.basePoints }} pts / {{ et.defaultUnit }})
            </option>
          </select>
        </div>

        <!-- 2. Subtype Select (Conditional) -->
        <div v-if="availableSubtypes.length > 0" class="space-y-1.5">
          <label
            for="backfill-subtype"
            class="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Subtype (Optional)
          </label>
          <select
            id="backfill-subtype"
            v-model="selectedSubtypeId"
            data-testid="subtype-select"
            class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Default (No subtype)</option>
            <option
              v-for="sub in availableSubtypes"
              :key="sub.id"
              :value="sub.id"
            >
              {{ sub.name }}
              <template v-if="sub.pointOverride !== undefined && sub.pointOverride !== null">
                ({{ sub.pointOverride > 0 ? `+${sub.pointOverride}` : sub.pointOverride }} pts)
              </template>
            </option>
          </select>
        </div>

        <!-- 3. Quantity Stepper -->
        <div class="space-y-1.5">
          <label
            for="backfill-quantity"
            class="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Quantity ({{ selectedEventType?.defaultUnit || 'units' }})
          </label>
          <div class="flex items-center gap-2">
            <button
              type="button"
              aria-label="Decrease quantity"
              class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold transition-colors"
              @click="handleDecrement"
            >
              <Minus class="w-4 h-4" />
            </button>
            <input
              id="backfill-quantity"
              v-model.number="quantity"
              data-testid="quantity-input"
              type="number"
              min="0.1"
              step="any"
              required
              class="flex-1 px-3 py-2 text-center text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              aria-label="Increase quantity"
              class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold transition-colors"
              @click="handleIncrement"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 4. Custom Date & Time -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label
              for="backfill-datetime"
              class="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Date & Time
            </label>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                @click="handleSetQuickDate(0)"
              >
                Today
              </button>
              <button
                type="button"
                class="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                @click="handleSetQuickDate(1)"
              >
                Yesterday
              </button>
            </div>
          </div>
          <input
            id="backfill-datetime"
            v-model="datetimeLocal"
            data-testid="datetime-input"
            type="datetime-local"
            required
            class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- Calculated Point Summary Banner -->
        <div
          class="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60"
        >
          <span class="text-xs font-medium text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-indigo-500" />
            Estimated Points:
          </span>
          <span
            :class="[
              'text-xs font-bold px-2 py-0.5 rounded-full',
              calculatedPoints > 0
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : calculatedPoints < 0
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            ]"
          >
            {{ formattedCalculatedPoints }}
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            data-testid="cancel-btn"
            class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="submit-btn"
            class="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Log Occurrence
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
