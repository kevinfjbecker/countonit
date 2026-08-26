/**
 * Domain Models for Count On It
 * Strict alignment with CONTEXT.md and ADRs:
 * - ADR 0001: Local-First Client Storage
 * - ADR 0002: Immutable Occurrence Snapshots and Soft-Archiving
 * - ADR 0003: Hierarchical Taxonomy Model with Stable Node IDs
 */

export type ColorBadge =
  | 'emerald'
  | 'amber'
  | 'sky'
  | 'rose'
  | 'violet'
  | 'indigo'
  | 'slate'

export interface Subtype {
  id: string
  name: string
  pointOverride?: number | null
  quantityOverride?: number | null
}

export interface EventType {
  id: string
  name: string
  icon: string
  colorBadge: ColorBadge
  basePoints: number
  defaultUnit: string
  defaultIncrement: number
  targetFrequency?: number | null
  taxonomyNodeId?: string | null
  subtypes?: Subtype[]
  archived?: boolean
  sortOrder?: number
  createdAt: string
  updatedAt: string
}

export interface TaxonomyNode {
  id: string
  name: string
  parentId?: string | null
  color?: ColorBadge | null
  createdAt: string
  updatedAt: string
}

export interface OccurrenceSnapshot {
  eventTypeName: string
  unit: string
  basePoints: number
  calculatedPoints: number
  taxonomyNodeId?: string | null
}

export interface Occurrence {
  id: string
  eventTypeId: string
  timestamp: string // ISO date string in local timezone
  quantity: number
  subtypeId?: string | null
  subtypeName?: string | null
  snapshot: OccurrenceSnapshot
  createdAt: string
}

export type GoalType = 'daily_points' | 'event_frequency'

export interface Goal {
  id: string
  type: GoalType
  targetValue: number
  eventTypeId?: string | null
  celebrationEnabled?: boolean
  createdAt: string
  updatedAt: string
}

export interface Streak {
  eventTypeId: string
  currentStreak: number
  longestStreak: number
  lastAchievedDate?: string | null // YYYY-MM-DD
  isActiveToday: boolean
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark'
  hapticsEnabled?: boolean
  confettiEnabled?: boolean
}

// Data Transfer Objects (DTOs) for mutations
export interface CreateEventTypeDto {
  name: string
  icon: string
  colorBadge: ColorBadge
  basePoints: number
  defaultUnit: string
  defaultIncrement?: number
  targetFrequency?: number | null
  taxonomyNodeId?: string | null
  subtypes?: Subtype[]
  sortOrder?: number
}

export interface UpdateEventTypeDto {
  name?: string
  icon?: string
  colorBadge?: ColorBadge
  basePoints?: number
  defaultUnit?: string
  defaultIncrement?: number
  targetFrequency?: number | null
  taxonomyNodeId?: string | null
  subtypes?: Subtype[]
  sortOrder?: number
}

export interface CreateTaxonomyNodeDto {
  name: string
  parentId?: string | null
  color?: ColorBadge | null
}

export interface UpdateTaxonomyNodeDto {
  name?: string
  parentId?: string | null
  color?: ColorBadge | null
}

export interface LogOccurrenceDto {
  eventTypeId: string
  quantity?: number
  subtypeId?: string | null
  timestamp?: string // ISO timestamp, defaults to now
}

export interface UpdateOccurrenceDto {
  quantity?: number
  timestamp?: string
}
