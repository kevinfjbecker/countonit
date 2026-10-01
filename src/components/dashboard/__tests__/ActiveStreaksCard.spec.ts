import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useTrackerStore } from '@/stores/tracker'
import { InMemoryStorageAdapter } from '@/storage/InMemoryStorageAdapter'
import ActiveStreaksCard from '../ActiveStreaksCard.vue'

describe('ActiveStreaksCard.vue', () => {
  let inMemoryAdapter: InMemoryStorageAdapter

  beforeEach(() => {
    setActivePinia(createPinia())
    inMemoryAdapter = new InMemoryStorageAdapter()
  })

  it('renders habit frequency target items from seed data', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const wrapper = mount(ActiveStreaksCard)

    expect(wrapper.find('[data-testid="active-streaks-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Habit Streaks')
    expect(wrapper.text()).toContain('Glass of Water')
    expect(wrapper.text()).toContain('Set of 10 Push-ups')
    expect(wrapper.text()).toContain('Floss Teeth')
    // Cup of Coffee has targetFrequency: null, so it should not be listed
    expect(wrapper.text()).not.toContain('Cup of Coffee')
  })

  it('displays streak counts and progress toward target frequency', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const wrapper = mount(ActiveStreaksCard)

    // Initially 0 days streak, target 8 for water
    expect(wrapper.find('[data-testid="streak-list"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('0 / 8')
    expect(wrapper.find('[data-testid="streak-achieved-badge"]').exists()).toBe(false)
  })

  it('updates progress and shows achievement badge when target frequency is met', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const water = store.eventTypes.find(e => e.name === 'Glass of Water')!

    // Log 8 glasses of water today
    await store.logOccurrence({
      eventTypeId: water.id,
      quantity: 8
    })

    const wrapper = mount(ActiveStreaksCard)

    expect(wrapper.text()).toContain('8 / 8')
    expect(wrapper.find('[data-testid="streak-achieved-badge"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Achieved')
    expect(wrapper.text()).toContain('1 day')
  })

  it('renders empty state when no event types have a target frequency', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    // Remove target frequencies from all event types
    for (const et of store.eventTypes) {
      await store.updateEventType(et.id, { targetFrequency: null })
    }

    const wrapper = mount(ActiveStreaksCard)

    expect(wrapper.find('[data-testid="streak-empty-state"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('No habit targets configured')
  })

  it('reactively updates when occurrences are undone', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const floss = store.eventTypes.find(e => e.name === 'Floss Teeth')!
    const occ = await store.logOccurrence({
      eventTypeId: floss.id,
      quantity: 1
    })

    const wrapper = mount(ActiveStreaksCard)
    expect(wrapper.find('[data-testid="streak-achieved-badge"]').exists()).toBe(true)

    if (occ) {
      await store.undoOccurrence(occ.id)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[data-testid="streak-achieved-badge"]').exists()).toBe(false)
    }
  })
})
