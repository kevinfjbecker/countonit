import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HistoryView from '../HistoryView.vue'
import { useTrackerStore } from '@/stores/tracker'
import { InMemoryStorageAdapter } from '@/storage/InMemoryStorageAdapter'

describe('HistoryView', () => {
  let store: ReturnType<typeof useTrackerStore>
  let storage: InMemoryStorageAdapter

  beforeEach(async () => {
    setActivePinia(createPinia())
    store = useTrackerStore()
    storage = new InMemoryStorageAdapter()
    await store.initialize(storage)
  })

  it('renders empty state when there are no occurrences recorded yet', () => {
    const wrapper = mount(HistoryView)

    expect(wrapper.find('[data-testid="history-empty-state"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('No activity recorded yet')
    expect(wrapper.text()).toContain('Backfill')
  })

  it('renders chronological groups with newest dates first', async () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    // Log occurrences across multiple days
    await store.logOccurrence({
      eventTypeId: 'seed-et-water',
      timestamp: twoDaysAgo.toISOString()
    })
    await store.logOccurrence({
      eventTypeId: 'seed-et-coffee',
      timestamp: yesterday.toISOString()
    })
    await store.logOccurrence({
      eventTypeId: 'seed-et-pushups',
      timestamp: today.toISOString()
    })

    const wrapper = mount(HistoryView)

    const groups = wrapper.findAllComponents({ name: 'HistoryGroup' })
    expect(groups.length).toBe(3)

    // Group 1 should be today
    expect(groups[0].text()).toContain('Today')
    expect(groups[0].text()).toContain('Set of 10 Push-ups')

    // Group 2 should be yesterday
    expect(groups[1].text()).toContain('Yesterday')
    expect(groups[1].text()).toContain('Cup of Coffee')

    // Group 3 should be 2 days ago
    expect(groups[2].text()).toContain('Glass of Water')
  })

  it('filters occurrences by preset date range (Today, Yesterday, 7 Days, All)', async () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tenDaysAgo = new Date(today)
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    await store.logOccurrence({
      eventTypeId: 'seed-et-water',
      timestamp: tenDaysAgo.toISOString()
    })
    await store.logOccurrence({
      eventTypeId: 'seed-et-coffee',
      timestamp: yesterday.toISOString()
    })
    await store.logOccurrence({
      eventTypeId: 'seed-et-pushups',
      timestamp: today.toISOString()
    })

    const wrapper = mount(HistoryView)

    // Default "all" has all 3
    expect(wrapper.findAllComponents({ name: 'HistoryTimelineItem' }).length).toBe(3)

    // Filter by "today"
    const todayFilterBtn = wrapper.find('button[data-testid="filter-date-today"]')
    await todayFilterBtn.trigger('click')

    const itemsToday = wrapper.findAllComponents({ name: 'HistoryTimelineItem' })
    expect(itemsToday.length).toBe(1)
    const timelineToday = wrapper.find('[data-testid="timeline-container"]').text()
    expect(timelineToday).toContain('Set of 10 Push-ups')
    expect(timelineToday).not.toContain('Cup of Coffee')
    expect(timelineToday).not.toContain('Glass of Water')

    // Filter by "7days"
    const weekFilterBtn = wrapper.find('button[data-testid="filter-date-7days"]')
    await weekFilterBtn.trigger('click')

    const itemsWeek = wrapper.findAllComponents({ name: 'HistoryTimelineItem' })
    expect(itemsWeek.length).toBe(2)
    const timelineWeek = wrapper.find('[data-testid="timeline-container"]').text()
    expect(timelineWeek).toContain('Set of 10 Push-ups')
    expect(timelineWeek).toContain('Cup of Coffee')
    expect(timelineWeek).not.toContain('Glass of Water')
  })

  it('filters occurrences by event type', async () => {
    await store.logOccurrence({ eventTypeId: 'seed-et-water' })
    await store.logOccurrence({ eventTypeId: 'seed-et-coffee' })
    await store.logOccurrence({ eventTypeId: 'seed-et-pushups' })

    const wrapper = mount(HistoryView)
    expect(wrapper.findAllComponents({ name: 'HistoryTimelineItem' }).length).toBe(3)

    // Select water filter
    const eventTypeSelect = wrapper.find('select[data-testid="event-type-filter"]')
    await eventTypeSelect.setValue('seed-et-water')

    const filteredItems = wrapper.findAllComponents({ name: 'HistoryTimelineItem' })
    expect(filteredItems.length).toBe(1)
    const timeline = wrapper.find('[data-testid="timeline-container"]').text()
    expect(timeline).toContain('Glass of Water')
    expect(timeline).not.toContain('Cup of Coffee')
    expect(timeline).not.toContain('Set of 10 Push-ups')
  })

  it('filters occurrences by search text', async () => {
    await store.logOccurrence({ eventTypeId: 'seed-et-water' })
    await store.logOccurrence({ eventTypeId: 'seed-et-coffee' })
    await store.logOccurrence({ eventTypeId: 'seed-et-haircut' })

    const wrapper = mount(HistoryView)

    const searchInput = wrapper.find('input[data-testid="history-search-input"]')
    await searchInput.setValue('Haircut')

    const filteredItems = wrapper.findAllComponents({ name: 'HistoryTimelineItem' })
    expect(filteredItems.length).toBe(1)
    const timeline = wrapper.find('[data-testid="timeline-container"]').text()
    expect(timeline).toContain('Haircut / Shave')
    expect(timeline).not.toContain('Glass of Water')
  })

  it('shows filtered empty state and allows resetting filters', async () => {
    await store.logOccurrence({ eventTypeId: 'seed-et-water' })

    const wrapper = mount(HistoryView)

    const searchInput = wrapper.find('input[data-testid="history-search-input"]')
    await searchInput.setValue('NonExistentHabit')

    expect(wrapper.find('[data-testid="history-filtered-empty-state"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('No occurrences match your filters')

    // Click Reset Filters
    const resetBtn = wrapper.find('button[data-testid="reset-filters-btn"]')
    await resetBtn.trigger('click')

    expect(wrapper.findAllComponents({ name: 'HistoryTimelineItem' }).length).toBe(1)
    expect(wrapper.text()).toContain('Glass of Water')
  })

  it('opens backfill modal, logs past occurrence, and updates timeline', async () => {
    const wrapper = mount(HistoryView)

    expect(store.occurrences.length).toBe(0)

    // Click Backfill Button
    const backfillBtn = wrapper.find('button[data-testid="open-backfill-btn"]')
    await backfillBtn.trigger('click')

    const modal = wrapper.findComponent({ name: 'BackfillModal' })
    expect(modal.props('modelValue')).toBe(true)

    // Simulate submit from modal
    await modal.vm.$emit('submit', {
      eventTypeId: 'seed-et-water',
      quantity: 3,
      timestamp: '2026-09-02T14:00:00.000Z'
    })
    await flushPromises()

    expect(store.occurrences.length).toBe(1)
    expect(store.occurrences[0].eventTypeId).toBe('seed-et-water')
    expect(store.occurrences[0].quantity).toBe(3)
    expect(store.occurrences[0].snapshot.calculatedPoints).toBe(15)
  })

  it('opens edit modal and updates occurrence quantity and timestamp', async () => {
    const occ = await store.logOccurrence({
      eventTypeId: 'seed-et-water',
      quantity: 1,
      timestamp: '2026-09-10T12:00:00.000Z'
    })

    const wrapper = mount(HistoryView)

    const timelineItem = wrapper.findComponent({ name: 'HistoryTimelineItem' })
    await timelineItem.vm.$emit('edit', occ)

    const editModal = wrapper.findComponent({ name: 'EditOccurrenceModal' })
    expect(editModal.props('modelValue')).toBe(true)
    expect(editModal.props('occurrence')?.id).toBe(occ?.id)

    // Simulate save
    if (occ) {
      await editModal.vm.$emit('save', {
        id: occ.id,
        quantity: 5,
        timestamp: '2026-09-10T18:00:00.000Z'
      })
      await flushPromises()

      expect(store.occurrences[0].quantity).toBe(5)
      expect(store.occurrences[0].snapshot.calculatedPoints).toBe(25)
      expect(store.occurrences[0].timestamp).toBe('2026-09-10T18:00:00.000Z')
    }
  })

  it('opens delete modal and confirms deletion of occurrence', async () => {
    const occ = await store.logOccurrence({
      eventTypeId: 'seed-et-water',
      quantity: 1
    })

    const wrapper = mount(HistoryView)
    expect(store.occurrences.length).toBe(1)

    const timelineItem = wrapper.findComponent({ name: 'HistoryTimelineItem' })
    await timelineItem.vm.$emit('delete', occ)

    const deleteModal = wrapper.findComponent({ name: 'DeleteConfirmModal' })
    expect(deleteModal.props('modelValue')).toBe(true)

    // Confirm deletion
    if (occ) {
      await deleteModal.vm.$emit('confirm', occ.id)
      await flushPromises()

      expect(store.occurrences.length).toBe(0)
    }
  })
})
