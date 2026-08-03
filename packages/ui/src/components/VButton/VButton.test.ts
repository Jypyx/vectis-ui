import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VButton from './VButton.vue'

describe('VButton', () => {
  it('renders the label and the variant data-attributes', () => {
    const { getByRole } = render(VButton, {
      props: { variant: 'outline', tone: 'danger', size: 'lg' },
      slots: { default: 'Delete' },
    })
    const button = getByRole('button', { name: 'Delete' })
    expect(button.dataset.variant).toBe('outline')
    expect(button.dataset.tone).toBe('danger')
    expect(button.dataset.size).toBe('lg')
    expect(button.getAttribute('type')).toBe('button')
  })

  it('supports every variant/tone and sets data-compact', () => {
    const { getByRole } = render(VButton, {
      props: { variant: 'tonal', tone: 'warning', compact: true },
      slots: { default: 'Warning' },
    })
    const button = getByRole('button')
    expect(button.dataset.variant).toBe('tonal')
    expect(button.dataset.tone).toBe('warning')
    expect(button.dataset.compact).toBe('')
  })

  it('without compact: no data-compact', () => {
    const { getByRole } = render(VButton, { slots: { default: 'Ok' } })
    expect(getByRole('button').dataset.compact).toBeUndefined()
  })

  it('when loading: disabled, aria-busy, spinner present', () => {
    const { getByRole } = render(VButton, {
      props: { loading: true },
      slots: { default: 'Send' },
    })
    const button = getByRole('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button.getAttribute('aria-busy')).toBe('true')
    // the VSpinner is rendered inside the box, hidden from AT (aria-busy is enough)
    const box = button.querySelector('.v-button-spinner') as HTMLElement
    expect(box.getAttribute('aria-hidden')).toBe('true')
    expect(box.querySelector('.v-spinner')).not.toBeNull()
  })

  it('lets the native attributes through (fallthrough)', () => {
    const { getByRole } = render(VButton, {
      attrs: { name: 'action', form: 'my-form' },
      slots: { default: 'Ok' },
    })
    const button = getByRole('button')
    expect(button.getAttribute('name')).toBe('action')
    expect(button.getAttribute('form')).toBe('my-form')
  })

  it('iconStart/iconEnd: decorative icons, the accessible name is the label alone', () => {
    const { getByRole } = render(VButton, {
      props: { iconStart: 'add', iconEnd: 'arrow_forward' },
      slots: { default: 'Add' },
    })
    const button = getByRole('button', { name: 'Add' })
    const icons = Array.from(button.querySelectorAll('.v-icon'))
    expect(icons).toHaveLength(2)
    expect(icons.map((icon) => icon.textContent)).toEqual(['add', 'arrow_forward'])
    expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true)
  })

  it('iconFilled: sets data-filled on iconStart and iconEnd, absent by default', () => {
    const filled = render(VButton, {
      props: { iconStart: 'add', iconEnd: 'arrow_forward', iconFilled: true },
      slots: { default: 'Add' },
    })
    const filledIcons = Array.from(filled.container.querySelectorAll('.v-icon'))
    expect(filledIcons).toHaveLength(2)
    expect(filledIcons.every((icon) => icon.hasAttribute('data-filled'))).toBe(true)

    const outline = render(VButton, {
      props: { iconStart: 'add', iconEnd: 'arrow_forward' },
      slots: { default: 'Add' },
    })
    const outlineIcons = Array.from(outline.container.querySelectorAll('.v-icon'))
    expect(outlineIcons).toHaveLength(2)
    expect(outlineIcons.some((icon) => icon.hasAttribute('data-filled'))).toBe(false)
  })

  it('when loading: the spinner replaces iconStart, iconEnd stays visible', () => {
    const { getByRole } = render(VButton, {
      props: { loading: true, iconStart: 'add', iconEnd: 'arrow_forward' },
      slots: { default: 'Send' },
    })
    const button = getByRole('button')
    expect(button.querySelector('.v-button-spinner')).not.toBeNull()
    const icons = Array.from(button.querySelectorAll('.v-icon'))
    expect(icons.map((icon) => icon.textContent)).toEqual(['arrow_forward'])
  })

  it('the #start slot wins over iconStart', () => {
    const { getByRole } = render(VButton, {
      props: { iconStart: 'add' },
      slots: { default: 'Add', start: '<svg data-testid="custom" aria-hidden="true" />' },
    })
    const button = getByRole('button')
    expect(button.querySelector('[data-testid="custom"]')).not.toBeNull()
    expect(button.querySelector('.v-icon')).toBeNull()
  })

  it('with href: renders an <a> link with no type and no disabled', () => {
    const { getByRole } = render(VButton, {
      props: { href: 'https://example.com' },
      attrs: { target: '_blank', rel: 'noreferrer' },
      slots: { default: 'Documentation' },
    })
    const link = getByRole('link', { name: 'Documentation' })
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('https://example.com')
    expect(link.getAttribute('type')).toBeNull()
    expect(link.getAttribute('disabled')).toBeNull()
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noreferrer')
  })

  it('disabled link: inert (no href, aria-disabled, click filtered out)', async () => {
    const onClick = vi.fn()
    const { container } = render(VButton, {
      props: { href: 'https://example.com', disabled: true },
      attrs: { onClick },
      slots: { default: 'Disabled link' },
    })
    const anchor = container.querySelector('a.v-button') as HTMLAnchorElement
    expect(anchor).not.toBeNull()
    expect(anchor.getAttribute('href')).toBeNull()
    expect(anchor.getAttribute('aria-disabled')).toBe('true')
    anchor.click()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('loading link: inert + aria-busy + spinner', () => {
    const { container } = render(VButton, {
      props: { href: 'https://example.com', loading: true },
      slots: { default: 'Sending…' },
    })
    const anchor = container.querySelector('a.v-button') as HTMLAnchorElement
    expect(anchor.getAttribute('href')).toBeNull()
    expect(anchor.getAttribute('aria-disabled')).toBe('true')
    expect(anchor.getAttribute('aria-busy')).toBe('true')
    expect(anchor.querySelector('.v-button-spinner')).not.toBeNull()
  })
})
