import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import { useEscapeDismiss } from './useEscapeDismiss'

function mountDismiss() {
  const onEscape = vi.fn()
  let listen!: (active: boolean) => void
  const wrapper = render(
    defineComponent({
      setup() {
        listen = useEscapeDismiss(onEscape)
        return () => h('div')
      },
    }),
  )
  return { listen, onEscape, unmount: wrapper.unmount }
}

const press = (key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init })
  document.dispatchEvent(event)
  return event
}

describe('useEscapeDismiss', () => {
  it('hears Escape on the document only while active, and spends it', () => {
    const { listen, onEscape } = mountDismiss()
    press('Escape')
    expect(onEscape).not.toHaveBeenCalled()

    listen(true)
    const event = press('Escape')
    expect(onEscape).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)

    press('Enter')
    listen(false)
    press('Escape')
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('leaves an Escape already spent by something else alone', () => {
    const { listen, onEscape } = mountDismiss()
    listen(true)
    const spend = (event: Event) => event.preventDefault()
    document.addEventListener('keydown', spend, { capture: true })
    press('Escape')
    document.removeEventListener('keydown', spend, { capture: true })
    expect(onEscape).not.toHaveBeenCalled()
  })

  it('switching on twice listens once, and unmounting stops listening', () => {
    const { listen, onEscape, unmount } = mountDismiss()
    listen(true)
    listen(true)
    press('Escape')
    expect(onEscape).toHaveBeenCalledTimes(1)
    unmount()
    press('Escape')
    expect(onEscape).toHaveBeenCalledTimes(1)
  })
})
