import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SettingsView from '../SettingsView.vue'
import { useTrackerStore } from '@/stores/tracker'
import { InMemoryStorageAdapter } from '@/storage/InMemoryStorageAdapter'
import QuantityStepperModal from '@/components/events/QuantityStepperModal.vue'

describe('SettingsView - Event Type Management', () => {
  let store: ReturnType<typeof useTrackerStore>
  let storage: InMemoryStorageAdapter

  beforeEach(async () => {
    setActivePinia(createPinia())
    storage = new InMemoryStorageAdapter()
    store = useTrackerStore()
    await store.initialize(storage)
  })

  it('renders all active event types in settings', () => {
    const wrapper = mount(SettingsView)

    expect(wrapper.text()).toContain('Event Types')
    expect(wrapper.text()).toContain('Add New')

    // Starter event types should be present
    expect(wrapper.text()).toContain('Glass of Water')
    expect(wrapper.text()).toContain('Cup of Coffee')
    expect(wrapper.text()).toContain('Set of 10 Push-ups')
    expect(wrapper.text()).toContain('Floss Teeth')
    expect(wrapper.text()).toContain('Haircut / Shave')
  })

  it('opens create modal when Add New button is clicked', async () => {
    const wrapper = mount(SettingsView)

    expect(wrapper.find('[data-testid="editor-modal"]').exists()).toBe(false)

    const addBtn = wrapper.find('[data-testid="add-event-type-btn"]')
    await addBtn.trigger('click')

    expect(wrapper.find('[data-testid="editor-modal"]').exists()).toBe(true)
    expect(wrapper.find('#editor-modal-title').text()).toContain('New Event Type')
  })

  it('adds a new event type when submitted from create modal', async () => {
    const wrapper = mount(SettingsView)

    const addBtn = wrapper.find('[data-testid="add-event-type-btn"]')
    await addBtn.trigger('click')

    await wrapper.find('[data-testid="event-type-name-input"]').setValue('Morning Meditation')
    await wrapper.find('[data-testid="event-type-points-input"]').setValue(12)
    await wrapper.find('[data-testid="event-type-unit-input"]').setValue('session')
    await wrapper.find('[data-testid="event-type-frequency-input"]').setValue(1)

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    // Modal closes
    expect(wrapper.find('[data-testid="editor-modal"]').exists()).toBe(false)

    // Store has the new event type
    const created = store.eventTypes.find(e => e.name === 'Morning Meditation')
    expect(created).toBeDefined()
    expect(created?.basePoints).toBe(12)
    expect(created?.defaultUnit).toBe('session')
    expect(created?.targetFrequency).toBe(1)

    // New item is rendered in the list
    expect(wrapper.text()).toContain('Morning Meditation')
  })

  it('opens edit modal pre-populated when Edit button on item is clicked and updates store on save', async () => {
    const wrapper = mount(SettingsView)

    // Find the edit button for 'Glass of Water'
    const editBtns = wrapper.findAll('[data-testid="edit-event-type-btn"]')
    expect(editBtns.length).toBeGreaterThan(0)
    await editBtns[0].trigger('click')

    expect(wrapper.find('[data-testid="editor-modal"]').exists()).toBe(true)
    expect(wrapper.find('#editor-modal-title').text()).toContain('Edit Glass of Water')

    const nameInput = wrapper.find<HTMLInputElement>('[data-testid="event-type-name-input"]')
    expect(nameInput.element.value).toBe('Glass of Water')

    // Update name and points
    await nameInput.setValue('Sparkling Water')
    await wrapper.find('[data-testid="event-type-points-input"]').setValue(7)

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    // Check store update
    const water = store.eventTypes.find(e => e.id === 'seed-et-water')
    expect(water?.name).toBe('Sparkling Water')
    expect(water?.basePoints).toBe(7)

    expect(wrapper.text()).toContain('Sparkling Water')
  })

  it('saves configured subtypes from editor and renders them immediately in quick-log sheet', async () => {
    const wrapper = mount(SettingsView)

    // Find the edit button for 'Cup of Coffee'
    const coffeeItem = wrapper.findAllComponents({ name: 'EventTypeListItem' })
      .find(c => c.props('eventType').id === 'seed-et-coffee')
    expect(coffeeItem).toBeDefined()
    const editBtn = coffeeItem!.find('[data-testid="edit-event-type-btn"]')
    await editBtn.trigger('click')

    // Modal should be open with existing coffee subtypes
    expect(wrapper.find('[data-testid="editor-modal"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="subtype-item-seed-sub-espresso"]').exists()).toBe(true)

    // Add new subtype "Decaf" with 1 pt override
    await wrapper.find('[data-testid="add-subtype-btn"]').trigger('click')
    await wrapper.find('[data-testid="subtype-name-input"]').setValue('Decaf')
    await wrapper.find('[data-testid="subtype-points-input"]').setValue(1)
    await wrapper.find('[data-testid="subtype-quantity-input"]').setValue(1)
    await wrapper.find('[data-testid="save-subtype-btn"]').trigger('click')

    // Save event type
    await wrapper.find('form').trigger('submit.prevent')

    // Verify store has the updated subtypes
    const updatedCoffee = store.eventTypes.find(e => e.id === 'seed-et-coffee')!
    expect(updatedCoffee.subtypes).toHaveLength(3)
    const decafSubtype = updatedCoffee.subtypes?.find(s => s.name === 'Decaf')
    expect(decafSubtype).toBeDefined()
    expect(decafSubtype?.pointOverride).toBe(1)

    // Render Quick-Log sheet (QuantityStepperModal) with updated event type
    const quickLogWrapper = mount(QuantityStepperModal, {
      props: {
        modelValue: true,
        eventType: updatedCoffee
      }
    })

    // Quick-Log sheet should render the Decaf subtype button immediately
    expect(quickLogWrapper.find(`[data-testid="subtype-option-${decafSubtype!.id}"]`).exists()).toBe(true)
    expect(quickLogWrapper.text()).toContain('Decaf')
    expect(quickLogWrapper.text()).toContain('+1 pts')
  })
})
