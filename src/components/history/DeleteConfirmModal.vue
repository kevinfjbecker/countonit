<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import type { Occurrence } from '@/types/domain'

interface Props {
  modelValue: boolean
  occurrence: Occurrence | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', occurrenceId: string): void
}>()

function handleConfirm() {
  if (props.occurrence) {
    emit('confirm', props.occurrence.id)
    emit('update:modelValue', false)
  }
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <div
    v-if="modelValue && occurrence"
    data-testid="delete-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-dialog-title"
  >
    <div
      class="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4"
    >
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div class="space-y-1 flex-1">
          <h2 id="delete-dialog-title" class="text-sm font-bold text-slate-900 dark:text-slate-100">
            Delete Occurrence?
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Are you sure you want to delete this recorded <span class="font-medium text-slate-700 dark:text-slate-300">{{ occurrence.snapshot.eventTypeName }}</span>? This will remove the occurrence and adjust your point totals.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-2">
        <button
          type="button"
          data-testid="delete-cancel-btn"
          class="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          @click="handleClose"
        >
          Cancel
        </button>
        <button
          type="button"
          data-testid="delete-confirm-btn"
          class="flex-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
          @click="handleConfirm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
