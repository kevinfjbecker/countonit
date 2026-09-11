import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BackfillModal from '../BackfillModal.vue'
import type { EventType } from '@/types/domain'

describe('BackfillModal', () => {
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
      id: 'et-coffee',
      name: 'Cup of Coffee',
      icon: 'Coffee',
      colorBadge: 'amber',
      basePoints: 2,
      defaultUnit: 'cup',
      defaultIncrement: 1,
      subtypes: [
        { id: 'sub-espresso', name: 'Espresso', pointOverride: 3 },
        { id: 'sub-decaf', name: 'Decaf', pointOverride: 1 }
      ],
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z'
    }
  ]

  it('renders modal when modelValue is true and displays event types', () => {
    const wrapper = mount(BackfillModal, {
      props: {
        modelValue: true,
        eventTypes: sampleEventTypes
      }
    })

    expect(wrapper.find('[data-testid="backfill-modal"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Backfill Past Occurrence')
    expect(wrapper.text()).toContain('Glass of Water')
    expect(wrapper.text()).toContain('Cup of Coffee')
  })

  it('does not render modal when modelValue is false', () => {
    const wrapper = mount(BackfillModal, {
      props: {
        modelValue: false,
        eventTypes: sampleEventTypes
      }
    })

    expect(wrapper.find('[data-testid="backfill-modal"]').exists()).toBe(false)
  })

  it('shows subtype options when selecting an event type with subtypes', async () => {
    const wrapper = mount(BackfillModal, {
      props: {
        modelValue: true,
        eventTypes: sampleEventTypes
      }
    })

    // Select Coffee
    const select = wrapper.find('select[data-testid="event-type-select"]')
    await select.setValue('et-coffee')

    expect(wrapper.find('[data-testid="subtype-select"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Espresso')
    expect(wrapper.text()).toContain('Decaf')
  })

  it('submits occurrence with custom timestamp, quantity, and subtype', async () => {
    const wrapper = mount(BackfillModal, {
      props: {
        modelValue: true,
        eventTypes: sampleEventTypes
      }
    })

    // Select Coffee
    await wrapper.find('select[data-testid="event-type-select"]').setValue('et-coffee')
    // Select Espresso subtype
    await wrapper.find('select[data-testid="subtype-select"]').setValue('sub-espresso')
    // Set Quantity to 2
    const qtyInput = wrapper.find('input[data-testid="quantity-input"]')
    await qtyInput.setValue('2')
    // Set Custom Timestamp
    const datetimeInput = wrapper.find('input[data-testid="datetime-input"]')
    await datetimeInput.setValue('2026-09-05T09:15')

    // Submit form
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
    const emitted = wrapper.emitted('submit')?.[0]?.[0] as any
    expect(emitted.eventTypeId).toBe('et-coffee')
    expect(emitted.subtypeId).toBe('sub-espresso')
    expect(emitted.quantity).toBe(2)
    expect(new Date(emitted.timestamp).toISOString()).toBe(new Date('2026-09-05T09:15').toISOString())
  })

  it('closes modal on cancel button click or close button click', async () => {
    const wrapper = mount(BackfillModal, {
      props: {
        modelValue: true,
        eventTypes: sampleEventTypes
      }
    })

    const cancelBtn = wrapper.find('button[data-testid="cancel-btn"]')
    await cancelBtn.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })
})
