<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import * as icons from 'lucide-vue-next'
import {
  X,
  Check,
  Activity
} from 'lucide-vue-next'
import type { EventType, TaxonomyNode, ColorBadge, CreateEventTypeDto } from '@/types/domain'

interface Props {
  modelValue: boolean
  eventType?: EventType | null
  taxonomyNodes?: TaxonomyNode[]
}

const props = withDefaults(defineProps<Props>(), {
  eventType: null,
  taxonomyNodes: () => []
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: CreateEventTypeDto): void
}>()

// Curated list of event type icons
const AVAILABLE_ICONS = [
  { name: 'Droplet', label: 'Water' },
  { name: 'Coffee', label: 'Coffee' },
  { name: 'Dumbbell', label: 'Exercise' },
  { name: 'Sparkles', label: 'Hygiene' },
  { name: 'Scissors', label: 'Grooming' },
  { name: 'Footprints', label: 'Walk / Steps' },
  { name: 'Heart', label: 'Health' },
  { name: 'BookOpen', label: 'Reading' },
  { name: 'Bike', label: 'Cycling' },
  { name: 'Utensils', label: 'Food / Diet' },
  { name: 'Moon', label: 'Sleep / Rest' },
  { name: 'Check', label: 'Task' },
  { name: 'Activity', label: 'Activity' },
  { name: 'Flame', label: 'Streak / Burn' },
  { name: 'Zap', label: 'Energy' },
  { name: 'Smile', label: 'Mood' },
  { name: 'Target', label: 'Goal' },
  { name: 'Sun', label: 'Morning' },
  { name: 'Award', label: 'Achievement' }
]

const COLOR_OPTIONS: { badge: ColorBadge; label: string; bgClass: string; ringClass: string }[] = [
  { badge: 'emerald', label: 'Emerald', bgClass: 'bg-emerald-500', ringClass: 'ring-emerald-500' },
  { badge: 'amber', label: 'Amber', bgClass: 'bg-amber-500', ringClass: 'ring-amber-500' },
  { badge: 'sky', label: 'Sky', bgClass: 'bg-sky-500', ringClass: 'ring-sky-500' },
  { badge: 'rose', label: 'Rose', bgClass: 'bg-rose-500', ringClass: 'ring-rose-500' },
  { badge: 'violet', label: 'Violet', bgClass: 'bg-violet-500', ringClass: 'ring-violet-500' },
  { badge: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-500', ringClass: 'ring-indigo-500' },
  { badge: 'slate', label: 'Slate', bgClass: 'bg-slate-500', ringClass: 'ring-slate-500' }
]

// Form fields
const name = ref('')
const icon = ref('Activity')
const colorBadge = ref<ColorBadge>('emerald')
const basePoints = ref<number | ''>(1)
const defaultUnit = ref('times')
const defaultIncrement = ref<number>(1)
const targetFrequency = ref<number | null>(null)
const taxonomyNodeId = ref<string | null>(null)

// Validation errors
const errorMessage = ref('')

const isEditMode = computed(() => !!props.eventType)

function resetForm() {
  if (props.eventType) {
    name.value = props.eventType.name || ''
    icon.value = props.eventType.icon || 'Activity'
    colorBadge.value = props.eventType.colorBadge || 'emerald'
    basePoints.value = props.eventType.basePoints ?? 1
    defaultUnit.value = props.eventType.defaultUnit || 'times'
    defaultIncrement.value = props.eventType.defaultIncrement ?? 1
    targetFrequency.value = props.eventType.targetFrequency ?? null
    taxonomyNodeId.value = props.eventType.taxonomyNodeId ?? null
  } else {
    name.value = ''
    icon.value = 'Activity'
    colorBadge.value = 'emerald'
    basePoints.value = 1
    defaultUnit.value = 'times'
    defaultIncrement.value = 1
    targetFrequency.value = null
    taxonomyNodeId.value = null
  }
  errorMessage.value = ''
}

watch(
  [() => props.eventType, () => props.modelValue],
  ([, isOpen]) => {
    if (isOpen) {
      resetForm()
    }
  },
  { immediate: true }
)

function getIconComponent(iconName: string) {
  if (iconName && iconName in icons) {
    return (icons as Record<string, any>)[iconName]
  }
  return Activity
}

const selectedIconComponent = computed(() => getIconComponent(icon.value))

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  const trimmedName = name.value.trim()
  if (!trimmedName) {
    errorMessage.value = 'Name is required'
    return
  }

  if (basePoints.value === '' || !Number.isInteger(Number(basePoints.value))) {
    errorMessage.value = 'Base points must be a valid integer'
    return
  }

  errorMessage.value = ''

  emit('save', {
    name: trimmedName,
    icon: icon.value,
    colorBadge: colorBadge.value,
    basePoints: Number(basePoints.value),
    defaultUnit: defaultUnit.value.trim() || 'times',
    defaultIncrement: defaultIncrement.value ? Math.max(1, Math.round(Number(defaultIncrement.value))) : 1,
    targetFrequency: targetFrequency.value ? Math.max(1, Math.round(Number(targetFrequency.value))) : null,
    taxonomyNodeId: taxonomyNodeId.value || null
  })

  emit('update:modelValue', false)
}
</script>

