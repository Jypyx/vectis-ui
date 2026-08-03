import { afterEach, describe, expect, it } from 'vitest'

import { arrowNavigate, navigableItems } from './arrowNav'

const SELECTOR = 'button:not(:disabled)'

function build(html: string): HTMLElement {
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  return container
}

function press(container: HTMLElement, key: string, options: { vertical?: boolean } = {}) {
  const event = new KeyboardEvent('keydown', { key, cancelable: true })
  const handled = arrowNavigate(event, container, navigableItems(container, SELECTOR), options)
  return { handled, prevented: event.defaultPrevented }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('navigableItems', () => {
  it('excludes the disabled and the hidden', () => {
    const container = build(`
      <button id="a"></button>
      <button id="b" disabled></button>
      <button id="c" style="display: none"></button>
      <button id="d"></button>
    `)
    expect(navigableItems(container, SELECTOR).map((el) => el.id)).toEqual(['a', 'd'])
  })
})

describe('arrowNavigate', () => {
  const three = '<button id="a"></button><button id="b"></button><button id="c"></button>'

  it('ignores unhandled keys without preventDefault', () => {
    const container = build(three)
    const { handled, prevented } = press(container, 'x')
    expect(handled).toBe(false)
    expect(prevented).toBe(false)
  })

  it('on the inline axis, ArrowDown/Up are not handled (and vice versa)', () => {
    const container = build(three)
    expect(press(container, 'ArrowDown').handled).toBe(false)
    expect(press(container, 'ArrowRight', { vertical: true }).handled).toBe(false)
  })

  it('consumes nothing when the list is empty', () => {
    const container = build('<button id="a" disabled></button>')
    const { handled, prevented } = press(container, 'ArrowRight')
    expect(handled).toBe(false)
    expect(prevented).toBe(false)
  })

  it('moves forward, backward and wraps at both ends', () => {
    const container = build(three)
    container.querySelector<HTMLElement>('#a')?.focus()
    press(container, 'ArrowRight')
    expect(document.activeElement?.id).toBe('b')
    press(container, 'ArrowLeft')
    expect(document.activeElement?.id).toBe('a')
    press(container, 'ArrowLeft')
    expect(document.activeElement?.id).toBe('c')
    press(container, 'ArrowRight')
    expect(document.activeElement?.id).toBe('a')
  })

  it('Home and End go to the ends', () => {
    const container = build(three)
    container.querySelector<HTMLElement>('#b')?.focus()
    press(container, 'End')
    expect(document.activeElement?.id).toBe('c')
    press(container, 'Home')
    expect(document.activeElement?.id).toBe('a')
  })

  it('with no focus in the list, both directions start from the first item', () => {
    const container = build(three)
    expect(document.activeElement?.id).not.toBe('a')
    press(container, 'ArrowRight')
    expect(document.activeElement?.id).toBe('a')

    // Going backward with no current focus starts from the first item, not the
    // second to last (the naive modulo `(-1 - 1 + n) % n` would give that one).
    document.body.querySelector<HTMLElement>('#a')?.blur()
    press(container, 'ArrowLeft')
    expect(document.activeElement?.id).toBe('a')
  })

  it('skips the disabled and hidden items', () => {
    const container = build(`
      <button id="a"></button>
      <button id="b" disabled></button>
      <button id="c" style="display: none"></button>
      <button id="d"></button>
    `)
    container.querySelector<HTMLElement>('#a')?.focus()
    press(container, 'ArrowRight')
    expect(document.activeElement?.id).toBe('d')
  })

  it('inverts the inline arrows in RTL, not the block arrows', () => {
    const container = build(three)
    container.dir = 'rtl'
    container.querySelector<HTMLElement>('#b')?.focus()
    press(container, 'ArrowRight')
    expect(document.activeElement?.id).toBe('a')

    container.querySelector<HTMLElement>('#b')?.focus()
    press(container, 'ArrowDown', { vertical: true })
    expect(document.activeElement?.id).toBe('c')
  })
})
