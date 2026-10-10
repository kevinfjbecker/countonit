import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useTrackerStore } from '@/stores/tracker'
import { InMemoryStorageAdapter } from '@/storage/InMemoryStorageAdapter'
import TaxonomyCategoryBreakdownCard from '../TaxonomyCategoryBreakdownCard.vue'

describe('TaxonomyCategoryBreakdownCard.vue', () => {
  let inMemoryAdapter: InMemoryStorageAdapter

  beforeEach(() => {
    setActivePinia(createPinia())
    inMemoryAdapter = new InMemoryStorageAdapter()
  })

  it('renders initial category breakdown card with empty state when no occurrences today', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const wrapper = mount(TaxonomyCategoryBreakdownCard)

    expect(wrapper.find('[data-testid="taxonomy-breakdown-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Category Breakdown')
    expect(wrapper.find('[data-testid="empty-breakdown-state"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('No activities logged today yet')
  })

  it('displays category items with progress bars, points, and percentages when occurrences exist', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const node = await store.addTaxonomyNode({
      name: 'Health',
      color: 'emerald'
    })

    const eventType = await store.addEventType({
      name: 'Pushups',
      icon: 'Dumbbell',
      colorBadge: 'emerald',
      basePoints: 20,
      defaultUnit: 'set',
      taxonomyNodeId: node.id
    })

    await store.logOccurrence({
      eventTypeId: eventType.id,
      quantity: 1
    })

    const wrapper = mount(TaxonomyCategoryBreakdownCard)

    expect(wrapper.find('[data-testid="empty-breakdown-state"]').exists()).toBe(false)

    const items = wrapper.findAll('[data-testid="category-breakdown-item"]')
    expect(items).toHaveLength(1)
    expect(items[0].text()).toContain('Health')
    expect(items[0].text()).toContain('20 pts')
    expect(items[0].text()).toContain('100%')

    const bar = items[0].find('[data-testid="category-progress-bar"]')
    expect(bar.exists()).toBe(true)
    expect(bar.attributes('style')).toContain('width: 100%')
  })

  it('renders "Other / General" for unassigned event type occurrences', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const unassignedType = await store.addEventType({
      name: 'Coffee',
      icon: 'Coffee',
      colorBadge: 'amber',
      basePoints: 15,
      defaultUnit: 'cup',
      taxonomyNodeId: null
    })

    await store.logOccurrence({
      eventTypeId: unassignedType.id,
      quantity: 1
    })

    const wrapper = mount(TaxonomyCategoryBreakdownCard)

    const items = wrapper.findAll('[data-testid="category-breakdown-item"]')
    expect(items).toHaveLength(1)
    expect(items[0].text()).toContain('Other / General')
    expect(items[0].text()).toContain('15 pts')
  })
})
