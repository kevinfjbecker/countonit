import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EventTypeEditorModal from '../EventTypeEditorModal.vue'
import type { EventType, TaxonomyNode, CreateEventTypeDto } from '@/types/domain'

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
    subtypes: [
      { id: 'sub-1', name: 'Sparkling Water', pointOverride: 6, quantityOverride: 1 },
      { id: 'sub-2', name: 'Tap Water', pointOverride: null, quantityOverride: 2 }
    ],
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

  it('renders configured subtypes and empty state when none exist', () => {
    // Empty state in create mode
    const createWrapper = mount(EventTypeEditorModal, {
      props: {
        modelValue: true,
        eventType: null,
        taxonomyNodes: sampleTaxonomyNodes
      }
    })

    expect(createWrapper.find('[data-testid="subtypes-section"]').exists()).toBe(true)
    expect(createWrapper.find('[data-testid="subtypes-empty"]').exists()).toBe(true)

    // Configured subtypes in edit mode
    const editWrapper = mount(EventTypeEditorModal, {
      props: {
        modelValue: true,
        eventType: sampleEventType,
        taxonomyNodes: sampleTaxonomyNodes
      }
    })

    expect(editWrapper.find('[data-testid="subtypes-section"]').exists()).toBe(true)
    expect(editWrapper.find('[data-testid="subtypes-empty"]').exists()).toBe(false)
    expect(editWrapper.find('[data-testid="subtype-item-sub-1"]').exists()).toBe(true)
    expect(editWrapper.find('[data-testid="subtype-item-sub-1"]').text()).toContain('Sparkling Water')
    expect(editWrapper.find('[data-testid="subtype-item-sub-1"]').text()).toContain('+6 pts')
    expect(editWrapper.find('[data-testid="subtype-item-sub-2"]').exists()).toBe(true)
    expect(editWrapper.find('[data-testid="subtype-item-sub-2"]').text()).toContain('Tap Water')
    expect(editWrapper.find('[data-testid="subtype-item-sub-2"]').text()).toContain('Qty: 2')
  })

  it('allows adding a new subtype with validation', async () => {
    const wrapper = mount(EventTypeEditorModal, {
      props: {
        modelValue: true,
        eventType: sampleEventType,
        taxonomyNodes: sampleTaxonomyNodes
      }
    })

    // Click "Add Subtype" button
    const addBtn = wrapper.find('[data-testid="add-subtype-btn"]')
    expect(addBtn.exists()).toBe(true)
    await addBtn.trigger('click')

    // Subtype form should be visible
    expect(wrapper.find('[data-testid="subtype-form"]').exists()).toBe(true)

    // Attempt to submit with empty name
    const saveSubtypeBtn = wrapper.find('[data-testid="save-subtype-btn"]')
    await saveSubtypeBtn.trigger('click')

    expect(wrapper.find('[data-testid="subtype-error"]').text()).toContain('Subtype name is required')

    // Fill in valid data with point and quantity overrides
    await wrapper.find('[data-testid="subtype-name-input"]').setValue('Mineral Water')
    await wrapper.find('[data-testid="subtype-points-input"]').setValue(8)
    await wrapper.find('[data-testid="subtype-quantity-input"]').setValue(2)
    await saveSubtypeBtn.trigger('click')

    // Subtype form should close and new item should appear
    expect(wrapper.find('[data-testid="subtype-form"]').exists()).toBe(false)
    const items = wrapper.findAll('[data-testid^="subtype-item-"]')
    expect(items).toHaveLength(3)
    const lastItem = items[2]
    expect(lastItem.text()).toContain('Mineral Water')
    expect(lastItem.text()).toContain('+8 pts')
    expect(lastItem.text()).toContain('Qty: 2')

    // Add another subtype without point/quantity overrides (inherits defaults)
    await wrapper.find('[data-testid="add-subtype-btn"]').trigger('click')
    await wrapper.find('[data-testid="subtype-name-input"]').setValue('Boiled Water')
    await wrapper.find('[data-testid="save-subtype-btn"]').trigger('click')

    const updatedItems = wrapper.findAll('[data-testid^="subtype-item-"]')
    expect(updatedItems).toHaveLength(4)
    const boiledItem = updatedItems[3]
    expect(boiledItem.text()).toContain('Boiled Water')
    expect(boiledItem.text()).toContain('Default (+5 pts)')
  })

  it('allows editing and deleting an existing subtype', async () => {
    const wrapper = mount(EventTypeEditorModal, {
      props: {
        modelValue: true,
        eventType: sampleEventType,
        taxonomyNodes: sampleTaxonomyNodes
      }
    })

    // Edit sub-1
    const editBtn = wrapper.find('[data-testid="edit-subtype-sub-1"]')
    expect(editBtn.exists()).toBe(true)
    await editBtn.trigger('click')

    expect(wrapper.find('[data-testid="subtype-form"]').exists()).toBe(true)
    const nameInput = wrapper.find<HTMLInputElement>('[data-testid="subtype-name-input"]')
    expect(nameInput.element.value).toBe('Sparkling Water')
    const pointsInput = wrapper.find<HTMLInputElement>('[data-testid="subtype-points-input"]')
    expect(pointsInput.element.value).toBe('6')
    const qtyInput = wrapper.find<HTMLInputElement>('[data-testid="subtype-quantity-input"]')
    expect(qtyInput.element.value).toBe('1')

    await nameInput.setValue('San Pellegrino')
    await pointsInput.setValue(7)
    await qtyInput.setValue(2)
    await wrapper.find('[data-testid="save-subtype-btn"]').trigger('click')

    const updatedItem = wrapper.find('[data-testid="subtype-item-sub-1"]')
    expect(updatedItem.text()).toContain('San Pellegrino')
    expect(updatedItem.text()).toContain('+7 pts')
    expect(updatedItem.text()).toContain('Qty: 2')

    // Delete sub-2
    const deleteBtn = wrapper.find('[data-testid="delete-subtype-sub-2"]')
    expect(deleteBtn.exists()).toBe(true)
    await deleteBtn.trigger('click')

    expect(wrapper.find('[data-testid="subtype-item-sub-2"]').exists()).toBe(false)
    const items = wrapper.findAll('[data-testid^="subtype-item-"]')
    expect(items).toHaveLength(1)
  })

  it('allows reordering subtypes and emits subtypes on save', async () => {
    const wrapper = mount(EventTypeEditorModal, {
      props: {
        modelValue: true,
        eventType: sampleEventType,
        taxonomyNodes: sampleTaxonomyNodes
      }
    })

    // Initial order: sub-1, sub-2
    let items = wrapper.findAll('[data-testid^="subtype-item-"]')
    expect(items[0].attributes('data-testid')).toBe('subtype-item-sub-1')
    expect(items[1].attributes('data-testid')).toBe('subtype-item-sub-2')

    // Move down sub-1
    const moveDownBtn = wrapper.find('[data-testid="move-down-subtype-sub-1"]')
    expect(moveDownBtn.exists()).toBe(true)
    await moveDownBtn.trigger('click')

    // Order should now be: sub-2, sub-1
    items = wrapper.findAll('[data-testid^="subtype-item-"]')
    expect(items[0].attributes('data-testid')).toBe('subtype-item-sub-2')
    expect(items[1].attributes('data-testid')).toBe('subtype-item-sub-1')

    // Submit the form
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('save')).toBeTruthy()
    const emittedSave = wrapper.emitted('save')![0][0] as CreateEventTypeDto
    expect(emittedSave.subtypes).toHaveLength(2)
    expect(emittedSave.subtypes![0].id).toBe('sub-2')
    expect(emittedSave.subtypes![1].id).toBe('sub-1')
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
