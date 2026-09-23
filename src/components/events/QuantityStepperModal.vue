<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import * as icons from 'lucide-vue-next'
import { Activity, X, Plus, Minus, Sparkles } from 'lucide-vue-next'
import type { EventType, ColorBadge } from '@/types/domain'

interface Props {
  modelValue: boolean
  eventType: EventType | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', payload: { eventType: EventType; quantity: number }): void
}>()

const quantity = ref<number>(1)

const COLOR_CONFIGS: Record<
  ColorBadge,
  {
    iconBg: string
    pointBadge: string
  }
> = {
  emerald: {
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400',
    pointBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/50'
  },
  amber: {
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400',
    pointBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50'
  },
  sky: {
    iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400',
    pointBadge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/50'
  },
  rose: {
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400',
    pointBadge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/50'
  },
  violet: {
    iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-950/70 dark:text-violet-400',
    pointBadge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/50'
  },
  indigo: {
    iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400',
    pointBadge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/50'
  },
  slate: {
    iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    pointBadge: 'bg-slate-50 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

const iconComponent = computed(() => {
  const iconName = props.eventType?.icon
  if (iconName && iconName in icons) {
    return (icons as Record<string, any>)[iconName]
  }
  return Activity
})

const colorConfig = computed(() => {
  const badge: ColorBadge = props.eventType?.colorBadge || 'slate'
  return COLOR_CONFIGS[badge] || COLOR_CONFIGS.slate
})

watch(
  () => props.eventType,
  (newVal) => {
    if (newVal) {
      quantity.value = newVal.defaultIncrement ?? 1
    }
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.eventType) {
      quantity.value = props.eventType.defaultIncrement ?? 1
    }
  }
)

const calculatedPoints = computed(() => {
  if (!props.eventType) return 0
  const qty = typeof quantity.value === 'number' && !isNaN(quantity.value) ? quantity.value : 0
  return props.eventType.basePoints * qty
})

const formattedCalculatedPoints = computed(() => {
  const pts = calculatedPoints.value
  if (pts > 0) return `+${pts} pts`
  return `${pts} pts`
})

const submitButtonText = computed(() => {
  if (!props.eventType) return 'Log'
  const unit = props.eventType.defaultUnit || 'units'
  return `Log ${quantity.value} ${unit} (${formattedCalculatedPoints.value})`
})

function handleIncrement() {
  const inc = props.eventType?.defaultIncrement ?? 1
  const current = typeof quantity.value === 'number' && !isNaN(quantity.value) ? quantity.value : 0
  quantity.value = Number((current + inc).toFixed(2))
}

function handleDecrement() {
  const inc = props.eventType?.defaultIncrement ?? 1
  const current = typeof quantity.value === 'number' && !isNaN(quantity.value) ? quantity.value : 0
  const next = Number((current - inc).toFixed(2))
  if (next > 0) {
    quantity.value = next
  }
}

function handleAddPreset(amount: number) {
  const current = typeof quantity.value === 'number' && !isNaN(quantity.value) ? quantity.value : 0
  quantity.value = Number((current + amount).toFixed(2))
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!props.eventType) return
  const validQuantity = typeof quantity.value === 'number' && !isNaN(quantity.value) && quantity.value > 0
    ? quantity.value
    : (props.eventType.defaultIncrement ?? 1)

  emit('submit', {
    eventType: props.eventType,
    quantity: validQuantity
  })
  emit('update:modelValue', false)
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <div
    v-if="modelValue && eventType"
    data-testid="quantity-modal"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    role="dialog"
    aria-modal="true"
    aria-labelledby="quantity-sheet-title"
    @click="handleBackdropClick"
    @keydown.esc="handleClose"
  >
    <div
      class="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-all"
    >
      <!-- Mobile Drag Indicator -->
      <div class="pt-3 pb-1 flex justify-center sm:hidden">
        <div class="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
      </div>

      <!-- Header: Event Type Details & Close Button -->
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center',
              colorConfig.iconBg
            ]"
          >
            <component :is="iconComponent" class="w-5 h-5" />
          </div>
          <div>
            <h2 id="quantity-sheet-title" class="text-base font-bold text-slate-900 dark:text-slate-100">
              {{ eventType.name }}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ eventType.basePoints > 0 ? `+${eventType.basePoints}` : eventType.basePoints }} pts / {{ eventType.defaultUnit }}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close"
          data-testid="quantity-modal-close"
          class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          @click="handleClose"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body: Stepper Controls & Recalculated Points -->
      <form class="p-5 space-y-5 overflow-y-auto" @submit.prevent="handleSubmit">
        <!-- Quantity Stepper Control -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <label for="quantity-input">Quantity ({{ eventType.defaultUnit }})</label>
            <span class="text-slate-500 dark:text-slate-400">Step: ±{{ eventType.defaultIncrement ?? 1 }}</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              aria-label="Decrease quantity"
              data-testid="quantity-decrement-btn"
              class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold transition-colors cursor-pointer active:scale-95"
              @click="handleDecrement"
            >
              <Minus class="w-5 h-5" />
            </button>

            <input
              id="quantity-input"
              v-model.number="quantity"
              data-testid="quantity-input"
              type="number"
              min="0.1"
              step="any"
              required
              class="flex-1 h-12 px-3 text-center text-lg font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="button"
              aria-label="Increase quantity"
              data-testid="quantity-increment-btn"
              class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold transition-colors cursor-pointer active:scale-95"
              @click="handleIncrement"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>

          <!-- Quick Increment Presets -->
          <div class="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              class="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              @click="handleAddPreset(1)"
            >
              +1
            </button>
            <button
              type="button"
              class="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              @click="handleAddPreset(5)"
            >
              +5
            </button>
            <button
              type="button"
              class="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              @click="handleAddPreset(10)"
            >
              +10
            </button>
          </div>
        </div>

        <!-- Calculated Points Live Preview Box -->
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span>Calculated Points</span>
          </div>
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold border tracking-tight',
              colorConfig.pointBadge
            ]"
            data-testid="calculated-points-badge"
          >
            {{ formattedCalculatedPoints }}
          </span>
        </div>

        <!-- Submit Confirmation Button -->
        <button
          type="submit"
          data-testid="quantity-submit-button"
          class="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{{ submitButtonText }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
