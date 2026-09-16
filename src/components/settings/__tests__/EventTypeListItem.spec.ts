import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EventTypeListItem from '../EventTypeListItem.vue'
import type { EventType } from '@/types/domain'

describe('EventTypeListItem', () => {
  const sampleEventType: EventType = {
    id: 'et-1',
    name: 'Glass of Water',
    icon: 'Droplet',
    colorBadge: 'sky',
    basePoints: 5,
    defaultUnit: 'glass',
    defaultIncrement: 1,
    targetFrequency: 8,
    taxonomyNodeId: 'tax-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }

  it('renders event type information correctly', () => {
    const wrapper = mount(EventTypeListItem, {
      props: {
        eventType: sampleEventType,
        taxonomyPath: 'Health > Hydration'
      }
    })

    expect(wrapper.text()).toContain('Glass of Water')
    expect(wrapper.text()).toContain('+5 pts')
    expect(wrapper.text()).toContain('glass')
    expect(wrapper.text()).toContain('8x / day')
    expect(wrapper.text()).toContain('Health > Hydration')
  })

  it('handles negative points and missing target frequency', () => {
    const negativeEvent: EventType = {
      ...sampleEventType,
      name: 'Cup of Coffee',
      basePoints: -2,
      targetFrequency: null
    }

    const wrapper = mount(EventTypeListItem, {
      props: {
        eventType: negativeEvent
      }
    })

    expect(wrapper.text()).toContain('Cup of Coffee')
    expect(wrapper.text()).toContain('-2 pts')
    expect(wrapper.find('[data-testid="target-frequency-badge"]').exists()).toBe(false)
  })

  it('emits edit event with eventType when edit button is clicked', async () => {
    const wrapper = mount(EventTypeListItem, {
      props: {
        eventType: sampleEventType
      }
    })

    const editBtn = wrapper.find('[data-testid="edit-event-type-btn"]')
    expect(editBtn.exists()).toBe(true)
    await editBtn.trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')![0]).toEqual([sampleEventType])
  })
})
