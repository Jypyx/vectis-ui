import { fireEvent, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import VToaster from './VToaster.vue'
import { dismissToast, toast, toasts } from './state'

const getStack = (container: Element, placement: string) =>
  container.querySelector(`.v-toast-stack[data-placement='${placement}']`) as HTMLElement

describe('VToaster', () => {
  beforeEach(() => {
    dismissToast()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens the default placement stack when a toast is added', async () => {
    const { container, getByText } = render(VToaster)
    const stack = getStack(container, 'bottom-right')
    expect(stack.hasAttribute('data-popover-open')).toBe(false)

    toast({ message: 'Saved' })
    await nextTick()
    expect(stack.hasAttribute('data-popover-open')).toBe(true)
    expect(getByText('Saved')).toBeTruthy()
  })

  it("the toast's placement wins over the VToaster's prop", async () => {
    const { container } = render(VToaster, { props: { placement: 'top-left' } })
    toast({ message: 'A' })
    toast({ message: 'B', placement: 'bottom-center' })
    await nextTick()
    expect(getStack(container, 'top-left').hasAttribute('data-popover-open')).toBe(true)
    expect(getStack(container, 'bottom-center').hasAttribute('data-popover-open')).toBe(true)
    expect(getStack(container, 'bottom-right').hasAttribute('data-popover-open')).toBe(false)
  })

  it('dismisses automatically after the default duration (5000 ms) and closes the stack', async () => {
    const { container } = render(VToaster)
    toast({ message: 'Ephemeral' })
    await nextTick()

    vi.advanceTimersByTime(4999)
    await nextTick()
    expect(toasts).toHaveLength(1)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(toasts).toHaveLength(0)
    expect(getStack(container, 'bottom-right').hasAttribute('data-popover-open')).toBe(false)
  })

  it('duration: 0 makes the toast persistent', async () => {
    render(VToaster)
    toast({ message: 'Persistent', duration: 0 })
    await nextTick()
    vi.advanceTimersByTime(60_000)
    await nextTick()
    expect(toasts).toHaveLength(1)
  })

  it("the VToaster's duration prop replaces the default; the toast's duration wins", async () => {
    render(VToaster, { props: { duration: 1000 } })
    toast({ message: 'Short' })
    toast({ message: 'Long', duration: 3000 })
    await nextTick()

    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(toasts.map((item) => item.message)).toEqual(['Long'])

    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(toasts).toHaveLength(0)
  })

  it('hovering the stack suspends the timers, leaving re-arms them at the full duration', async () => {
    const { container } = render(VToaster)
    toast({ message: 'Hovered' })
    await nextTick()
    const stack = getStack(container, 'bottom-right')

    stack.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(60_000)
    await nextTick()
    expect(toasts).toHaveLength(1)

    stack.dispatchEvent(new Event('pointerleave'))
    vi.advanceTimersByTime(4999)
    await nextTick()
    expect(toasts).toHaveLength(1)
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(toasts).toHaveLength(0)
  })

  it('the cross removes the toast from the queue', async () => {
    const { getByRole } = render(VToaster)
    toast({ message: 'To be closed', duration: 0 })
    await nextTick()

    await fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(toasts).toHaveLength(0)
  })

  it('a toast emitted BEFORE mounting shows up on mount (and its timer starts)', async () => {
    toast({ message: 'Early' })
    const { container, getByText } = render(VToaster)
    await nextTick()
    expect(getStack(container, 'bottom-right').hasAttribute('data-popover-open')).toBe(true)
    expect(getByText('Early')).toBeTruthy()

    vi.advanceTimersByTime(5000)
    await nextTick()
    expect(toasts).toHaveLength(0)
  })

  it('sets role="region" and the accessible label on the stacks', () => {
    const { container } = render(VToaster, { props: { label: 'Alerts' } })
    const stack = getStack(container, 'bottom-right')
    expect(stack.getAttribute('role')).toBe('region')
    expect(stack.getAttribute('aria-label')).toBe('Alerts')
  })
})
