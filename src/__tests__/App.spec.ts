import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App.vue', () => {
  it('defaults to rendering the LogView', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Log Occurrences')
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
    expect(wrapper.text()).toContain('Log Occurrences')
  })
})
