import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LogView from '../LogView.vue'
import { useTrackerStore } from '@/stores/tracker'
import { InMemoryStorageAdapter } from '@/storage/InMemoryStorageAdapter'

describe('LogView', () => {
  let store: ReturnType<typeof useTrackerStore>
  let storage: InMemoryStorageAdapter

  beforeEach(async () => {
    setActivePinia(createPinia())
    store = useTrackerStore()
    storage = new InMemoryStorageAdapter()
    await store.initialize(storage)
  })

  it('renders a grid of active event types from the store', () => {
    const wrapper = mount(LogView)

    // Starter seed contains 5 active event types
    expect(wrapper.text()).toContain('Glass of Water')
    expect(wrapper.text()).toContain('Cup of Coffee')
    expect(wrapper.text()).toContain('Set of 10 Push-ups')
    expect(wrapper.text()).toContain('Floss Teeth')
    expect(wrapper.text()).toContain('Haircut / Shave')

    const cards = wrapper.findAllComponents({ name: 'EventCard' })
    expect(cards.length).toBe(5)
  })

  it('shows loading state when store is not yet initialized', () => {
    setActivePinia(createPinia())
    const uninitializedStore = useTrackerStore()
    expect(uninitializedStore.isInitialized).toBe(false)

    const wrapper = mount(LogView)
    expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading event types...')
  })

  it('does not render archived event types in the grid', async () => {
    const water = store.eventTypes.find(e => e.id === 'seed-et-water')
    if (water) {
      await store.archiveEventType(water.id)
    }

    const wrapper = mount(LogView)
    expect(wrapper.text()).not.toContain('Glass of Water')
    const cards = wrapper.findAllComponents({ name: 'EventCard' })
    expect(cards.length).toBe(4)
  })

  it('logs an occurrence with immutable snapshot on card tap', async () => {
    const wrapper = mount(LogView)

    const initialCount = store.occurrences.length
    expect(initialCount).toBe(0)

    // Find the Glass of Water button
    const waterButton = wrapper.find('button[aria-label*="Glass of Water"]')
    expect(waterButton.exists()).toBe(true)

    await waterButton.trigger('click')
    await flushPromises()

    expect(store.occurrences.length).toBe(1)
    const logged = store.occurrences[0]
    expect(logged.eventTypeId).toBe('seed-et-water')
    expect(logged.quantity).toBe(1)
    expect(logged.snapshot).toEqual({
      eventTypeName: 'Glass of Water',
      unit: 'glass',
      basePoints: 5,
      calculatedPoints: 5,
      taxonomyNodeId: 'seed-node-hydration'
    })
  })

  it('displays undo toast when an occurrence is logged and allows undoing it', async () => {
    const wrapper = mount(LogView)

    expect(wrapper.find('[data-testid="undo-toast"]').exists()).toBe(false)

    // Tap Glass of Water (+5 pts)
    const waterButton = wrapper.find('button[aria-label*="Glass of Water"]')
    await waterButton.trigger('click')
    await flushPromises()

    // Toast should appear
    expect(wrapper.find('[data-testid="undo-toast"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Logged Glass of Water')
    expect(wrapper.text()).toContain('+5 pts')
    expect(store.occurrences.length).toBe(1)

    // Click Undo
    const undoButton = wrapper.find('button[data-testid="undo-btn"]')
    expect(undoButton.exists()).toBe(true)
    await undoButton.trigger('click')
    await flushPromises()

    // Occurrence should be undone (removed)
    expect(store.occurrences.length).toBe(0)
    expect(wrapper.find('[data-testid="undo-toast"]').exists()).toBe(false)
  })

  it('updates undo toast when a subsequent card is tapped', async () => {
    const wrapper = mount(LogView)

    // Tap Water (+5 pts)
    const waterButton = wrapper.find('button[aria-label*="Glass of Water"]')
    await waterButton.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Logged Glass of Water')

    // Tap Coffee (-2 pts)
    const coffeeButton = wrapper.find('button[aria-label*="Cup of Coffee"]')
    await coffeeButton.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Logged Cup of Coffee')
    expect(wrapper.text()).toContain('-2 pts')
    expect(store.occurrences.length).toBe(2)

    // Undo should undo the most recent one (Coffee)
    const undoButton = wrapper.find('button[data-testid="undo-btn"]')
    await undoButton.trigger('click')
    await flushPromises()

    expect(store.occurrences.length).toBe(1)
    expect(store.occurrences[0].snapshot.eventTypeName).toBe('Glass of Water')
  })

  it('displays empty state when no active event types exist', async () => {
    await store.resetState()
    const wrapper = mount(LogView)

    expect(wrapper.text()).toContain('No event types found')
    const cards = wrapper.findAllComponents({ name: 'EventCard' })
    expect(cards.length).toBe(0)
  })
})
