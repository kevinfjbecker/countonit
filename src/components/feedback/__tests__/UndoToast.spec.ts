import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UndoToast from '../UndoToast.vue'

describe('UndoToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders occurrence name and formatted positive points', () => {
    const wrapper = mount(UndoToast, {
      props: {
        modelValue: true,
        occurrenceId: 'occ-1',
        eventTypeName: 'Glass of Water',
        points: 5,
        durationMs: 5000
      }
    })

    expect(wrapper.text()).toContain('Logged Glass of Water')
    expect(wrapper.text()).toContain('+5 pts')
    expect(wrapper.find('button[aria-label="Undo"]').exists()).toBe(true)
  })

  it('renders formatted negative points correctly', () => {
    const wrapper = mount(UndoToast, {
      props: {
        modelValue: true,
        occurrenceId: 'occ-2',
        eventTypeName: 'Cup of Coffee',
        points: -2,
        durationMs: 5000
      }
    })

    expect(wrapper.text()).toContain('Logged Cup of Coffee')
    expect(wrapper.text()).toContain('-2 pts')
  })

  it('renders 0 pts without plus sign', () => {
    const wrapper = mount(UndoToast, {
      props: {
        modelValue: true,
        occurrenceId: 'occ-3',
        eventTypeName: 'Haircut',
        points: 0,
        durationMs: 5000
      }
    })

    expect(wrapper.text()).toContain('Logged Haircut')
    expect(wrapper.text()).toContain('0 pts')
  })

  it('emits undo event with occurrenceId and closes when Undo button is clicked', async () => {
    const wrapper = mount(UndoToast, {
      props: {
        modelValue: true,
        occurrenceId: 'occ-123',
        eventTypeName: 'Set of 10 Push-ups',
        points: 10,
        durationMs: 5000
      }
    })

    const undoBtn = wrapper.find('button[data-testid="undo-btn"]')
    expect(undoBtn.exists()).toBe(true)
    await undoBtn.trigger('click')

    expect(wrapper.emitted('undo')).toBeTruthy()
    expect(wrapper.emitted('undo')![0]).toEqual(['occ-123'])
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('auto-dismisses after durationMs elapses', async () => {
    const wrapper = mount(UndoToast, {
      props: {
        modelValue: true,
        occurrenceId: 'occ-456',
        eventTypeName: 'Floss Teeth',
        points: 5,
        durationMs: 5000
      }
    })

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    // Fast-forward time by 5000ms
    vi.advanceTimersByTime(5000)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    expect(wrapper.emitted('dismiss')).toBeTruthy()
  })

  it('resets countdown when occurrenceId prop changes', async () => {
    const wrapper = mount(UndoToast, {
      props: {
        modelValue: true,
        occurrenceId: 'occ-1',
        eventTypeName: 'Glass of Water',
        points: 5,
        durationMs: 5000
      }
    })

    // Advance 3 seconds
    vi.advanceTimersByTime(3000)
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    // Change prop to new occurrence
    await wrapper.setProps({
      occurrenceId: 'occ-2',
      eventTypeName: 'Set of 10 Push-ups',
      points: 10
    })

    // Advance another 3 seconds (total 6s from start, but 3s since new prop)
    vi.advanceTimersByTime(3000)
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    // Advance remaining 2 seconds
    vi.advanceTimersByTime(2000)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('allows manual dismissal via close button', async () => {
    const wrapper = mount(UndoToast, {
      props: {
        modelValue: true,
        occurrenceId: 'occ-1',
        eventTypeName: 'Glass of Water',
        points: 5,
        durationMs: 5000
      }
    })

    const closeBtn = wrapper.find('button[aria-label="Dismiss"]')
    expect(closeBtn.exists()).toBe(true)
    await closeBtn.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
    expect(wrapper.emitted('dismiss')).toBeTruthy()
  })
})
