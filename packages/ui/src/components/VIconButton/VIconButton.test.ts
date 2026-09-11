import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VIconButton from './VIconButton.vue'

describe('VIconButton', () => {
  it('exposes the accessible label through aria-label', () => {
    const { getByRole } = render(VIconButton, {
      props: { label: 'Close the panel' },
      slots: { default: '<svg aria-hidden="true" />' },
    })
    const button = getByRole('button', { name: 'Close the panel' })
    expect(button.classList.contains('v-icon-button')).toBe(true)
    expect(button.classList.contains('v-button')).toBe(true)
  })

  it('forwards variant/tone/size to the underlying VButton', () => {
    const { getByRole } = render(VIconButton, {
      props: { label: 'Add', variant: 'solid', tone: 'accent', size: 'sm' },
      slots: { default: '<svg aria-hidden="true" />' },
    })
    const button = getByRole('button')
    expect(button.dataset.variant).toBe('solid')
    expect(button.dataset.tone).toBe('accent')
    expect(button.dataset.size).toBe('sm')
  })

  it('icon prop: renders a decorative VIcon with the ligature (no slot)', () => {
    const { getByRole } = render(VIconButton, {
      props: { label: 'Favourite', icon: 'favorite' },
    })
    const button = getByRole('button', { name: 'Favourite' })
    const icon = button.querySelector('.v-icon') as HTMLElement
    expect(icon).not.toBeNull()
    expect(icon.textContent).toBe('favorite')
    expect(icon.getAttribute('aria-hidden')).toBe('true')
    expect(icon.hasAttribute('data-filled')).toBe(false)
  })

  it('iconFilled prop: sets data-filled on the icon', () => {
    const { getByRole } = render(VIconButton, {
      props: { label: 'Favourite', icon: 'favorite', iconFilled: true },
    })
    const icon = getByRole('button').querySelector('.v-icon') as HTMLElement
    expect(icon.hasAttribute('data-filled')).toBe(true)
  })

  /*
   * The icon has to REPLACE itself with the spinner rather than sit beside it: the box
   * is one control high and one control wide, so two glyphs in it overlap. It is what
   * pins the icon to VButton's `start` slot, the only one loading swaps out.
   */
  it('loading: the spinner replaces the icon rather than joining it', () => {
    const { getByRole } = render(VIconButton, {
      props: { label: 'Refreshing', icon: 'favorite', loading: true },
    })
    const button = getByRole('button')
    expect(button.querySelector('.v-button-spinner')).not.toBeNull()
    expect(button.querySelector('.v-icon')).toBeNull()
  })

  it('loading: the spinner replaces the slot too', () => {
    const { getByRole } = render(VIconButton, {
      props: { label: 'Refreshing', loading: true },
      slots: { default: '<svg data-testid="slot-svg" aria-hidden="true" />' },
    })
    const button = getByRole('button')
    expect(button.querySelector('.v-button-spinner')).not.toBeNull()
    expect(button.querySelector('[data-testid="slot-svg"]')).toBeNull()
  })

  it('without the icon prop: the default slot is rendered (fallback)', () => {
    const { getByRole } = render(VIconButton, {
      props: { label: 'Close' },
      slots: { default: '<svg data-testid="slot-svg" aria-hidden="true" />' },
    })
    const button = getByRole('button', { name: 'Close' })
    expect(button.querySelector('[data-testid="slot-svg"]')).not.toBeNull()
  })

  it('supports every variant/tone and forwards compact', () => {
    const { getByRole } = render(VIconButton, {
      props: { label: 'Confirm', variant: 'soft', tone: 'danger', compact: true },
      slots: { default: '<svg aria-hidden="true" />' },
    })
    const button = getByRole('button')
    expect(button.dataset.variant).toBe('soft')
    expect(button.dataset.tone).toBe('danger')
    expect(button.dataset.compact).toBe('')
  })

  /* `elevated` has to be forwarded EXPLICITLY: VIconButton renders a VButton, so an
     unforwarded prop lands in $attrs and never reaches the data attribute. */
  it('forwards elevated to the VButton', () => {
    const { getByRole } = render(VIconButton, {
      props: { label: 'Confirm', elevated: true },
      slots: { default: '<svg aria-hidden="true" />' },
    })
    expect(getByRole('button').dataset.elevated).toBe('')
  })

  it('shape: mirrored as data-shape, square by default', () => {
    const { getByRole, rerender } = render(VIconButton, {
      props: { label: 'Next' },
      slots: { default: '<svg aria-hidden="true" />' },
    })
    const button = getByRole('button')
    expect(button.dataset.shape).toBe('square')
    return rerender({ shape: 'circular' }).then(() => {
      expect(button.dataset.shape).toBe('circular')
    })
  })
})
