import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EventTypeEditorModal from '../EventTypeEditorModal.vue'
import type { EventType, TaxonomyNode } from '@/types/domain'

describe('EventTypeEditorModal', () => {
  const sampleTaxonomyNodes: TaxonomyNode[] = [
    {
      id: 'tax-1',
      name: 'Hydration',
      parentId: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'tax-2',
      name: 'Fitness',
      parentId: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    }
  ]

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

  it('renders modal with default values in create mode', () => {
    const wrapper = mount(EventTypeEditorModal, {
      props: {
        modelValue: true,
        eventType: null,
        taxonomyNodes: sampleTaxonomyNodes
      }
    })

    expect(wrapper.find('[data-testid="editor-modal"]').exists()).toBe(true)
    expect(wrapper.find('#editor-modal-title').text()).toContain('New Event Type')

    const nameInput = wrapper.find<HTMLInputElement>('[data-testid="event-type-name-input"]')
    expect(nameInput.element.value).toBe('')

    const unitInput = wrapper.find<HTMLInputElement>('[data-testid="event-type-unit-input"]')
    expect(unitInput.element.value).toBe('times')
  })

  it('renders modal with pre-populated values in edit mode', () => {
    const wrapper = mount(EventTypeEditorModal, {
      props: {
        modelValue: true,
        eventType: sampleEventType,
        taxonomyNodes: sampleTaxonomyNodes
      }
    })

    expect(wrapper.find('#editor-modal-title').text()).toContain('Edit Glass of Water')

    const nameInput = wrapper.find<HTMLInputElement>('[data-testid="event-type-name-input"]')
    expect(nameInput.element.value).toBe('Glass of Water')

    const pointsInput = wrapper.find<HTMLInputElement>('[data-testid="event-type-points-input"]')
    expect(pointsInput.element.value).toBe('5')

    const unitInput = wrapper.find<HTMLInputElement>('[data-testid="event-type-unit-input"]')
    expect(unitInput.element.value).toBe('glass')

    const freqInput = wrapper.find<HTMLInputElement>('[data-testid="event-type-frequency-input"]')
    expect(freqInput.element.value).toBe('8')

    const taxSelect = wrapper.find<HTMLSelectElement>('[data-testid="event-type-taxonomy-select"]')
    expect(taxSelect.element.value).toBe('tax-1')
  })

  it('validates required name field and prevents submitting when empty', async () => {
    const wrapper = mount(EventTypeEditorModal, {
      props: {
        modelValue: true,
        eventType: null,
        taxonomyNodes: sampleTaxonomyNodes
      }
    })

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.emitted('save')).toBeFalsy()
    expect(wrapper.text()).toContain('Name is required')
  })

  it('emits save event with valid DTO on create submit', async () => {
    const wrapper = mount(EventTypeEditorModal, {
      props: {
        modelValue: true,
        eventType: null,
        taxonomyNodes: sampleTaxonomyNodes
      }
    })

    await wrapper.find('[data-testid="event-type-name-input"]').setValue('Read Book')
    await wrapper.find('[data-testid="event-type-points-input"]').setValue(15)
    await wrapper.find('[data-testid="event-type-unit-input"]').setValue('pages')
    await wrapper.find('[data-testid="event-type-increment-input"]').setValue(10)
    await wrapper.find('[data-testid="event-type-frequency-input"]').setValue(1)
    await wrapper.find('[data-testid="event-type-taxonomy-select"]').setValue('tax-2')

    // Select color badge
    const violetBadgeBtn = wrapper.find('[data-testid="color-badge-violet"]')
    if (violetBadgeBtn.exists()) {
      await violetBadgeBtn.trigger('click')
    }

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(wrapper.emitted('save')).toBeTruthy()
    const emittedSave = wrapper.emitted('save')![0][0]
    expect(emittedSave).toMatchObject({
      name: 'Read Book',
      basePoints: 15,
      defaultUnit: 'pages',
      defaultIncrement: 10,
      targetFrequency: 1,
      taxonomyNodeId: 'tax-2',
      colorBadge: 'violet'
    })
  })

  it('emits update:modelValue false when cancel or close is clicked', async () => {
    const wrapper = mount(EventTypeEditorModal, {
      props: {
        modelValue: true,
        eventType: null,
        taxonomyNodes: sampleTaxonomyNodes
      }
    })

    const cancelBtn = wrapper.find('[data-testid="editor-cancel-btn"]')
    await cancelBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })
})
