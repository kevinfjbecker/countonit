import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useTrackerStore } from '@/stores/tracker'
import { InMemoryStorageAdapter } from '@/storage/InMemoryStorageAdapter'
import DashboardView from '../DashboardView.vue'

describe('DashboardView.vue', () => {
  let inMemoryAdapter: InMemoryStorageAdapter

  beforeEach(() => {
    setActivePinia(createPinia())
    inMemoryAdapter = new InMemoryStorageAdapter()
  })

  it('renders loading state when store is not initialized', () => {
    const wrapper = mount(DashboardView)
    expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true)
  })

  it('renders DailyPointsSummaryCard when store is initialized', async () => {
    const store = useTrackerStore()
    await store.initialize(inMemoryAdapter)

    const wrapper = mount(DashboardView)

    expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="daily-points-summary-card"]').exists()).toBe(true)
  })
})
