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
  it('exclut les désactivés et les masqués', () => {
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

  it('ignore les touches non gérées sans preventDefault', () => {
    const container = build(three)
    const { handled, prevented } = press(container, 'x')
    expect(handled).toBe(false)
    expect(prevented).toBe(false)
  })

  it('sur l’axe inline, ArrowDown/Up ne sont pas gérées (et inversement)', () => {
    const container = build(three)
    expect(press(container, 'ArrowDown').handled).toBe(false)
    expect(press(container, 'ArrowRight', { vertical: true }).handled).toBe(false)
  })

  it('ne consomme rien quand la liste est vide', () => {
    const container = build('<button id="a" disabled></button>')
    const { handled, prevented } = press(container, 'ArrowRight')
    expect(handled).toBe(false)
    expect(prevented).toBe(false)
  })

  it('avance, recule et boucle aux deux extrémités', () => {
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

  it('Home et End vont aux extrémités', () => {
    const container = build(three)
    container.querySelector<HTMLElement>('#b')?.focus()
    press(container, 'End')
    expect(document.activeElement?.id).toBe('c')
    press(container, 'Home')
    expect(document.activeElement?.id).toBe('a')
  })

  it('sans focus dans la liste, les deux sens repartent du premier item', () => {
    const container = build(three)
    expect(document.activeElement?.id).not.toBe('a')
    press(container, 'ArrowRight')
    expect(document.activeElement?.id).toBe('a')

    // Le cas qui avait divergé dans MenuPanel : reculer sans focus courant
    // donnait l'AVANT-dernier item ((-1 - 1 + n) % n), pas le premier.
    document.body.querySelector<HTMLElement>('#a')?.blur()
    press(container, 'ArrowLeft')
    expect(document.activeElement?.id).toBe('a')
  })

  it('saute les items désactivés et masqués', () => {
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

  it('inverse les flèches inline en RTL, pas les flèches block', () => {
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
