import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EventCard from '../EventCard.vue'
import type { EventType } from '@/types/domain'

describe('EventCard', () => {
  const mockEventType: EventType = {
    id: 'et-water',
    name: 'Glass of Water',
    icon: 'Droplet',
    colorBadge: 'sky',
    basePoints: 5,
    defaultUnit: 'glass',
    defaultIncrement: 1,
    targetFrequency: 8,
    taxonomyNodeId: null,
    subtypes: [],
    archived: false,
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }

  it('renders event type name, unit, and positive point badge formatted with +', () => {
    const wrapper = mount(EventCard, {
      props: {
        eventType: mockEventType
      }
    })

    expect(wrapper.text()).toContain('Glass of Water')
    expect(wrapper.text()).toContain('+5 pts')
    expect(wrapper.text()).toContain('1 glass')
  })

  it('renders negative point badge formatted with -', () => {
    const negativeEventType: EventType = {
      ...mockEventType,
      id: 'et-coffee',
      name: 'Cup of Coffee',
      icon: 'Coffee',
      colorBadge: 'amber',
      basePoints: -2,
      defaultUnit: 'cup'
    }

    const wrapper = mount(EventCard, {
      props: {
        eventType: negativeEventType
      }
    })

    expect(wrapper.text()).toContain('Cup of Coffee')
    expect(wrapper.text()).toContain('-2 pts')
    expect(wrapper.text()).toContain('1 cup')
  })

  it('emits tap event with eventType when clicked', async () => {
    const wrapper = mount(EventCard, {
      props: {
        eventType: mockEventType
      }
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    await button.trigger('click')

    expect(wrapper.emitted('tap')).toBeTruthy()
    expect(wrapper.emitted('tap')![0]).toEqual([mockEventType])
  })

  it('has accessible button attributes', () => {
    const wrapper = mount(EventCard, {
      props: {
        eventType: mockEventType
      }
    })

    const button = wrapper.find('button')
    expect(button.attributes('aria-label')).toContain('Log Glass of Water')
  })
})
