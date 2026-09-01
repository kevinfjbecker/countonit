import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import App from '../App.vue'
import { useTrackerStore } from '@/stores/tracker'
import { InMemoryStorageAdapter } from '@/storage/InMemoryStorageAdapter'

describe('App.vue', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    const store = useTrackerStore()
    await store.initialize(new InMemoryStorageAdapter())
  })

  it('defaults to rendering the LogView', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Quick Log')
    expect(wrapper.text()).toContain('Glass of Water')
  })

  it('switches views when clicking tabs in bottom navigation', async () => {
    const wrapper = mount(App)

    // Switch to Dashboard
    await wrapper.find('[data-tab="dashboard"]').trigger('click')
    expect(wrapper.text()).toContain('Dashboard & Trends')

    // Switch to History
    await wrapper.find('[data-tab="history"]').trigger('click')
    expect(wrapper.text()).toContain('History Timeline')

    // Switch to Settings
    await wrapper.find('[data-tab="settings"]').trigger('click')
    expect(wrapper.text()).toContain('Settings & Taxonomies')

    // Switch back to Log
    await wrapper.find('[data-tab="log"]').trigger('click')
    expect(wrapper.text()).toContain('Quick Log')
  })
})
