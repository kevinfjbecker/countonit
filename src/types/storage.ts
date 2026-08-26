import type { EventType, TaxonomyNode, Occurrence, Goal, AppSettings } from './domain'

export interface StorageAdapter {
  getItem<T>(key: string): Promise<T | null>
  setItem<T>(key: string, value: T): Promise<void>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

export interface AppStatePayload {
  version: 1
  exportedAt: string
  eventTypes: EventType[]
  taxonomyNodes: TaxonomyNode[]
  occurrences: Occurrence[]
  goals: Goal[]
  settings: AppSettings
}
