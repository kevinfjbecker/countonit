import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppShell from '../AppShell.vue'
import type { NavTabId } from '@/types/navigation'

describe('AppShell.vue', () => {
  it('renders mobile-first responsive container with tabpanel roles', () => {
    const wrapper = mount(AppShell, {
      props: {
        activeTab: 'log' as NavTabId,
      },
      slots: {
        default: '<div data-testid="content">Test Page Content</div>',
      },
    })

    expect(wrapper.find('[data-testid="content"]').text()).toBe('Test Page Content')
    expect(wrapper.find('nav').exists()).toBe(true)

    const panel = wrapper.find('main')
    expect(panel.attributes('role')).toBe('tabpanel')
    expect(panel.attributes('id')).toBe('panel-log')
    expect(panel.attributes('aria-labelledby')).toBe('tab-log')
  })

  it('emits update:activeTab when navigation item is clicked', async () => {
    const wrapper = mount(AppShell, {
      props: {
        activeTab: 'log' as NavTabId,
      },
    })

    const settingsTab = wrapper.find('[data-tab="settings"]')
    await settingsTab.trigger('click')

    expect(wrapper.emitted('update:activeTab')).toBeTruthy()
    expect(wrapper.emitted('update:activeTab')![0]).toEqual(['settings'])
  })
})
