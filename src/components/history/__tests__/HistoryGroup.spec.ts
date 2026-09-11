import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryGroup from '../HistoryGroup.vue'
import type { Occurrence, EventType } from '@/types/domain'
import { getLocalDateString } from '@/stores/tracker'

describe('HistoryGroup', () => {
  const sampleEventTypes: EventType[] = [
    {
      id: 'et-water',
      name: 'Glass of Water',
      icon: 'Droplet',
      colorBadge: 'sky',
      basePoints: 5,
      defaultUnit: 'glass',
      defaultIncrement: 1,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z'
    },
    {
      id: 'et-pushups',
      name: 'Set of 10 Push-ups',
      icon: 'Activity',
      colorBadge: 'emerald',
      basePoints: 10,
      defaultUnit: 'set',
      defaultIncrement: 1,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z'
    }
  ]

  const todayStr = getLocalDateString(new Date())

  const sampleOccurrences: Occurrence[] = [
    {
      id: 'occ-1',
      eventTypeId: 'et-water',
      timestamp: `${todayStr}T10:00:00.000Z`,
      quantity: 1,
      snapshot: {
        eventTypeName: 'Glass of Water',
        unit: 'glass',
        basePoints: 5,
        calculatedPoints: 5
      },
      createdAt: `${todayStr}T10:00:00.000Z`
    },
    {
      id: 'occ-2',
      eventTypeId: 'et-pushups',
      timestamp: `${todayStr}T11:00:00.000Z`,
      quantity: 2,
      snapshot: {
        eventTypeName: 'Set of 10 Push-ups',
        unit: 'set',
        basePoints: 10,
        calculatedPoints: 20
      },
      createdAt: `${todayStr}T11:00:00.000Z`
    }
  ]

  it('renders "Today" title and points summary for today occurrences', () => {
    const wrapper = mount(HistoryGroup, {
      props: {
        dateString: todayStr,
        occurrences: sampleOccurrences,
        eventTypes: sampleEventTypes,
        getTaxonomyPath: () => ''
      }
    })

    expect(wrapper.text()).toContain('Today')
    expect(wrapper.text()).toContain('2 items')
    expect(wrapper.text()).toContain('+25 pts')
  })

  it('renders "Yesterday" title for yesterday occurrences', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = getLocalDateString(yesterday)

    const wrapper = mount(HistoryGroup, {
      props: {
        dateString: yesterdayStr,
        occurrences: [
          {
            ...sampleOccurrences[0],
            timestamp: `${yesterdayStr}T10:00:00.000Z`
          }
        ],
        eventTypes: sampleEventTypes,
        getTaxonomyPath: () => ''
      }
    })

    expect(wrapper.text()).toContain('Yesterday')
    expect(wrapper.text()).toContain('1 item')
    expect(wrapper.text()).toContain('+5 pts')
  })

  it('emits edit and delete events when item actions are triggered', async () => {
    const wrapper = mount(HistoryGroup, {
      props: {
        dateString: todayStr,
        occurrences: sampleOccurrences,
        eventTypes: sampleEventTypes,
        getTaxonomyPath: () => ''
      }
    })

    const items = wrapper.findAllComponents({ name: 'HistoryTimelineItem' })
    expect(items.length).toBe(2)

    await items[0].vm.$emit('edit', sampleOccurrences[0])
    expect(wrapper.emitted('edit')?.[0]).toEqual([sampleOccurrences[0]])

    await items[0].vm.$emit('delete', sampleOccurrences[0])
    expect(wrapper.emitted('delete')?.[0]).toEqual([sampleOccurrences[0]])
  })
})
