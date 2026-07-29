import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Toast from './Toast.vue'
import type { ToastItem } from './state'

const makeItem = (overrides: Partial<ToastItem> = {}): ToastItem => ({
  id: 1,
  message: 'Message',
  tone: 'neutral',
  variant: 'tonal',
  closable: true,
  ...overrides,
})

const renderToast = (overrides: Partial<ToastItem> = {}) =>
  render(Toast, { props: { item: makeItem(overrides), closeLabel: 'Fermer' } })

describe('Toast (carte interne)', () => {
  it('role="status" (poli) sauf danger/warning en role="alert"', () => {
    // plusieurs rendus dans le même test : on lit l'attribut sur chaque racine
    const roleOf = (tone: ToastItem['tone']) =>
      (renderToast({ tone }).container.firstElementChild as HTMLElement).getAttribute('role')
    expect(roleOf('neutral')).toBe('status')
    expect(roleOf('success')).toBe('status')
    expect(roleOf('danger')).toBe('alert')
    expect(roleOf('warning')).toBe('alert')
  })

  it('pose data-tone et data-variant pour le CSS', () => {
    const { container } = renderToast({ tone: 'success', variant: 'solid' })
    const root = container.firstElementChild as HTMLElement
    expect(root.dataset.tone).toBe('success')
    expect(root.dataset.variant).toBe('solid')
  })

  it("affiche l'icône par défaut du tone", () => {
    const { container } = renderToast({ tone: 'success' })
    expect(container.querySelector<HTMLElement>('.ds-toast-icon')?.dataset.icon).toBe(
      'check_circle',
    )
  })

  it("icon: nom personnalisé remplace l'icône du tone", () => {
    const { container } = renderToast({ icon: 'rocket' })
    expect(container.querySelector<HTMLElement>('.ds-toast-icon')?.dataset.icon).toBe('rocket')
  })

  it('icon: `{ src }` rendu en image', () => {
    const { container } = renderToast({ icon: { src: 'https://example.test/icon.svg' } })
    const img = container.querySelector('.ds-toast-icon img') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('https://example.test/icon.svg')
  })

  it("icon: false n'affiche aucune icône", () => {
    const { container } = renderToast({ icon: false })
    expect(container.querySelector('.ds-toast-icon')).toBeNull()
  })

  it('titre optionnel : rendu seulement s’il est fourni', () => {
    const { container } = renderToast()
    expect(container.querySelector('.ds-toast-title')).toBeNull()

    const withTitle = renderToast({ title: 'Bravo' })
    expect(withTitle.container.querySelector('.ds-toast-title')?.textContent).toBe('Bravo')
  })

  it('closable: la croix émet close avec l’id ; closable: false la masque', async () => {
    const { getByRole, emitted } = renderToast({ id: 42 })
    await fireEvent.click(getByRole('button', { name: 'Fermer' }))
    expect(emitted('close')).toEqual([[42]])

    const { container } = renderToast({ closable: false })
    expect(container.querySelector('button')).toBeNull()
  })

  it('width est posée en custom property --_width', () => {
    const { container } = renderToast({ width: '30rem' })
    const root = container.firstElementChild as HTMLElement
    expect(root.style.getPropertyValue('--_width')).toBe('30rem')
  })
})
