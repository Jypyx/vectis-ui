import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useFocusoutDismiss } from './useFocusoutDismiss'

/**
 * The contract is entirely about WHERE the focus went, and both branches matter: a
 * floating panel stays a DOM descendant of the root even when painted in the top
 * layer (so `contains` is enough, with nothing to watch at document level), and a
 * null `relatedTarget` is an exit too — that is the case a naive `contains(next)`
 * would treat as "still inside" and never close on.
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

const focusout = (relatedTarget: EventTarget | null) =>
  new FocusEvent('focusout', { relatedTarget })

describe('useFocusoutDismiss', () => {
  it('closes when the focus leaves for an outside element', () => {
    const { close, onFocusout } = setup()
    const outside = document.createElement('button')
    document.body.append(outside)

    onFocusout(focusout(outside))
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('does not close while the focus stays inside the root', () => {
    const { inside, close, onFocusout } = setup()

    onFocusout(focusout(inside))
    expect(close).not.toHaveBeenCalled()
  })

  it('closes on a null relatedTarget — leaving the window counts as leaving', () => {
    const { close, onFocusout } = setup()

    onFocusout(focusout(null))
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('does not close for a panel painted in the top layer, still a DOM descendant', () => {
    const { root, close, onFocusout } = setup()
    // What a [popover] is: moved to the top layer, but never moved in the DOM tree.
    const panel = document.createElement('div')
    const option = document.createElement('button')
    panel.append(option)
    root.append(panel)

    onFocusout(focusout(option))
    expect(close).not.toHaveBeenCalled()
  })

  it('closes when the root ref is null — there is no inside to be in', () => {
    const close = vi.fn()
    const onFocusout = useFocusoutDismiss(ref<HTMLElement | null>(null), close)

    onFocusout(focusout(document.createElement('button')))
    expect(close).toHaveBeenCalledTimes(1)
  })
})
