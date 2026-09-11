import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EditOccurrenceModal from '../EditOccurrenceModal.vue'
import type { Occurrence } from '@/types/domain'

describe('EditOccurrenceModal', () => {
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
      calculatedPoints: 10
    },
    createdAt: '2026-09-11T14:30:00.000Z'
  }

  it('renders occurrence data when open and shows calculated points preview', () => {
    const wrapper = mount(EditOccurrenceModal, {
      props: {
        modelValue: true,
        occurrence: sampleOccurrence
      }
    })

    expect(wrapper.find('[data-testid="edit-modal"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Edit Glass of Water')
    expect(wrapper.text()).toContain('+10 pts')
  })

  it('updates calculated points dynamically when quantity changes', async () => {
    const wrapper = mount(EditOccurrenceModal, {
      props: {
        modelValue: true,
        occurrence: sampleOccurrence
      }
    })

    const qtyInput = wrapper.find('input[data-testid="edit-quantity-input"]')
    await qtyInput.setValue('4')

    // Base point is 5 -> 5 * 4 = 20 pts
    expect(wrapper.text()).toContain('+20 pts')
  })

  it('emits save event with updated quantity and timestamp', async () => {
    const wrapper = mount(EditOccurrenceModal, {
      props: {
        modelValue: true,
        occurrence: sampleOccurrence
      }
    })

    await wrapper.find('input[data-testid="edit-quantity-input"]').setValue('3')
    await wrapper.find('input[data-testid="edit-datetime-input"]').setValue('2026-09-10T10:00')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.emitted('save')).toBeTruthy()
    const emitted = wrapper.emitted('save')?.[0]?.[0] as any
    expect(emitted.id).toBe('occ-1')
    expect(emitted.quantity).toBe(3)
    expect(new Date(emitted.timestamp).toISOString()).toBe(new Date('2026-09-10T10:00').toISOString())
  })
})
