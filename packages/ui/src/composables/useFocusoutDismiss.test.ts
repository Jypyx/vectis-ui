import { describe, expect, it, vi } from 'vite-plus/test'
import { nextTick, ref } from 'vue'

import { useFocusoutDismiss } from './useFocusoutDismiss'

/**
 * The contract is entirely about WHERE the focus went, and both branches matter: a floating
 * panel stays a DOM descendant of the root even when painted in the top layer (so `contains` is
 * enough, with nothing to watch at document level), and a null `relatedTarget` is an exit too;
 * that is the case a naive `contains(next)` would treat as "still inside" and never close on.
 */
function setup() {
  const root = document.createElement('div')
  const inside = document.createElement('button')
  root.append(inside)
  document.body.append(root)

  const close = vi.fn()
  const onFocusout = useFocusoutDismiss(ref<HTMLElement | null>(root), close)
  return { root, inside, close, onFocusout }
}

/** A focusout as the browser sends it: dispatched FROM the element losing the focus. */
function focusout(from: Element, relatedTarget: EventTarget | null) {
  const event = new FocusEvent('focusout', { relatedTarget })
  from.dispatchEvent(event)
  return event
}

describe('useFocusoutDismiss', () => {
  it('closes when the focus leaves for an outside element', () => {
    const { inside, close, onFocusout } = setup()
    const outside = document.createElement('button')
    document.body.append(outside)

    onFocusout(focusout(inside, outside))
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('does not close while the focus stays inside the root', () => {
    const { inside, close, onFocusout } = setup()

    onFocusout(focusout(inside, inside))
    expect(close).not.toHaveBeenCalled()
  })

  it('closes on a null relatedTarget — leaving the window counts as leaving', async () => {
    const { inside, close, onFocusout } = setup()

    onFocusout(focusout(inside, null))
    await nextTick()
    expect(close).toHaveBeenCalledTimes(1)
  })

  // Chromium fires focusout from a focused element a re-render removes, with no destination.
  it('does not close when the focused element was removed and the focus came back inside', async () => {
    const { root, inside, close, onFocusout } = setup()
    const day = document.createElement('button')
    root.append(day)

    onFocusout(focusout(inside, null))
    inside.remove()
    day.focus()
    await nextTick()
    expect(close).not.toHaveBeenCalled()
  })

  it('closes when the focused element was removed and nothing took the focus back', async () => {
    const { inside, close, onFocusout } = setup()

    onFocusout(focusout(inside, null))
    inside.remove()
    await nextTick()
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('does not close for a panel painted in the top layer, still a DOM descendant', () => {
    const { root, close, onFocusout } = setup()
    // What a [popover] is: moved to the top layer, but never moved in the DOM tree.
    const panel = document.createElement('div')
    const option = document.createElement('button')
    panel.append(option)
    root.append(panel)

    onFocusout(focusout(option, option))
    expect(close).not.toHaveBeenCalled()
  })

  it('closes when the root ref is null — there is no inside to be in', () => {
    const close = vi.fn()
    const onFocusout = useFocusoutDismiss(ref<HTMLElement | null>(null), close)

    const from = document.createElement('button')
    onFocusout(focusout(from, document.createElement('button')))
    expect(close).toHaveBeenCalledTimes(1)
  })
})
