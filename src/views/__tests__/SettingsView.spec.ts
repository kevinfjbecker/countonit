import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SettingsView from '../SettingsView.vue'
import { useTrackerStore } from '@/stores/tracker'
import { InMemoryStorageAdapter } from '@/storage/InMemoryStorageAdapter'

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
})
