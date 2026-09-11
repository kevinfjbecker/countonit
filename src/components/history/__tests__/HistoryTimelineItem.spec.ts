import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryTimelineItem from '../HistoryTimelineItem.vue'
import type { Occurrence, EventType } from '@/types/domain'

describe('HistoryTimelineItem', () => {
  const sampleEventType: EventType = {
    id: 'et-water',
    name: 'Glass of Water',
    icon: 'Droplet',
    colorBadge: 'sky',
    basePoints: 5,
    defaultUnit: 'glass',
    defaultIncrement: 1,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  }

  const sampleOccurrence: Occurrence = {
    id: 'occ-1',
    eventTypeId: 'et-water',
    timestamp: '2026-09-11T14:30:00.000Z',
    quantity: 2,
    subtypeId: null,
    subtypeName: null,
    snapshot: {
      eventTypeName: 'Glass of Water',
      unit: 'glass',
      basePoints: 5,
      calculatedPoints: 10,
      taxonomyNodeId: 'tax-hydration'
    },
    createdAt: '2026-09-11T14:30:00.000Z'
  }

  it('renders snapshot event type name, quantity, unit, and calculated points badge', () => {
    const wrapper = mount(HistoryTimelineItem, {
      props: {
        occurrence: sampleOccurrence,
        eventType: sampleEventType,
        taxonomyPath: 'Health > Hydration'
      }
    })

    expect(wrapper.text()).toContain('Glass of Water')
    expect(wrapper.text()).toContain('2 glasses')
    expect(wrapper.text()).toContain('+10 pts')
    expect(wrapper.text()).toContain('Health > Hydration')
  })

  it('renders subtype badge when occurrence has a subtype', () => {
    const coffeeOccurrence: Occurrence = {
      ...sampleOccurrence,
      id: 'occ-2',
      eventTypeId: 'et-coffee',
      subtypeId: 'sub-espresso',
      subtypeName: 'Espresso',
      quantity: 1,
      snapshot: {
        eventTypeName: 'Cup of Coffee',
        unit: 'cup',
        basePoints: 3,
        calculatedPoints: 3,
        taxonomyNodeId: null
      }
    }

    const wrapper = mount(HistoryTimelineItem, {
      props: {
        occurrence: coffeeOccurrence,
        eventType: {
          ...sampleEventType,
          name: 'Cup of Coffee',
          icon: 'Coffee',
          colorBadge: 'amber'
        }
      }
    })

    expect(wrapper.text()).toContain('Cup of Coffee')
    expect(wrapper.text()).toContain('Espresso')
    expect(wrapper.text()).toContain('1 cup')
    expect(wrapper.text()).toContain('+3 pts')
  })

  it('formats negative point values appropriately', () => {
    const negativeOccurrence: Occurrence = {
      ...sampleOccurrence,
      snapshot: {
        ...sampleOccurrence.snapshot,
        calculatedPoints: -5
      }
    }

    const wrapper = mount(HistoryTimelineItem, {
      props: {
        occurrence: negativeOccurrence,
        eventType: sampleEventType
      }
    })

    expect(wrapper.text()).toContain('-5 pts')
  })

  it('emits edit event when edit button is clicked', async () => {
    const wrapper = mount(HistoryTimelineItem, {
      props: {
        occurrence: sampleOccurrence,
        eventType: sampleEventType
      }
    })

    const editBtn = wrapper.find('button[aria-label*="Edit"]')
    expect(editBtn.exists()).toBe(true)

    await editBtn.trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')?.[0]).toEqual([sampleOccurrence])
  })

  it('emits delete event when delete button is clicked', async () => {
    const wrapper = mount(HistoryTimelineItem, {
      props: {
        occurrence: sampleOccurrence,
        eventType: sampleEventType
      }
    })

    const deleteBtn = wrapper.find('button[aria-label*="Delete"]')
    expect(deleteBtn.exists()).toBe(true)

    await deleteBtn.trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')?.[0]).toEqual([sampleOccurrence])
  })
})
