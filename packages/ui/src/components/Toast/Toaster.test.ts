import { fireEvent, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import Toaster from './Toaster.vue'
import { dismissToast, toast, toasts } from './state'

const getStack = (container: Element, placement: string) =>
  container.querySelector(`.v-toast-stack[data-placement='${placement}']`) as HTMLElement

describe('Toaster', () => {
  beforeEach(() => {
    dismissToast()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('ouvre la pile du placement par défaut à l’ajout d’un toast', async () => {
    const { container, getByText } = render(Toaster)
    const stack = getStack(container, 'bottom-right')
    expect(stack.hasAttribute('data-popover-open')).toBe(false)

    toast({ message: 'Enregistré' })
    await nextTick()
    expect(stack.hasAttribute('data-popover-open')).toBe(true)
    expect(getByText('Enregistré')).toBeTruthy()
  })

  it('le placement du toast prime sur la prop du Toaster', async () => {
    const { container } = render(Toaster, { props: { placement: 'top-left' } })
    toast({ message: 'A' })
    toast({ message: 'B', placement: 'bottom-center' })
    await nextTick()
    expect(getStack(container, 'top-left').hasAttribute('data-popover-open')).toBe(true)
    expect(getStack(container, 'bottom-center').hasAttribute('data-popover-open')).toBe(true)
    expect(getStack(container, 'bottom-right').hasAttribute('data-popover-open')).toBe(false)
  })

  it('ferme automatiquement après la durée par défaut (5000 ms) et referme la pile', async () => {
    const { container } = render(Toaster)
    toast({ message: 'Éphémère' })
    await nextTick()

    vi.advanceTimersByTime(4999)
    await nextTick()
    expect(toasts).toHaveLength(1)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(toasts).toHaveLength(0)
    expect(getStack(container, 'bottom-right').hasAttribute('data-popover-open')).toBe(false)
  })

  it('duration: 0 rend le toast persistant', async () => {
    render(Toaster)
    toast({ message: 'Persistant', duration: 0 })
    await nextTick()
    vi.advanceTimersByTime(60_000)
    await nextTick()
    expect(toasts).toHaveLength(1)
  })

  it('la prop duration du Toaster remplace le défaut ; duration du toast prime', async () => {
    render(Toaster, { props: { duration: 1000 } })
    toast({ message: 'Court' })
    toast({ message: 'Long', duration: 3000 })
    await nextTick()

    vi.advanceTimersByTime(1000)
    await nextTick()
    expect(toasts.map((item) => item.message)).toEqual(['Long'])

    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(toasts).toHaveLength(0)
  })

  it('le survol de la pile suspend les timers, le leave les réarme à la durée pleine', async () => {
    const { container } = render(Toaster)
    toast({ message: 'Survolé' })
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

  it('la croix retire le toast de la file', async () => {
    const { getByRole } = render(Toaster)
    toast({ message: 'À fermer', duration: 0 })
    await nextTick()

    await fireEvent.click(getByRole('button', { name: 'Fermer' }))
    expect(toasts).toHaveLength(0)
  })

  it('un toast émis AVANT le montage s’affiche au montage (et son timer démarre)', async () => {
    toast({ message: 'Précoce' })
    const { container, getByText } = render(Toaster)
    await nextTick()
    expect(getStack(container, 'bottom-right').hasAttribute('data-popover-open')).toBe(true)
    expect(getByText('Précoce')).toBeTruthy()

    vi.advanceTimersByTime(5000)
    await nextTick()
    expect(toasts).toHaveLength(0)
  })

  it('pose role="region" et le label accessible sur les piles', () => {
    const { container } = render(Toaster, { props: { label: 'Alertes' } })
    const stack = getStack(container, 'bottom-right')
    expect(stack.getAttribute('role')).toBe('region')
    expect(stack.getAttribute('aria-label')).toBe('Alertes')
  })
})
