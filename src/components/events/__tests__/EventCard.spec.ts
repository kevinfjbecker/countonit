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

  it('shows tap feedback animation overlay on click', async () => {
    const wrapper = mount(EventCard, {
      props: {
        eventType: mockEventType
      }
    })

    expect(wrapper.find('[data-testid="tap-feedback"]').exists()).toBe(false)
    const button = wrapper.find('button')
    await button.trigger('click')
    expect(wrapper.find('[data-testid="tap-feedback"]').exists()).toBe(true)
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

  it('renders a dedicated custom quantity trigger button with accessible label', () => {
    const wrapper = mount(EventCard, {
      props: {
        eventType: mockEventType
      }
    })

    const customBtn = wrapper.find('[data-testid="custom-quantity-button"]')
    expect(customBtn.exists()).toBe(true)
    expect(customBtn.attributes('aria-label')).toContain('Custom quantity')
  })

  it('emits custom-quantity event and does not emit tap when custom quantity button is clicked', async () => {
    const wrapper = mount(EventCard, {
      props: {
        eventType: mockEventType
      }
    })

    const customBtn = wrapper.find('[data-testid="custom-quantity-button"]')
    await customBtn.trigger('click')

    expect(wrapper.emitted('custom-quantity')).toBeTruthy()
    expect(wrapper.emitted('custom-quantity')![0]).toEqual([mockEventType])
    expect(wrapper.emitted('tap')).toBeFalsy()
  })

  it('emits custom-quantity on long-press and does not emit tap on subsequent click', async () => {
    const { vi } = await import('vitest')
    vi.useFakeTimers()

    const wrapper = mount(EventCard, {
      props: {
        eventType: mockEventType
      }
    })

    const card = wrapper.find('[data-testid="event-card-main"]')
    await card.trigger('pointerdown')

    vi.advanceTimersByTime(500)

    expect(wrapper.emitted('custom-quantity')).toBeTruthy()
    expect(wrapper.emitted('custom-quantity')![0]).toEqual([mockEventType])

    await card.trigger('click')
    expect(wrapper.emitted('tap')).toBeFalsy()

    vi.useRealTimers()
  })
})

