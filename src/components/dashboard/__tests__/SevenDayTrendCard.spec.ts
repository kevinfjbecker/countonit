import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useTrackerStore } from '@/stores/tracker'
import { InMemoryStorageAdapter } from '@/storage/InMemoryStorageAdapter'
import SevenDayTrendCard from '../SevenDayTrendCard.vue'

describe('SevenDayTrendCard.vue', () => {
  let inMemoryAdapter: InMemoryStorageAdapter

  beforeEach(() => {
    setActivePinia(createPinia())
    inMemoryAdapter = new InMemoryStorageAdapter()
  })

  it('renders initial 7-day trend card with 7 bars and 0 points state', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const wrapper = mount(SevenDayTrendCard)

    expect(wrapper.find('[data-testid="seven-day-trend-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('7-Day')
    
    // Should render 7 day bar elements
    const bars = wrapper.findAll('[data-testid="trend-bar-col"]')
    expect(bars).toHaveLength(7)

    // Day labels should be rendered
    const dayLabels = wrapper.findAll('[data-testid="day-label"]')
    expect(dayLabels).toHaveLength(7)
  })

  it('displays goal achievement indicator on days meeting the daily goal', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Pushups',
      icon: 'Activity',
      colorBadge: 'emerald',
      basePoints: 50,
      defaultUnit: 'reps'
    })

    // Log 50 points today (goal is 50)
    await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 1
    })

    const wrapper = mount(SevenDayTrendCard)

    // Should find at least 1 goal met indicator
    const indicators = wrapper.findAll('[data-testid="goal-met-indicator"]')
    expect(indicators.length).toBeGreaterThanOrEqual(1)
  })

  it('shows interactive details tooltip when tapping a day bar', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Reading',
      icon: 'Book',
      colorBadge: 'indigo',
      basePoints: 20,
      defaultUnit: 'pages'
    })

    await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 2
    })

    const wrapper = mount(SevenDayTrendCard)

    const bars = wrapper.findAll('[data-testid="trend-bar-col"]')
    expect(bars).toHaveLength(7)

    // Click the last bar (today)
    await bars[6].trigger('click')

    const tooltip = wrapper.find('[data-testid="trend-tooltip"]')
    expect(tooltip.exists()).toBe(true)
    expect(tooltip.text()).toContain('40 pts')
  })

  it('updates reactively when an occurrence is undone', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Water',
      icon: 'Droplet',
      colorBadge: 'sky',
      basePoints: 50,
      defaultUnit: 'glass'
    })

    const occ = await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 1
    })

    const wrapper = mount(SevenDayTrendCard)
    expect(wrapper.findAll('[data-testid="goal-met-indicator"]').length).toBe(1)

    if (occ) {
      await store.undoOccurrence(occ.id)
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('[data-testid="goal-met-indicator"]').length).toBe(0)
    }
  })
})
