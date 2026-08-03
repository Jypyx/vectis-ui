import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VToast from './VToast.vue'
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
  render(VToast, { props: { item: makeItem(overrides), closeLabel: 'Close' } })

describe('VToast (internal card)', () => {
  it('role="status" (polite) except danger/warning, which take role="alert"', () => {
    // several renders in the same test: the attribute is read on each root
    const roleOf = (tone: ToastItem['tone']) =>
      (renderToast({ tone }).container.firstElementChild as HTMLElement).getAttribute('role')
    expect(roleOf('neutral')).toBe('status')
    expect(roleOf('success')).toBe('status')
    expect(roleOf('danger')).toBe('alert')
    expect(roleOf('warning')).toBe('alert')
  })

  it('sets data-tone and data-variant for the CSS', () => {
    const { container } = renderToast({ tone: 'success', variant: 'solid' })
    const root = container.firstElementChild as HTMLElement
    expect(root.dataset.tone).toBe('success')
    expect(root.dataset.variant).toBe('solid')
  })

  it("displays the tone's default icon", () => {
    const { container } = renderToast({ tone: 'success' })
    expect(container.querySelector<HTMLElement>('.v-toast-icon')?.dataset.icon).toBe('check_circle')
  })

  it("icon: a custom name replaces the tone's icon", () => {
    const { container } = renderToast({ icon: 'rocket' })
    expect(container.querySelector<HTMLElement>('.v-toast-icon')?.dataset.icon).toBe('rocket')
  })

  it('icon: `{ src }` rendered as an image', () => {
    const { container } = renderToast({ icon: { src: 'https://example.test/icon.svg' } })
    const img = container.querySelector('.v-toast-icon img') as HTMLImageElement
    expect(img.getAttribute('src')).toBe('https://example.test/icon.svg')
  })

  it('icon: false displays no icon at all', () => {
    const { container } = renderToast({ icon: false })
    expect(container.querySelector('.v-toast-icon')).toBeNull()
  })

  it('optional title: rendered only when supplied', () => {
    const { container } = renderToast()
    expect(container.querySelector('.v-toast-title')).toBeNull()

    const withTitle = renderToast({ title: 'Well done' })
    expect(withTitle.container.querySelector('.v-toast-title')?.textContent).toBe('Well done')
  })

  it('closable: the cross emits close with the id; closable: false hides it', async () => {
    const { getByRole, emitted } = renderToast({ id: 42 })
    await fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(emitted('close')).toEqual([[42]])

    const { container } = renderToast({ closable: false })
    expect(container.querySelector('button')).toBeNull()
  })

  it('width is set as the --toast-width custom property', () => {
    const { container } = renderToast({ width: '30rem' })
    const root = container.firstElementChild as HTMLElement
    expect(root.style.getPropertyValue('--toast-width')).toBe('30rem')
  })
})