<template>
  <div
    v-if="modelValue"
    data-testid="editor-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="editor-modal-title"
  >
    <div
      class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] my-auto"
    >
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center text-white',
              COLOR_OPTIONS.find(c => c.badge === colorBadge)?.bgClass || 'bg-emerald-500'
            ]"
          >
            <component :is="selectedIconComponent" class="w-4 h-4" />
          </div>
          <div>
            <h2 id="editor-modal-title" class="text-base font-bold text-slate-900 dark:text-slate-100">
              {{ isEditMode ? `Edit ${eventType?.name}` : 'New Event Type' }}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Configure name, icon, points, and taxonomy
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
        <!-- Error Banner -->
        <div
          v-if="errorMessage"
          class="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300"
        >
          {{ errorMessage }}
        </div>

        <!-- 1. Name Field -->
        <div class="space-y-1.5">
          <label for="event-type-name" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Name <span class="text-rose-500">*</span>
          </label>
          <input
            id="event-type-name"
            v-model="name"
            data-testid="event-type-name-input"
            type="text"
            placeholder="e.g. Glass of Water, Morning Run"
            class="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- 2. Color Theme Selector -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Color Badge
          </label>
          <div class="flex items-center gap-2 flex-wrap">
            <button
              v-for="color in COLOR_OPTIONS"
              :key="color.badge"
              type="button"
              :data-testid="`color-badge-${color.badge}`"
              :aria-label="`Color ${color.label}`"
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                color.bgClass,
                colorBadge === color.badge
                  ? 'ring-3 ring-offset-2 dark:ring-offset-slate-900 ' + color.ringClass + ' scale-110'
                  : 'opacity-70 hover:opacity-100'
              ]"
              @click="colorBadge = color.badge"
            >
              <Check v-if="colorBadge === color.badge" class="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <!-- 3. Icon Picker Grid -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Icon
          </label>
          <div class="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl max-h-36 overflow-y-auto">
            <button
              v-for="item in AVAILABLE_ICONS"
              :key="item.name"
              type="button"
              :title="item.label"
              :aria-label="item.label"
              :class="[
                'p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer',
                icon === item.name
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              ]"
              @click="icon = item.name"
            >
              <component :is="getIconComponent(item.name)" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- 4. Points & Units Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label for="event-type-points" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Base Points
            </label>
            <input
              id="event-type-points"
              v-model.number="basePoints"
              data-testid="event-type-points-input"
              type="number"
              step="1"
              placeholder="e.g. 5 or -2"
              class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p class="text-[10px] text-slate-400">Positive or negative integer</p>
          </div>

          <div class="space-y-1.5">
            <label for="event-type-unit" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Default Unit
            </label>
            <input
              id="event-type-unit"
              v-model="defaultUnit"
              data-testid="event-type-unit-input"
              type="text"
              placeholder="glass, cup, set, times"
              class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p class="text-[10px] text-slate-400">e.g. glass, set, session</p>
          </div>
        </div>

        <!-- 5. Default Increment & Target Frequency -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label for="event-type-increment" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Default Increment
            </label>
            <input
              id="event-type-increment"
              v-model.number="defaultIncrement"
              data-testid="event-type-increment-input"
              type="number"
              min="1"
              step="1"
              placeholder="1"
              class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p class="text-[10px] text-slate-400">Added on single tap</p>
          </div>

          <div class="space-y-1.5">
            <label for="event-type-frequency" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Daily Goal Frequency
            </label>
            <input
              id="event-type-frequency"
              v-model.number="targetFrequency"
              data-testid="event-type-frequency-input"
              type="number"
              min="1"
              step="1"
              placeholder="Optional (e.g. 8)"
              class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p class="text-[10px] text-slate-400">Daily goal for streaks</p>
          </div>
        </div>

        <!-- 6. Taxonomy Node Dropdown -->
        <div class="space-y-1.5">
          <label for="event-type-taxonomy" class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Taxonomy Node (Optional)
          </label>
          <select
            id="event-type-taxonomy"
            v-model="taxonomyNodeId"
            data-testid="event-type-taxonomy-select"
            class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option :value="null">None (Unassigned)</option>
            <option
              v-for="node in taxonomyNodes"
              :key="node.id"
              :value="node.id"
            >
              {{ node.name }}
            </option>
          </select>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2.5 pt-3">
          <button
            type="button"
            data-testid="editor-cancel-btn"
            class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="editor-save-btn"
            class="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            {{ isEditMode ? 'Save Changes' : 'Create Event Type' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
