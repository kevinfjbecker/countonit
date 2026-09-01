import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import App from '../App.vue'

describe('App.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('automatically initializes store and displays seeded event types on first run', async () => {
    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.text()).toContain('Quick Log')
    expect(wrapper.text()).toContain('Glass of Water')
    expect(wrapper.text()).toContain('Cup of Coffee')
    expect(wrapper.text()).toContain('Set of 10 Push-ups')
  })

  it('switches views when clicking tabs in bottom navigation', async () => {
    const wrapper = mount(App)
    await flushPromises()

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
    expect(wrapper.text()).toContain('Glass of Water')
  })
})
