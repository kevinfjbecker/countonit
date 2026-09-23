<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import * as icons from 'lucide-vue-next'
import { Activity, MoreHorizontal } from 'lucide-vue-next'
import type { EventType } from '@/types/domain'
import { getColorConfig } from '@/utils/colors'

interface Props {
  eventType: EventType
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'tap', eventType: EventType): void
  (e: 'custom-quantity', eventType: EventType): void
}>()

const isTapped = ref(false)
let tapTimer: ReturnType<typeof setTimeout> | null = null

// Long-press handling
let longPressTimer: ReturnType<typeof setTimeout> | null = null
const isLongPressTriggered = ref(false)
let startX = 0
let startY = 0

function handlePointerDown(e: PointerEvent) {
  startX = e.clientX
  startY = e.clientY
  isLongPressTriggered.value = false
  if (longPressTimer) clearTimeout(longPressTimer)
  longPressTimer = setTimeout(() => {
    isLongPressTriggered.value = true
    emit('custom-quantity', props.eventType)
  }, 500)
}

function handlePointerMove(e: PointerEvent) {
  if (!longPressTimer) return
  const dx = Math.abs(e.clientX - startX)
  const dy = Math.abs(e.clientY - startY)
  if (dx > 10 || dy > 10) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function handlePointerUp() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function handlePointerCancel() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const iconComponent = computed(() => {
  const iconName = props.eventType.icon
  if (iconName && iconName in icons) {
    return (icons as Record<string, any>)[iconName]
  }
  return Activity
})

const colorConfig = computed(() => {
  return getColorConfig(props.eventType.colorBadge)
})


const formattedPoints = computed(() => {
  const pts = props.eventType.basePoints
  if (pts > 0) return `+${pts} pts`
  return `${pts} pts`
})

const defaultUnitLabel = computed(() => {
  const inc = props.eventType.defaultIncrement ?? 1
  return `${inc} ${props.eventType.defaultUnit}`
})

function handleClick() {
  if (isLongPressTriggered.value) {
    isLongPressTriggered.value = false
    return
  }
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  isTapped.value = true
  if (tapTimer) clearTimeout(tapTimer)
  tapTimer = setTimeout(() => {
    isTapped.value = false
  }, 350)
  emit('tap', props.eventType)
}

function handleCustomQuantity(e: MouseEvent) {
  e.stopPropagation()
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  emit('custom-quantity', props.eventType)
}

onUnmounted(() => {
  if (tapTimer) clearTimeout(tapTimer)
  if (longPressTimer) clearTimeout(longPressTimer)
})
</script>

<template>
  <div class="group relative w-full h-full min-h-[140px] rounded-2xl">
    <button
      type="button"
      data-testid="event-card-main"
      :aria-label="`Log ${eventType.name} (${formattedPoints})`"
      :class="[
        'relative flex flex-col justify-between w-full h-full min-h-[140px] p-4 text-left rounded-2xl overflow-hidden',
        'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md',
        'active:scale-[0.97] active:shadow-inner transition-all duration-150 ease-out select-none touch-manipulation cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
        isTapped ? 'scale-95 ring-2 ring-indigo-500/60 dark:ring-indigo-400/60 shadow-inner' : '',
        colorConfig.cardBorderHover,
        colorConfig.activeRing
      ]"
      @click="handleClick"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerCancel"
      @contextmenu.prevent
    >
      <!-- Visual Tap Ripple / Glow Feedback -->
      <span
        v-if="isTapped"
        data-testid="tap-feedback"
        class="pointer-events-none absolute inset-0 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 animate-pulse transition-opacity duration-300"
      />

      <!-- Top Row: Icon & Point Badge -->
      <div class="flex items-start justify-between w-full gap-2 relative z-10">
        <div
          :class="[
            'w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95',
            isTapped ? 'scale-110' : '',
            colorConfig.iconBg
          ]"
        >
          <component :is="iconComponent" class="w-5 h-5" />
        </div>

        <div class="flex items-center gap-1.5 pr-7">
          <span
            :class="[
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border tracking-tight',
              colorConfig.pointBadge
            ]"
          >
            {{ formattedPoints }}
          </span>
        </div>
      </div>

      <!-- Bottom Row: Name & Default Unit/Increment -->
      <div class="mt-3 space-y-0.5 relative z-10">
        <div class="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
          {{ eventType.name }}
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
          {{ defaultUnitLabel }}
        </div>
      </div>
    </button>

    <!-- Dedicated "..." action menu trigger button -->
    <button
      type="button"
      :aria-label="`Custom quantity for ${eventType.name}`"
      data-testid="custom-quantity-button"
      class="absolute top-3.5 right-3.5 z-20 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      @click.stop="handleCustomQuantity"
      @pointerdown.stop
    >
      <MoreHorizontal class="w-4 h-4" />
    </button>
  </div>
</template>

