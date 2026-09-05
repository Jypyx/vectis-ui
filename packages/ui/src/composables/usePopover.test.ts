import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { usePopover } from './usePopover'

/**
 * The invariants tested here are the ones every popover in the design system rests
 * on, and none of them is visible from a component test: `shown` is fed BY THE DOM,
 * and the idempotence guards are what stop `hidePopover()` throwing
 * `InvalidStateError` on an already-closed popover.
 *
 * The element is a hand-made double rather than the global jsdom stub: the point is
 * to observe exactly which calls the composable makes, and in which state it
 * refuses to make them.
 */
function popoverEl() {
  const el = document.createElement('div')
  const showPopover = vi.fn()
  const hidePopover = vi.fn()
  Object.assign(el, { showPopover, hidePopover })
  return { el: ref(el as HTMLElement | null), showPopover, hidePopover }
}

/** What the browser emits on the popover element itself; ToggleEvents do not bubble. */
const toggleEvent = (newState: 'open' | 'closed') =>
  Object.assign(new Event('beforetoggle'), { newState }) as Event

describe('usePopover', () => {
  it('starts closed and only opens once the DOM says so', () => {
    const { el, showPopover } = popoverEl()
    const { shown, show, syncShown } = usePopover(el)

    expect(shown.value).toBe(false)
    show()
    expect(showPopover).toHaveBeenCalledTimes(1)
    // The call alone does NOT move the state: it is the event that does.
    expect(shown.value).toBe(false)

    syncShown(toggleEvent('open'))
    expect(shown.value).toBe(true)
  })

  it('does not call showPopover on an already-open popover', () => {
    const { el, showPopover } = popoverEl()
    const { show, syncShown } = usePopover(el)

    syncShown(toggleEvent('open'))
    show()
    expect(showPopover).not.toHaveBeenCalled()
  })

  it('does not call hidePopover on an already-closed popover', () => {
    const { el, hidePopover } = popoverEl()
    const { hide } = usePopover(el)

    // Without the guard this throws InvalidStateError in a real browser.
    hide()
    expect(hidePopover).not.toHaveBeenCalled()
  })

  it('follows a light dismiss, which nothing in the component asked for', () => {
    const { el, hidePopover } = popoverEl()
    const { shown, syncShown, hide } = usePopover(el)

    syncShown(toggleEvent('open'))
    expect(shown.value).toBe(true)

    // The platform closed it on its own (click outside, Escape).
    syncShown(toggleEvent('closed'))
    expect(shown.value).toBe(false)

    // …so a later hide() is a no-op rather than a throw.
    hide()
    expect(hidePopover).not.toHaveBeenCalled()
  })

  it('passes the invoker as `source` on a programmatic open', () => {
    const { el, showPopover } = popoverEl()
    const { show } = usePopover(el)
    const invoker = document.createElement('button')

    show(invoker)
    // Without `source` the panel loses its implicit anchor and its place in the stack.
    expect(showPopover).toHaveBeenCalledWith({ source: invoker })
  })

  /*
   * The browser throws when asked to open a popover while it is already busy with another
   * one, and a component has no way to know it is in that position: the focus a closing
   * panel hands back to its invoker arrives from INSIDE the browser's own hide, and
   * whatever answers that focus calls show() from there. The retry is a microtask, which
   * runs once that operation is over.
   */
  it('retries an opening the browser refused mid-operation', async () => {
    const { el, showPopover } = popoverEl()
    const { show } = usePopover(el)
    showPopover.mockImplementationOnce(() => {
      throw new DOMException('Invalid to show a popover during another show operation')
    })

    expect(() => show()).not.toThrow()
    expect(showPopover).toHaveBeenCalledTimes(1)

    await Promise.resolve()
    expect(showPopover).toHaveBeenCalledTimes(2)
  })

  it('gives up after one retry rather than letting the error out', async () => {
    const { el, showPopover } = popoverEl()
    const { show } = usePopover(el)
    showPopover.mockImplementation(() => {
      throw new DOMException('nope')
    })

    show()
    await Promise.resolve()
    await Promise.resolve()
    // Two attempts and no third: an unopenable panel stays closed, it does not spin.
    expect(showPopover).toHaveBeenCalledTimes(2)
  })

  it('is inert while the element ref is null', () => {
    const el = ref<HTMLElement | null>(null)
    const { show, hide, shown } = usePopover(el)

    expect(() => {
      show()
      hide()
    }).not.toThrow()
    expect(shown.value).toBe(false)
  })
})
