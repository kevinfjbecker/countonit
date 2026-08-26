import { defineStore } from 'pinia'
import type {
  EventType,
  TaxonomyNode,
  Occurrence,
  Goal,
  Streak,
  AppSettings,
  CreateEventTypeDto,
  UpdateEventTypeDto,
  CreateTaxonomyNodeDto,
  UpdateTaxonomyNodeDto,
  LogOccurrenceDto,
  UpdateOccurrenceDto
} from '@/types/domain'
import type { StorageAdapter, AppStatePayload } from '@/types/storage'
import { STORAGE_KEY_APP_STATE, createDefaultStorageAdapter } from '@/storage'
import { buildStarterSeed } from './seed'

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now()
}

export function getLocalDateString(isoOrDate: string | Date = new Date()): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export interface TrackerState {
  eventTypes: EventType[]
  taxonomyNodes: TaxonomyNode[]
  occurrences: Occurrence[]
  goals: Goal[]
  settings: AppSettings
  isInitialized: boolean
}

let activeStorageAdapter: StorageAdapter | null = null

export const useTrackerStore = defineStore('tracker', {
  state: (): TrackerState => ({
    eventTypes: [],
    taxonomyNodes: [],
    occurrences: [],
    goals: [
      {
        id: 'default-daily-goal',
        type: 'daily_points',
        targetValue: 50,
        celebrationEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    settings: {
      theme: 'system',
      hapticsEnabled: true,
      confettiEnabled: true
    },
    isInitialized: false
  }),

  getters: {
    activeEventTypes: (state): EventType[] => {
      return state.eventTypes
        .filter(e => !e.archived)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    },

    archivedEventTypes: (state): EventType[] => {
      return state.eventTypes.filter(e => e.archived)
    },

    getEventTypeById: (state) => {
      return (id: string): EventType | undefined => {
        return state.eventTypes.find(e => e.id === id)
      }
    },

    getTaxonomyNodeById: (state) => {
      return (id: string): TaxonomyNode | undefined => {
        return state.taxonomyNodes.find(t => t.id === id)
      }
    },

    getTaxonomyPath: (state) => {
      return (nodeId?: string | null): string => {
        if (!nodeId) return ''
        const segments: string[] = []
        let currentId: string | null | undefined = nodeId
        const visited = new Set<string>()

        while (currentId && !visited.has(currentId)) {
          visited.add(currentId)
          const node = state.taxonomyNodes.find(n => n.id === currentId)
          if (!node) break
          segments.unshift(node.name)
          currentId = node.parentId
        }

        return segments.join(' > ')
      }
    },

    todayOccurrences: (state): Occurrence[] => {
      const todayStr = getLocalDateString(new Date())
      return state.occurrences.filter(
        occ => getLocalDateString(occ.timestamp) === todayStr
      )
    },

    todayPoints(): number {
      return this.todayOccurrences.reduce(
        (sum, occ) => sum + (occ.snapshot.calculatedPoints || 0),
        0
      )
    },

    dailyPointGoal(): Goal | undefined {
      return this.goals.find(g => g.type === 'daily_points')
    },

    dailyPointGoalValue(): number {
      return this.dailyPointGoal?.targetValue ?? 50
    },

    calculateStreak: (state) => {
      return (eventTypeId: string): Streak => {
        const eventType = state.eventTypes.find(e => e.id === eventTypeId)
        const target = eventType?.targetFrequency ?? 1

        // Filter occurrences for this event type
        const typeOccurrences = state.occurrences.filter(
          o => o.eventTypeId === eventTypeId
        )

        // Group quantity/count by local date YYYY-MM-DD
        const countByDate = new Map<string, number>()
        for (const occ of typeOccurrences) {
          const dateStr = getLocalDateString(occ.timestamp)
          const current = countByDate.get(dateStr) ?? 0
          countByDate.set(dateStr, current + occ.quantity)
        }

        // Qualifying dates where quantity >= target
        const qualifyingDates = new Set<string>()
        for (const [dateStr, count] of countByDate.entries()) {
          if (count >= target) {
            qualifyingDates.add(dateStr)
          }
        }

        const todayStr = getLocalDateString(new Date())
        const isActiveToday = qualifyingDates.has(todayStr)

        // Calculate consecutive streak working backward from today or yesterday
        let currentStreak = 0
        const checkDate = new Date()
        let checkStr = getLocalDateString(checkDate)

        if (qualifyingDates.has(checkStr)) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
          checkStr = getLocalDateString(checkDate)
        } else {
          // If not achieved today, check if yesterday was achieved
          checkDate.setDate(checkDate.getDate() - 1)
          checkStr = getLocalDateString(checkDate)
        }

        while (qualifyingDates.has(checkStr)) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
          checkStr = getLocalDateString(checkDate)
        }

        // Longest streak calculation across all historical dates
        const sortedDates = Array.from(qualifyingDates).sort()
        let longestStreak = 0
        let tempStreak = 0
        let prevDate: Date | null = null

        for (const dateStr of sortedDates) {
          const currentDate = new Date(dateStr)
          if (prevDate) {
            const diffDays = Math.round(
              (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            if (diffDays === 1) {
              tempStreak++
            } else if (diffDays > 1) {
              tempStreak = 1
            }
          } else {
            tempStreak = 1
          }
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak
          }
          prevDate = currentDate
        }

        const lastAchievedDate =
          sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null

        return {
          eventTypeId,
          currentStreak,
          longestStreak: Math.max(longestStreak, currentStreak),
          lastAchievedDate,
          isActiveToday
        }
      }
    }
  },

  actions: {
    async initialize(adapter?: StorageAdapter): Promise<void> {
      activeStorageAdapter = adapter || createDefaultStorageAdapter()
      const saved = await activeStorageAdapter.getItem<AppStatePayload>(
        STORAGE_KEY_APP_STATE
      )

      if (saved) {
        this.eventTypes = saved.eventTypes || []
        this.taxonomyNodes = saved.taxonomyNodes || []
        this.occurrences = saved.occurrences || []
        this.goals = saved.goals || this.goals
        this.settings = saved.settings || this.settings
      } else {
        // First run: no data in storage — load the starter seed (spec §"Starter Seed Data")
        const seed = buildStarterSeed()
        this.eventTypes = seed.eventTypes
        this.taxonomyNodes = seed.taxonomyNodes
        this.occurrences = seed.occurrences
        this.goals = seed.goals
        this.settings = seed.settings
        await this.saveToStorage()
      }

      this.isInitialized = true
    },

    async saveToStorage(): Promise<void> {
      if (!activeStorageAdapter) {
        activeStorageAdapter = createDefaultStorageAdapter()
      }

      const payload: AppStatePayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        eventTypes: this.eventTypes,
        taxonomyNodes: this.taxonomyNodes,
        occurrences: this.occurrences,
        goals: this.goals,
        settings: this.settings
      }

      await activeStorageAdapter.setItem(STORAGE_KEY_APP_STATE, payload)
    },

    async addEventType(dto: CreateEventTypeDto): Promise<EventType> {
      const now = new Date().toISOString()
      const eventType: EventType = {
        id: generateId(),
        name: dto.name,
        icon: dto.icon,
        colorBadge: dto.colorBadge,
        basePoints: dto.basePoints,
        defaultUnit: dto.defaultUnit,
        defaultIncrement: dto.defaultIncrement ?? 1,
        targetFrequency: dto.targetFrequency ?? null,
        taxonomyNodeId: dto.taxonomyNodeId ?? null,
        subtypes: dto.subtypes || [],
        archived: false,
        sortOrder: dto.sortOrder ?? this.eventTypes.length,
        createdAt: now,
        updatedAt: now
      }

      this.eventTypes.push(eventType)
      await this.saveToStorage()
      return eventType
    },

    async updateEventType(id: string, dto: UpdateEventTypeDto): Promise<EventType | null> {
      const index = this.eventTypes.findIndex(e => e.id === id)
      if (index === -1) return null

      const current = this.eventTypes[index]
      const updated: EventType = {
        ...current,
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.colorBadge !== undefined && { colorBadge: dto.colorBadge }),
        ...(dto.basePoints !== undefined && { basePoints: dto.basePoints }),
        ...(dto.defaultUnit !== undefined && { defaultUnit: dto.defaultUnit }),
        ...(dto.defaultIncrement !== undefined && { defaultIncrement: dto.defaultIncrement }),
        ...(dto.targetFrequency !== undefined && { targetFrequency: dto.targetFrequency }),
        ...(dto.taxonomyNodeId !== undefined && { taxonomyNodeId: dto.taxonomyNodeId }),
        ...(dto.subtypes !== undefined && { subtypes: dto.subtypes }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        updatedAt: new Date().toISOString()
      }

      this.eventTypes[index] = updated
      await this.saveToStorage()
      return updated
    },

    async archiveEventType(id: string): Promise<void> {
      const eventType = this.eventTypes.find(e => e.id === id)
      if (eventType) {
        eventType.archived = true
        eventType.updatedAt = new Date().toISOString()
        await this.saveToStorage()
      }
    },

    async unarchiveEventType(id: string): Promise<void> {
      const eventType = this.eventTypes.find(e => e.id === id)
      if (eventType) {
        eventType.archived = false
        eventType.updatedAt = new Date().toISOString()
        await this.saveToStorage()
      }
    },

    async deleteEventType(id: string): Promise<void> {
      const hasOccurrences = this.occurrences.some(o => o.eventTypeId === id)
      if (hasOccurrences) {
        // ADR 0002: Soft-archive if linked occurrences exist
        await this.archiveEventType(id)
      } else {
        // Hard-delete if no linked occurrences exist
        this.eventTypes = this.eventTypes.filter(e => e.id !== id)
        await this.saveToStorage()
      }
    },

    async reorderEventTypes(orderedIds: string[]): Promise<void> {
      const idOrderMap = new Map<string, number>()
      orderedIds.forEach((id, index) => {
        idOrderMap.set(id, index)
      })

      for (const eventType of this.eventTypes) {
        if (idOrderMap.has(eventType.id)) {
          eventType.sortOrder = idOrderMap.get(eventType.id)
        }
      }

      await this.saveToStorage()
    },

    async addTaxonomyNode(dto: CreateTaxonomyNodeDto): Promise<TaxonomyNode> {
      const now = new Date().toISOString()
      const node: TaxonomyNode = {
        id: generateId(),
        name: dto.name,
        parentId: dto.parentId ?? null,
        color: dto.color ?? null,
        createdAt: now,
        updatedAt: now
      }

      this.taxonomyNodes.push(node)
      await this.saveToStorage()
      return node
    },

    async updateTaxonomyNode(
      id: string,
      dto: UpdateTaxonomyNodeDto
    ): Promise<TaxonomyNode | null> {
      const index = this.taxonomyNodes.findIndex(t => t.id === id)
      if (index === -1) return null

      const current = this.taxonomyNodes[index]
      const updated: TaxonomyNode = {
        ...current,
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.color !== undefined && { color: dto.color }),
        updatedAt: new Date().toISOString()
      }

      this.taxonomyNodes[index] = updated
      await this.saveToStorage()
      return updated
    },

    async deleteTaxonomyNode(id: string): Promise<void> {
      // 1. Unassign taxonomyNodeId from linked event types
      for (const eventType of this.eventTypes) {
        if (eventType.taxonomyNodeId === id) {
          eventType.taxonomyNodeId = null
          eventType.updatedAt = new Date().toISOString()
        }
      }

      // 2. Reparent direct children to null
      for (const node of this.taxonomyNodes) {
        if (node.parentId === id) {
          node.parentId = null
          node.updatedAt = new Date().toISOString()
        }
      }

      // 3. Remove node
      this.taxonomyNodes = this.taxonomyNodes.filter(t => t.id !== id)
      await this.saveToStorage()
    },

    async logOccurrence(dto: LogOccurrenceDto): Promise<Occurrence | null> {
      const eventType = this.getEventTypeById(dto.eventTypeId)
      if (!eventType) return null

      const now = new Date().toISOString()
      const timestamp = dto.timestamp || now

      let subtypeName: string | null = null
      let basePoints = eventType.basePoints
      let quantity = dto.quantity ?? eventType.defaultIncrement ?? 1

      if (dto.subtypeId && eventType.subtypes) {
        const subtype = eventType.subtypes.find(s => s.id === dto.subtypeId)
        if (subtype) {
          subtypeName = subtype.name
          if (subtype.pointOverride !== undefined && subtype.pointOverride !== null) {
            basePoints = subtype.pointOverride
          }
          if (dto.quantity === undefined && subtype.quantityOverride !== undefined && subtype.quantityOverride !== null) {
            quantity = subtype.quantityOverride
          }
        }
      }

      const calculatedPoints = basePoints * quantity

      const occurrence: Occurrence = {
        id: generateId(),
        eventTypeId: eventType.id,
        timestamp,
        quantity,
        subtypeId: dto.subtypeId ?? null,
        subtypeName,
        snapshot: {
          eventTypeName: eventType.name,
          unit: eventType.defaultUnit,
          basePoints,
          calculatedPoints,
          taxonomyNodeId: eventType.taxonomyNodeId ?? null
        },
        createdAt: now
      }

      this.occurrences.unshift(occurrence)
      await this.saveToStorage()
      return occurrence
    },

    async undoOccurrence(occurrenceId: string): Promise<void> {
      this.occurrences = this.occurrences.filter(o => o.id !== occurrenceId)
      await this.saveToStorage()
    },

    async updateOccurrence(
      id: string,
      dto: UpdateOccurrenceDto
    ): Promise<Occurrence | null> {
      const index = this.occurrences.findIndex(o => o.id === id)
      if (index === -1) return null

      const current = this.occurrences[index]
      const quantity = dto.quantity !== undefined ? dto.quantity : current.quantity
      const timestamp = dto.timestamp !== undefined ? dto.timestamp : current.timestamp

      const calculatedPoints = current.snapshot.basePoints * quantity

      const updated: Occurrence = {
        ...current,
        quantity,
        timestamp,
        snapshot: {
          ...current.snapshot,
          calculatedPoints
        }
      }

      this.occurrences[index] = updated
      await this.saveToStorage()
      return updated
    },

    async setDailyPointGoal(targetValue: number): Promise<void> {
      const now = new Date().toISOString()
      const existing = this.goals.find(g => g.type === 'daily_points')
      if (existing) {
        existing.targetValue = targetValue
        existing.updatedAt = now
      } else {
        this.goals.push({
          id: generateId(),
          type: 'daily_points',
          targetValue,
          celebrationEnabled: true,
          createdAt: now,
          updatedAt: now
        })
      }
      await this.saveToStorage()
    },

    exportState(): AppStatePayload {
      return {
        version: 1,
        exportedAt: new Date().toISOString(),
        eventTypes: JSON.parse(JSON.stringify(this.eventTypes)),
        taxonomyNodes: JSON.parse(JSON.stringify(this.taxonomyNodes)),
        occurrences: JSON.parse(JSON.stringify(this.occurrences)),
        goals: JSON.parse(JSON.stringify(this.goals)),
        settings: JSON.parse(JSON.stringify(this.settings))
      }
    },

    async importState(payload: AppStatePayload): Promise<void> {
      if (!payload || payload.version !== 1) {
        throw new Error('Invalid or unsupported state payload version')
      }

      this.eventTypes = payload.eventTypes || []
      this.taxonomyNodes = payload.taxonomyNodes || []
      this.occurrences = payload.occurrences || []
      this.goals = payload.goals || []
      this.settings = payload.settings || { theme: 'system' }

      await this.saveToStorage()
    },

    async resetState(): Promise<void> {
      this.eventTypes = []
      this.taxonomyNodes = []
      this.occurrences = []
      this.goals = [
        {
          id: generateId(),
          type: 'daily_points',
          targetValue: 50,
          celebrationEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      this.settings = { theme: 'system', hapticsEnabled: true, confettiEnabled: true }

      await this.saveToStorage()
    }
  }
})
