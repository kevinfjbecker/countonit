import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuantityStepperModal from '../QuantityStepperModal.vue'
import type { EventType } from '@/types/domain'

describe('QuantityStepperModal', () => {
  const mockEventType: EventType = {
    id: 'et-pushups',
    name: 'Pushups',
    icon: 'Activity',
    colorBadge: 'emerald',
    basePoints: 1,
    defaultUnit: 'reps',
    defaultIncrement: 10,
    targetFrequency: 50,
    taxonomyNodeId: null,
    subtypes: [],
    archived: false,
    sortOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }

  it('renders modal with event details and initial defaultIncrement quantity', () => {
    const wrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: mockEventType
      }
    })

    expect(wrapper.find('[data-testid="quantity-modal"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Pushups')
    expect(wrapper.text()).toContain('reps')

    const input = wrapper.find<HTMLInputElement>('[data-testid="quantity-input"]')
    expect(input.exists()).toBe(true)
    expect(input.element.value).toBe('10')
  })

  it('increments and decrements quantity by defaultIncrement', async () => {
    const wrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: mockEventType
      }
    })

    const incBtn = wrapper.find('[data-testid="quantity-increment-btn"]')
    const decBtn = wrapper.find('[data-testid="quantity-decrement-btn"]')
    const input = wrapper.find<HTMLInputElement>('[data-testid="quantity-input"]')

    await incBtn.trigger('click')
    expect(input.element.value).toBe('20')

    await decBtn.trigger('click')
    expect(input.element.value).toBe('10')
  })

  it('allows direct numeric input and updates calculated points', async () => {
    const wrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: mockEventType
      }
    })

    const input = wrapper.find<HTMLInputElement>('[data-testid="quantity-input"]')
    await input.setValue('25')

    // Base point is 1, quantity is 25 => +25 pts
    const submitBtn = wrapper.find('[data-testid="quantity-submit-button"]')
    expect(submitBtn.text()).toContain('Log 25 reps (+25 pts)')
  })

  it('recalculates points properly for negative base points', async () => {
    const negativeEventType: EventType = {
      ...mockEventType,
      id: 'et-smoke',
      name: 'Cigarette',
      basePoints: -5,
      defaultUnit: 'cigarettes',
      defaultIncrement: 1
    }

    const wrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: negativeEventType
      }
    })

    const input = wrapper.find<HTMLInputElement>('[data-testid="quantity-input"]')
    await input.setValue('3')

    const submitBtn = wrapper.find('[data-testid="quantity-submit-button"]')
    expect(submitBtn.text()).toContain('Log 3 cigarettes (-15 pts)')
  })

  it('submits the custom quantity and event type', async () => {
    const wrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: mockEventType
      }
    })

    const input = wrapper.find<HTMLInputElement>('[data-testid="quantity-input"]')
    await input.setValue('35')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')![0]).toEqual([
      {
        eventType: mockEventType,
        quantity: 35,
        subtypeId: null
      }
    ])
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('closes modal when close button is clicked', async () => {
    const wrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: mockEventType
      }
    })

    const closeBtn = wrapper.find('[data-testid="quantity-modal-close"]')
    await closeBtn.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('renders subtype selection list when Event Type has configured Subtypes', () => {
    const eventTypeWithSubtypes: EventType = {
      ...mockEventType,
      id: 'et-coffee',
      name: 'Coffee',
      basePoints: 2,
      defaultUnit: 'cup',
      defaultIncrement: 1,
      subtypes: [
        { id: 'sub-espresso', name: 'Espresso', pointOverride: 5 },
        { id: 'sub-coldbrew', name: 'Cold Brew', pointOverride: 8, quantityOverride: 2 }
      ]
    }

    const wrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: eventTypeWithSubtypes
      }
    })

    expect(wrapper.find('[data-testid="subtype-selection"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="subtype-option-none"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="subtype-option-sub-espresso"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="subtype-option-sub-coldbrew"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Espresso')
    expect(wrapper.text()).toContain('Cold Brew')
  })

  it('does not render subtype selection list when Event Type has no subtypes', () => {
    const wrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: mockEventType
      }
    })

    expect(wrapper.find('[data-testid="subtype-selection"]').exists()).toBe(false)
  })

  it('updates effective points and calculated points preview when a Subtype is selected', async () => {
    const eventTypeWithSubtypes: EventType = {
      ...mockEventType,
      id: 'et-coffee',
      name: 'Coffee',
      basePoints: 2,
      defaultUnit: 'cup',
      defaultIncrement: 1,
      subtypes: [
        { id: 'sub-espresso', name: 'Espresso', pointOverride: 5 },
        { id: 'sub-coldbrew', name: 'Cold Brew', pointOverride: 8, quantityOverride: 2 }
      ]
    }

    const wrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: eventTypeWithSubtypes
      }
    })

    // Initial base points is 2, quantity is 1 => +2 pts
    const submitBtn = wrapper.find('[data-testid="quantity-submit-button"]')
    expect(submitBtn.text()).toContain('Log 1 cup (+2 pts)')

    // Click Espresso subtype (+5 pts override)
    const espressoBtn = wrapper.find('[data-testid="subtype-option-sub-espresso"]')
    await espressoBtn.trigger('click')

    // Base point preview is now 5, quantity 1 => +5 pts
    expect(submitBtn.text()).toContain('Log 1 cup (+5 pts)')

    // Increase quantity to 3 => +15 pts (5 * 3)
    const input = wrapper.find<HTMLInputElement>('[data-testid="quantity-input"]')
    await input.setValue('3')
    expect(submitBtn.text()).toContain('Log 3 cup (+15 pts)')

    // Click Standard / None option -> reverts to base points 2 => +6 pts (2 * 3)
    const standardBtn = wrapper.find('[data-testid="subtype-option-none"]')
    await standardBtn.trigger('click')
    expect(submitBtn.text()).toContain('Log 3 cup (+6 pts)')
  })

  it('updates quantity when a Subtype with quantityOverride is selected', async () => {
    const eventTypeWithSubtypes: EventType = {
      ...mockEventType,
      id: 'et-coffee',
      name: 'Coffee',
      basePoints: 2,
      defaultUnit: 'cup',
      defaultIncrement: 1,
      subtypes: [
        { id: 'sub-coldbrew', name: 'Cold Brew', pointOverride: 8, quantityOverride: 2 }
      ]
    }

    const wrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: eventTypeWithSubtypes
      }
    })

    const input = wrapper.find<HTMLInputElement>('[data-testid="quantity-input"]')
    expect(input.element.value).toBe('1')

    // Click Cold Brew subtype (quantityOverride: 2, pointOverride: 8)
    const coldbrewBtn = wrapper.find('[data-testid="subtype-option-sub-coldbrew"]')
    await coldbrewBtn.trigger('click')

    expect(input.element.value).toBe('2')
    const submitBtn = wrapper.find('[data-testid="quantity-submit-button"]')
    expect(submitBtn.text()).toContain('Log 2 cup (+16 pts)')
  })

  it('submits selected subtypeId along with eventType and quantity', async () => {
    const eventTypeWithSubtypes: EventType = {
      ...mockEventType,
      id: 'et-coffee',
      name: 'Coffee',
      basePoints: 2,
      defaultUnit: 'cup',
      defaultIncrement: 1,
      subtypes: [
        { id: 'sub-espresso', name: 'Espresso', pointOverride: 5 }
      ]
    }

    const wrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: eventTypeWithSubtypes
      }
    })

    // Select Espresso
    await wrapper.find('[data-testid="subtype-option-sub-espresso"]').trigger('click')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')![0]).toEqual([
      {
        eventType: eventTypeWithSubtypes,
        quantity: 1,
        subtypeId: 'sub-espresso'
      }
    ])
  })
})
