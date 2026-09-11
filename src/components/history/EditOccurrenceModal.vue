<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Pencil, Plus, Minus, Sparkles } from 'lucide-vue-next'
import type { Occurrence } from '@/types/domain'
import { formatDateTimeForInput } from '@/utils/formatters'

interface Props {
  modelValue: boolean
  occurrence: Occurrence | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: { id: string; quantity: number; timestamp: string }): void
}>()

const quantity = ref<number>(1)
const datetimeLocal = ref<string>(formatDateTimeForInput())

watch(
  () => props.occurrence,
  (occ) => {
    if (occ) {
      quantity.value = occ.quantity
      try {
        datetimeLocal.value = formatDateTimeForInput(new Date(occ.timestamp))
      } catch {
        datetimeLocal.value = formatDateTimeForInput()
      }
    }
  },
  { immediate: true }
)

const basePoints = computed(() => {
  return props.occurrence?.snapshot.basePoints ?? 0
})

const calculatedPoints = computed(() => {
  return basePoints.value * (quantity.value || 0)
})

const formattedCalculatedPoints = computed(() => {
  const pts = calculatedPoints.value
  if (pts > 0) return `+${pts} pts`
  return `${pts} pts`
})

function handleIncrement() {
  quantity.value = Math.max(1, (quantity.value || 0) + 1)
}

function handleDecrement() {
  quantity.value = Math.max(1, (quantity.value || 0) - 1)
}

function handleSave() {
  if (!props.occurrence) return

  const isoTimestamp = new Date(datetimeLocal.value).toISOString()

  emit('save', {
    id: props.occurrence.id,
    quantity: quantity.value,
    timestamp: isoTimestamp
  })

  emit('update:modelValue', false)
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <div
    v-if="modelValue && occurrence"
    data-testid="edit-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    role="dialog"
    aria-modal="true"
    aria-labelledby="edit-occurrence-title"
  >
    <div
      class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
    >
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Pencil class="w-4 h-4" />
          </div>
          <div>
            <h2 id="edit-occurrence-title" class="text-base font-bold text-slate-900 dark:text-slate-100">
              Edit {{ occurrence.snapshot.eventTypeName }}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Adjust quantity or timestamp of this occurrence
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
      <form class="p-5 space-y-4 overflow-y-auto" @submit.prevent="handleSave">
        <!-- 1. Quantity Stepper -->
        <div class="space-y-1.5">
          <label
            for="edit-quantity"
            class="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Quantity ({{ occurrence.snapshot.unit || 'units' }})
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
              id="edit-quantity"
              v-model.number="quantity"
              data-testid="edit-quantity-input"
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

        <!-- 2. Timestamp Picker -->
        <div class="space-y-1.5">
          <label
            for="edit-datetime"
            class="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Date & Time
          </label>
          <input
            id="edit-datetime"
            v-model="datetimeLocal"
            data-testid="edit-datetime-input"
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
            Updated Points:
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
            data-testid="edit-cancel-btn"
            class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="edit-save-btn"
            class="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
