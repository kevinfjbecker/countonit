import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTrackerStore } from '../tracker'
import { InMemoryStorageAdapter } from '@/storage/InMemoryStorageAdapter'
import { STORAGE_KEY_APP_STATE } from '@/storage/StorageAdapter'
import type { AppStatePayload } from '@/types/storage'

describe('useTrackerStore', () => {
  let inMemoryAdapter: InMemoryStorageAdapter

  beforeEach(() => {
    setActivePinia(createPinia())
    inMemoryAdapter = new InMemoryStorageAdapter()
  })

  it('initializes with starter seed data when storage is blank (first run)', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    expect(store.isInitialized).toBe(true)
    expect(store.activeEventTypes.length).toBeGreaterThan(0) // Seeded starter event types
    expect(store.taxonomyNodes.length).toBeGreaterThan(0)   // Seeded taxonomy nodes
    expect(store.occurrences).toEqual([])                    // No occurrences on first run
    expect(store.goals.length).toBeGreaterThanOrEqual(1)    // Default daily point goal (50)
    expect(store.dailyPointGoalValue).toBe(50)
  })

  it('hydrates existing state from storage adapter', async () => {
    const preloadedState: AppStatePayload = {
      version: 1,
      exportedAt: '2026-08-26T12:00:00.000Z',
      eventTypes: [
        {
          id: 'et-1',
          name: 'Water',
          icon: 'Droplet',
          colorBadge: 'sky',
          basePoints: 5,
          defaultUnit: 'glass',
          defaultIncrement: 1,
          targetFrequency: 8,
          createdAt: '2026-08-26T10:00:00.000Z',
          updatedAt: '2026-08-26T10:00:00.000Z'
        }
      ],
      taxonomyNodes: [
        {
          id: 'tax-1',
          name: 'Health',
          parentId: null,
          createdAt: '2026-08-26T10:00:00.000Z',
          updatedAt: '2026-08-26T10:00:00.000Z'
        }
      ],
      occurrences: [
        {
          id: 'occ-1',
          eventTypeId: 'et-1',
          timestamp: '2026-08-26T11:00:00.000Z',
          quantity: 2,
          snapshot: {
            eventTypeName: 'Water',
            unit: 'glass',
            basePoints: 5,
            calculatedPoints: 10,
            taxonomyNodeId: null
          },
          createdAt: '2026-08-26T11:00:00.000Z'
        }
      ],
      goals: [
        {
          id: 'goal-1',
          type: 'daily_points',
          targetValue: 75,
          createdAt: '2026-08-26T10:00:00.000Z',
          updatedAt: '2026-08-26T10:00:00.000Z'
        }
      ],
      settings: {
        theme: 'dark'
      }
    }

    await inMemoryAdapter.setItem(STORAGE_KEY_APP_STATE, preloadedState)

    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    expect(store.eventTypes.length).toBe(1)
    expect(store.eventTypes[0].name).toBe('Water')
    expect(store.taxonomyNodes.length).toBe(1)
    expect(store.occurrences.length).toBe(1)
    expect(store.occurrences[0].quantity).toBe(2)
    expect(store.dailyPointGoalValue).toBe(75)
    expect(store.settings.theme).toBe('dark')
  })

  it('adds an Event Type and persists to storage', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const created = await store.addEventType({
      name: 'Coffee',
      icon: 'Coffee',
      colorBadge: 'amber',
      basePoints: -2,
      defaultUnit: 'cup',
      defaultIncrement: 1,
      targetFrequency: null
    })

    expect(created.id).toBeDefined()
    expect(created.name).toBe('Coffee')
    expect(created.basePoints).toBe(-2)
    expect(store.eventTypes.some(e => e.name === 'Coffee')).toBe(true)

    // Verify persisted in storage (5 seeded + 1 Coffee = 6)
    const persisted = await inMemoryAdapter.getItem<AppStatePayload>(STORAGE_KEY_APP_STATE)
    expect(persisted?.eventTypes.some(e => e.name === 'Coffee')).toBe(true)
  })

  it('maintains Immutable Occurrence Snapshots when Event Type is updated (ADR 0002)', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Push-ups',
      icon: 'Activity',
      colorBadge: 'emerald',
      basePoints: 10,
      defaultUnit: 'set',
      defaultIncrement: 1
    })

    // Log occurrence with basePoints = 10, quantity = 2 -> calculatedPoints = 20
    const occ = await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 2
    })

    expect(occ).not.toBeNull()
    expect(occ?.snapshot.eventTypeName).toBe('Push-ups')
    expect(occ?.snapshot.basePoints).toBe(10)
    expect(occ?.snapshot.calculatedPoints).toBe(20)

    // Now modify Event Type name to "Diamond Push-ups" and basePoints to 15
    await store.updateEventType(eventType.id, {
      name: 'Diamond Push-ups',
      basePoints: 15
    })

    // Verify Event Type was updated
    const updatedEventType = store.getEventTypeById(eventType.id)
    expect(updatedEventType?.name).toBe('Diamond Push-ups')
    expect(updatedEventType?.basePoints).toBe(15)

    // Verify past occurrence snapshot remains completely unchanged
    const pastOcc = store.occurrences.find(o => o.id === occ?.id)
    expect(pastOcc?.snapshot.eventTypeName).toBe('Push-ups')
    expect(pastOcc?.snapshot.basePoints).toBe(10)
    expect(pastOcc?.snapshot.calculatedPoints).toBe(20)
  })

  it('supports Subtypes with point overrides during occurrence logging', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Coffee',
      icon: 'Coffee',
      colorBadge: 'amber',
      basePoints: 2,
      defaultUnit: 'cup',
      subtypes: [
        { id: 'sub-espresso', name: 'Espresso', pointOverride: 3 },
        { id: 'sub-decaf', name: 'Decaf', pointOverride: 1 }
      ]
    })

    const occEspresso = await store.logOccurrence({
      eventTypeId: eventType.id,
      subtypeId: 'sub-espresso',
      quantity: 2
    })

    expect(occEspresso?.subtypeId).toBe('sub-espresso')
    expect(occEspresso?.subtypeName).toBe('Espresso')
    expect(occEspresso?.snapshot.basePoints).toBe(3)
    expect(occEspresso?.snapshot.calculatedPoints).toBe(6) // 3 * 2

    const occDecaf = await store.logOccurrence({
      eventTypeId: eventType.id,
      subtypeId: 'sub-decaf',
      quantity: 1
    })

    expect(occDecaf?.snapshot.basePoints).toBe(1)
    expect(occDecaf?.snapshot.calculatedPoints).toBe(1)
  })

  it('soft-archives Event Types that have linked Occurrences (ADR 0002)', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Floss',
      icon: 'Sparkles',
      colorBadge: 'violet',
      basePoints: 5,
      defaultUnit: 'session'
    })

    const baseCount = store.activeEventTypes.length // 5 seeded + 'Floss' added above

    await store.logOccurrence({ eventTypeId: eventType.id })

    // Deleting an Event Type with linked occurrences should soft-archive it
    await store.deleteEventType(eventType.id)

    expect(store.activeEventTypes).toHaveLength(baseCount - 1)
    expect(store.archivedEventTypes).toHaveLength(1)
    expect(store.archivedEventTypes[0].id).toBe(eventType.id)
    expect(store.occurrences).toHaveLength(1) // Historical occurrences preserved
  })

  it('hard-deletes Event Types that have no linked Occurrences', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Temporary Habit',
      icon: 'Clock',
      colorBadge: 'slate',
      basePoints: 1,
      defaultUnit: 'time'
    })

    const baseCount = store.activeEventTypes.length // 5 seeded + 'Temporary Habit' added above
    await store.deleteEventType(eventType.id)
    expect(store.activeEventTypes).toHaveLength(baseCount - 1)
    expect(store.archivedEventTypes).toHaveLength(0)
  })

  it('allows unarchiving soft-archived Event Types', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Reading',
      icon: 'Book',
      colorBadge: 'indigo',
      basePoints: 10,
      defaultUnit: 'chapter'
    })

    const baseActive = store.activeEventTypes.length // 5 seeded + 'Reading' added above

    await store.archiveEventType(eventType.id)
    expect(store.activeEventTypes).toHaveLength(baseActive - 1)
    expect(store.archivedEventTypes).toHaveLength(1)

    await store.unarchiveEventType(eventType.id)
    expect(store.activeEventTypes).toHaveLength(baseActive)
    expect(store.archivedEventTypes).toHaveLength(0)
  })

  it('reorders Event Types according to provided ID list', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const e1 = await store.addEventType({ name: 'A', icon: '1', colorBadge: 'sky', basePoints: 1, defaultUnit: 'u' })
    const e2 = await store.addEventType({ name: 'B', icon: '2', colorBadge: 'sky', basePoints: 1, defaultUnit: 'u' })
    const e3 = await store.addEventType({ name: 'C', icon: '3', colorBadge: 'sky', basePoints: 1, defaultUnit: 'u' })

    await store.reorderEventTypes([e3.id, e1.id, e2.id])

    const names = store.activeEventTypes.map(e => e.name)
    // Verify the relative order of A, B, C is now C → A → B
    const iA = names.indexOf('A')
    const iB = names.indexOf('B')
    const iC = names.indexOf('C')
    expect(iC).toBeLessThan(iA)
    expect(iA).toBeLessThan(iB)
  })

  it('manages hierarchical Taxonomy Nodes (ADR 0003)', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const root = await store.addTaxonomyNode({ name: 'Health' })
    const child = await store.addTaxonomyNode({ name: 'Exercise', parentId: root.id })
    const grandchild = await store.addTaxonomyNode({ name: 'Calisthenics', parentId: child.id })

    expect(store.getTaxonomyPath(root.id)).toBe('Health')
    expect(store.getTaxonomyPath(child.id)).toBe('Health > Exercise')
    expect(store.getTaxonomyPath(grandchild.id)).toBe('Health > Exercise > Calisthenics')
  })

  it('cleans up taxonomy references when a Taxonomy Node is deleted', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const category = await store.addTaxonomyNode({ name: 'Fitness' })
    const eventType = await store.addEventType({
      name: 'Jogging',
      icon: 'Flame',
      colorBadge: 'rose',
      basePoints: 10,
      defaultUnit: 'km',
      taxonomyNodeId: category.id
    })

    expect(store.getEventTypeById(eventType.id)?.taxonomyNodeId).toBe(category.id)

    await store.deleteTaxonomyNode(category.id)
    expect(store.getEventTypeById(eventType.id)?.taxonomyNodeId).toBeNull()
  })

  it('logs, updates, and undoes occurrences', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Water',
      icon: 'Droplet',
      colorBadge: 'sky',
      basePoints: 5,
      defaultUnit: 'glass'
    })

    const occ = await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 1
    })

    expect(store.occurrences).toHaveLength(1)
    expect(store.todayPoints).toBe(5)

    // Update quantity to 3
    if (occ) {
      await store.updateOccurrence(occ.id, { quantity: 3 })
      expect(store.todayPoints).toBe(15)

      // Undo / remove occurrence
      await store.undoOccurrence(occ.id)
      expect(store.occurrences).toHaveLength(0)
      expect(store.todayPoints).toBe(0)
    }
  })

  it('calculates daily points goal updates', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    expect(store.dailyPointGoalValue).toBe(50)
    await store.setDailyPointGoal(100)
    expect(store.dailyPointGoalValue).toBe(100)

    const persisted = await inMemoryAdapter.getItem<AppStatePayload>(STORAGE_KEY_APP_STATE)
    const dailyGoal = persisted?.goals.find(g => g.type === 'daily_points')
    expect(dailyGoal?.targetValue).toBe(100)
  })

  it('exports and replaces entire state via importState', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    await store.addEventType({
      name: 'Meditation',
      icon: 'Smile',
      colorBadge: 'violet',
      basePoints: 20,
      defaultUnit: 'min'
    })

    const exportData = store.exportState()
    expect(exportData.version).toBe(1)
    expect(exportData.eventTypes.some(e => e.name === 'Meditation')).toBe(true)

    // Create a new fresh store with replacement data
    const newStore = useTrackerStore()
    await newStore.initialize(inMemoryAdapter)

    const importedState: AppStatePayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      eventTypes: [
        {
          id: 'imported-1',
          name: 'Imported Routine',
          icon: 'Check',
          colorBadge: 'emerald',
          basePoints: 30,
          defaultUnit: 'rep',
          defaultIncrement: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      taxonomyNodes: [],
      occurrences: [],
      goals: [
        {
          id: 'g-imported',
          type: 'daily_points',
          targetValue: 80,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      settings: { theme: 'light' }
    }

    await newStore.importState(importedState)

    expect(newStore.eventTypes).toHaveLength(1)
    expect(newStore.eventTypes[0].name).toBe('Imported Routine')
    expect(newStore.dailyPointGoalValue).toBe(80)
  })

  describe('Starter Seed Data Loader', () => {
    it('seeds starter event types on first run with empty storage', async () => {
      const store = useTrackerStore()
      await store.initialize(inMemoryAdapter)

      // Should have the 5 starter event types
      expect(store.activeEventTypes.length).toBe(5)

      const names = store.activeEventTypes.map(e => e.name)
      expect(names).toContain('Glass of Water')
      expect(names).toContain('Cup of Coffee')
      expect(names).toContain('Set of 10 Push-ups')
      expect(names).toContain('Floss Teeth')
      expect(names).toContain('Haircut / Shave')
    })

    it('seeds starter taxonomy branches: Health > Hydration, Health > Fitness, Hygiene', async () => {
      const store = useTrackerStore()
      await store.initialize(inMemoryAdapter)

      const nodeNames = store.taxonomyNodes.map(n => n.name)
      expect(nodeNames).toContain('Health')
      expect(nodeNames).toContain('Hydration')
      expect(nodeNames).toContain('Fitness')
      expect(nodeNames).toContain('Hygiene')

      // Verify parent-child relationships
      const health = store.taxonomyNodes.find(n => n.name === 'Health')
      const hydration = store.taxonomyNodes.find(n => n.name === 'Hydration')
      const fitness = store.taxonomyNodes.find(n => n.name === 'Fitness')
      const hygiene = store.taxonomyNodes.find(n => n.name === 'Hygiene')

      expect(health?.parentId).toBeNull()
      expect(hydration?.parentId).toBe(health?.id)
      expect(fitness?.parentId).toBe(health?.id)
      expect(hygiene?.parentId).toBeNull()
    })

    it('seeds a 50-point daily goal', async () => {
      const store = useTrackerStore()
      await store.initialize(inMemoryAdapter)

      expect(store.dailyPointGoalValue).toBe(50)
    })

    it('wires event types to the correct taxonomy nodes', async () => {
      const store = useTrackerStore()
      await store.initialize(inMemoryAdapter)

      const hydration = store.taxonomyNodes.find(n => n.name === 'Hydration')
      const fitness = store.taxonomyNodes.find(n => n.name === 'Fitness')
      const hygiene = store.taxonomyNodes.find(n => n.name === 'Hygiene')

      const water = store.activeEventTypes.find(e => e.name === 'Glass of Water')
      const coffee = store.activeEventTypes.find(e => e.name === 'Cup of Coffee')
      const pushups = store.activeEventTypes.find(e => e.name === 'Set of 10 Push-ups')
      const floss = store.activeEventTypes.find(e => e.name === 'Floss Teeth')
      const haircut = store.activeEventTypes.find(e => e.name === 'Haircut / Shave')

      expect(water?.taxonomyNodeId).toBe(hydration?.id)
      expect(coffee?.taxonomyNodeId).toBe(hydration?.id)
      expect(pushups?.taxonomyNodeId).toBe(fitness?.id)
      expect(floss?.taxonomyNodeId).toBe(hygiene?.id)
      expect(haircut?.taxonomyNodeId).toBe(hygiene?.id)
    })

    it('does not seed when storage already has data (not a first run)', async () => {
      // Pre-populate storage with one event type
      const existingState = {
        version: 1,
        exportedAt: new Date().toISOString(),
        eventTypes: [
          {
            id: 'existing-et',
            name: 'My Custom Habit',
            icon: 'Star',
            colorBadge: 'violet',
            basePoints: 5,
            defaultUnit: 'session',
            defaultIncrement: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        taxonomyNodes: [],
        occurrences: [],
        goals: [],
        settings: { theme: 'system' }
      }

      await inMemoryAdapter.setItem('countonit:v1:state', existingState)

      const store = useTrackerStore()
      await store.initialize(inMemoryAdapter)

      // Should only have the pre-existing event type, not the seeded ones
      expect(store.activeEventTypes).toHaveLength(1)
      expect(store.activeEventTypes[0].name).toBe('My Custom Habit')
    })

    it('persists seed data to storage after first run', async () => {
      const store = useTrackerStore()
      await store.initialize(inMemoryAdapter)

      const persisted = await inMemoryAdapter.getItem<{ eventTypes: unknown[] }>('countonit:v1:state')
      expect(persisted?.eventTypes).toHaveLength(5)
    })
  })

  it('calculates consecutive-day streaks correctly', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Water',
      icon: 'Droplet',
      colorBadge: 'sky',
      basePoints: 1,
      defaultUnit: 'glass',
      targetFrequency: 2
    })

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const fourDaysAgo = new Date(today)
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)

    // Two days ago: logged 2 glasses (achieved)
    await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 2,
      timestamp: twoDaysAgo.toISOString()
    })

    // Yesterday: logged 1 glass then 1 glass (achieved)
    await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 1,
      timestamp: yesterday.toISOString()
    })
    await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 1,
      timestamp: yesterday.toISOString()
    })

    // Today: not logged yet -> current streak is 2 (yesterday + 2 days ago)
    let streak = store.calculateStreak(eventType.id)
    expect(streak.currentStreak).toBe(2)
    expect(streak.isActiveToday).toBe(false)

    // Today: log 2 glasses -> current streak becomes 3
    await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 2,
      timestamp: today.toISOString()
    })

    streak = store.calculateStreak(eventType.id)
    expect(streak.currentStreak).toBe(3)
    expect(streak.longestStreak).toBe(3)
    expect(streak.isActiveToday).toBe(true)

    // Add four days ago entry (missed 3 days ago, so streak broke)
    await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 2,
      timestamp: fourDaysAgo.toISOString()
    })

    streak = store.calculateStreak(eventType.id)
    expect(streak.currentStreak).toBe(3)
    expect(streak.longestStreak).toBe(3)
  })
})

