import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BottomNav from '../BottomNav.vue'
import type { NavTabId } from '@/types/navigation'

describe('BottomNav.vue', () => {
  it('renders all 4 navigation tabs with their labels', () => {
    const wrapper = mount(BottomNav, {
      props: {
        modelValue: 'log' as NavTabId,
      },
    })

    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs.length).toBe(4)

    const labels = tabs.map((tab) => tab.text())
    expect(labels).toEqual(['Log', 'Dashboard', 'History', 'Settings'])
  })

  it('marks the active tab with aria-selected="true" and active classes', () => {
    const wrapper = mount(BottomNav, {
      props: {
        modelValue: 'dashboard' as NavTabId,
      },
    })

    const dashboardTab = wrapper.find('[data-tab="dashboard"]')
    expect(dashboardTab.attributes('aria-selected')).toBe('true')
    expect(dashboardTab.classes()).toContain('text-indigo-600')

    const logTab = wrapper.find('[data-tab="log"]')
    expect(logTab.attributes('aria-selected')).toBe('false')
  })

  it('emits update:modelValue when a tab is clicked', async () => {
    const wrapper = mount(BottomNav, {
      props: {
        modelValue: 'log' as NavTabId,
      },
    })

    const historyTab = wrapper.find('[data-tab="history"]')
    await historyTab.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['history'])
  })

  it('provides accessible role and aria attributes for screen readers', () => {
    const wrapper = mount(BottomNav, {
      props: {
        modelValue: 'log' as NavTabId,
      },
    })

    const nav = wrapper.find('nav')
    expect(nav.attributes('aria-label')).toBe('Main Navigation')

    const tabList = wrapper.find('[role="tablist"]')
    expect(tabList.exists()).toBe(true)

    const logTab = wrapper.find('[data-tab="log"]')
    expect(logTab.attributes('id')).toBe('tab-log')
    expect(logTab.attributes('aria-controls')).toBe('panel-log')
    expect(logTab.attributes('aria-label')).toBe('Log occurrences')
  })
})
