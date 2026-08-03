import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import IconButton from './VIconButton.vue'

describe('IconButton', () => {
  it('expose le libellé accessible via aria-label', () => {
    const { getByRole } = render(IconButton, {
      props: { label: 'Fermer le panneau' },
      slots: { default: '<svg aria-hidden="true" />' },
    })
    const button = getByRole('button', { name: 'Fermer le panneau' })
    expect(button.classList.contains('v-icon-button')).toBe(true)
    expect(button.classList.contains('v-button')).toBe(true)
  })

  it('transmet variant/tone/size au Button sous-jacent', () => {
    const { getByRole } = render(IconButton, {
      props: { label: 'Ajouter', variant: 'solid', tone: 'accent', size: 'sm' },
      slots: { default: '<svg aria-hidden="true" />' },
    })
    const button = getByRole('button')
    expect(button.dataset.variant).toBe('solid')
    expect(button.dataset.tone).toBe('accent')
    expect(button.dataset.size).toBe('sm')
  })

  it('prop icon : rend une Icon décorative avec la ligature (sans slot)', () => {
    const { getByRole } = render(IconButton, {
      props: { label: 'Favori', icon: 'favorite' },
    })
    const button = getByRole('button', { name: 'Favori' })
    const icon = button.querySelector('.v-icon') as HTMLElement
    expect(icon).not.toBeNull()
    expect(icon.textContent).toBe('favorite')
    expect(icon.getAttribute('aria-hidden')).toBe('true')
    expect(icon.hasAttribute('data-filled')).toBe(false)
  })

  it('prop iconFilled : pose data-filled sur l’icône', () => {
    const { getByRole } = render(IconButton, {
      props: { label: 'Favori', icon: 'favorite', iconFilled: true },
    })
    const icon = getByRole('button').querySelector('.v-icon') as HTMLElement
    expect(icon.hasAttribute('data-filled')).toBe(true)
  })

  it('sans prop icon : le slot par défaut est rendu (fallback)', () => {
    const { getByRole } = render(IconButton, {
      props: { label: 'Fermer' },
      slots: { default: '<svg data-testid="slot-svg" aria-hidden="true" />' },
    })
    const button = getByRole('button', { name: 'Fermer' })
    expect(button.querySelector('[data-testid="slot-svg"]')).not.toBeNull()
  })

  it('supporte les nouveaux variants/tones et transmet compact', () => {
    const { getByRole } = render(IconButton, {
      props: { label: 'Valider', variant: 'tonal', tone: 'success', compact: true },
      slots: { default: '<svg aria-hidden="true" />' },
    })
    const button = getByRole('button')
    expect(button.dataset.variant).toBe('tonal')
    expect(button.dataset.tone).toBe('success')
    expect(button.dataset.compact).toBe('')
  })
})
