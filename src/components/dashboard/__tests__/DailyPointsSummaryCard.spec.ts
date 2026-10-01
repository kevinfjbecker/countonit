import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useTrackerStore } from '@/stores/tracker'
import { InMemoryStorageAdapter } from '@/storage/InMemoryStorageAdapter'
import DailyPointsSummaryCard from '../DailyPointsSummaryCard.vue'

describe('DailyPointsSummaryCard.vue', () => {
  let inMemoryAdapter: InMemoryStorageAdapter

  beforeEach(() => {
    setActivePinia(createPinia())
    inMemoryAdapter = new InMemoryStorageAdapter()
  })

  it('renders initial summary state with 0 points and default goal', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const wrapper = mount(DailyPointsSummaryCard)

    expect(wrapper.text()).toContain('0')
    expect(wrapper.text()).toContain('50')
    expect(wrapper.text()).toContain('0%')
    expect(wrapper.find('[data-testid="progress-ring"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Goal Achieved!')
  })

  it('calculates progress percentage and updates ring when points are accumulated', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Read Book',
      icon: 'BookOpen',
      colorBadge: 'indigo',
      basePoints: 25,
      defaultUnit: 'pages'
    })

    await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 1
    })

    const wrapper = mount(DailyPointsSummaryCard)

    expect(wrapper.text()).toContain('25')
    expect(wrapper.text()).toContain('50')
    expect(wrapper.text()).toContain('50%')
    expect(wrapper.text()).not.toContain('Goal Achieved!')
  })

  it('renders visual celebration state when daily goal is reached (100%+)', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const eventType = await store.addEventType({
      name: 'Workout',
      icon: 'Dumbbell',
      colorBadge: 'emerald',
      basePoints: 50,
      defaultUnit: 'session'
    })

    await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 1
    })

    const wrapper = mount(DailyPointsSummaryCard)

    expect(wrapper.text()).toContain('50')
    expect(wrapper.text()).toContain('100%')
    expect(wrapper.find('[data-testid="goal-achieved-badge"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Goal Achieved')
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

    const wrapper = mount(DailyPointsSummaryCard)
    expect(wrapper.text()).toContain('100%')

    if (occ) {
      await store.undoOccurrence(occ.id)
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('0%')
      expect(wrapper.find('[data-testid="goal-achieved-badge"]').exists()).toBe(false)
    }
  })
})
