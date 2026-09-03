<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { CheckCircle2, RotateCcw, X } from 'lucide-vue-next'

interface Props {
  modelValue?: boolean
  occurrenceId?: string | null
  eventTypeName?: string
  points?: number
  durationMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  occurrenceId: null,
  eventTypeName: '',
  points: 0,
  durationMs: 5000
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'undo', occurrenceId: string): void
  (e: 'dismiss'): void
}>()

const remainingMs = ref(props.durationMs)
let timerId: ReturnType<typeof setInterval> | null = null
const TICK_INTERVAL = 50

const formattedPoints = computed(() => {
  if (props.points > 0) return `+${props.points} pts`
  return `${props.points} pts`
})

const progressPercent = computed(() => {
  if (props.durationMs <= 0) return 0
  return Math.max(0, Math.min(100, (remainingMs.value / props.durationMs) * 100))
})

function clearCountdown() {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}

function startCountdown() {
  clearCountdown()
  remainingMs.value = props.durationMs

  timerId = setInterval(() => {
    remainingMs.value -= TICK_INTERVAL
    if (remainingMs.value <= 0) {
      clearCountdown()
      closeToast()
    }
  }, TICK_INTERVAL)
}

function closeToast() {
  clearCountdown()
  emit('update:modelValue', false)
  emit('dismiss')
}

function handleUndo() {
  if (!props.occurrenceId) return
  const idToUndo = props.occurrenceId
  clearCountdown()
  emit('update:modelValue', false)
  emit('undo', idToUndo)
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      startCountdown()
    } else {
      clearCountdown()
    }
  },
  { immediate: true }
)

watch(
  () => props.occurrenceId,
  (newId) => {
    if (newId && props.modelValue) {
      startCountdown()
    }
  }
)

onUnmounted(() => {
  clearCountdown()
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform translate-y-4 opacity-0 scale-95"
    enter-to-class="transform translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform translate-y-4 opacity-0 scale-95"
  >
    <div
      v-if="modelValue"
      role="status"
      aria-live="polite"
      class="fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-40 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md border border-slate-700/60 shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
      data-testid="undo-toast"
    >
      <div class="px-4 py-3 flex items-center justify-between gap-3">
        <!-- Left: Status Icon & Message -->
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <div class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 class="w-4 h-4" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs text-slate-300 flex items-center gap-1.5 truncate">
              <span class="truncate">Logged <strong class="font-semibold text-white">{{ eventTypeName }}</strong></span>
              <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 dark:bg-slate-700 text-indigo-300 shrink-0">
                {{ formattedPoints }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Undo & Dismiss Buttons -->
        <div class="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            aria-label="Undo"
            data-testid="undo-btn"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            @click="handleUndo"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            type="button"
            aria-label="Dismiss"
            class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            @click="closeToast()"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Animated Countdown Progress Bar -->
      <div class="h-1 w-full bg-slate-800 dark:bg-slate-700/80 overflow-hidden">
        <div
          class="h-full bg-indigo-500 transition-[width] duration-75 ease-linear"
          :style="{ width: `${progressPercent}%` }"
          data-testid="toast-progress-bar"
        />
      </div>
    </div>
  </Transition>
</template>
