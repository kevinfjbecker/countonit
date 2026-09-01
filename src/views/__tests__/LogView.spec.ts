import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
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

  it('displays empty state when no active event types exist', async () => {
    await store.resetState()
    const wrapper = mount(LogView)

    expect(wrapper.text()).toContain('No event types found')
    const cards = wrapper.findAllComponents({ name: 'EventCard' })
    expect(cards.length).toBe(0)
  })
})
