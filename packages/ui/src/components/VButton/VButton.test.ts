import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VButton from './VButton.vue'

describe('VButton', () => {
  it('rend le libellé et les data-attributes de variante', () => {
    const { getByRole } = render(VButton, {
      props: { variant: 'outline', tone: 'danger', size: 'lg' },
      slots: { default: 'Supprimer' },
    })
    const button = getByRole('button', { name: 'Supprimer' })
    expect(button.dataset.variant).toBe('outline')
    expect(button.dataset.tone).toBe('danger')
    expect(button.dataset.size).toBe('lg')
    expect(button.getAttribute('type')).toBe('button')
  })

  it('supporte les nouveaux variants/tones et pose data-compact', () => {
    const { getByRole } = render(VButton, {
      props: { variant: 'tonal', tone: 'warning', compact: true },
      slots: { default: 'Attention' },
    })
    const button = getByRole('button')
    expect(button.dataset.variant).toBe('tonal')
    expect(button.dataset.tone).toBe('warning')
    expect(button.dataset.compact).toBe('')
  })

  it('sans compact : pas de data-compact', () => {
    const { getByRole } = render(VButton, { slots: { default: 'Ok' } })
    expect(getByRole('button').dataset.compact).toBeUndefined()
  })

  it('en loading : désactivé, aria-busy, spinner présent', () => {
    const { getByRole } = render(VButton, {
      props: { loading: true },
      slots: { default: 'Envoyer' },
    })
    const button = getByRole('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button.getAttribute('aria-busy')).toBe('true')
    // le composant VSpinner est rendu dans la boîte, masqué aux AT (aria-busy suffit)
    const box = button.querySelector('.v-button-spinner') as HTMLElement
    expect(box.getAttribute('aria-hidden')).toBe('true')
    expect(box.querySelector('.v-spinner')).not.toBeNull()
  })

  it('laisse passer les attributs natifs (fallthrough)', () => {
    const { getByRole } = render(VButton, {
      attrs: { name: 'action', form: 'mon-formulaire' },
      slots: { default: 'Ok' },
    })
    const button = getByRole('button')
    expect(button.getAttribute('name')).toBe('action')
    expect(button.getAttribute('form')).toBe('mon-formulaire')
  })

  it('iconStart/iconEnd : icônes décoratives, nom accessible = libellé seul', () => {
    const { getByRole } = render(VButton, {
      props: { iconStart: 'add', iconEnd: 'arrow_forward' },
      slots: { default: 'Ajouter' },
    })
    const button = getByRole('button', { name: 'Ajouter' })
    const icons = Array.from(button.querySelectorAll('.v-icon'))
    expect(icons).toHaveLength(2)
    expect(icons.map((icon) => icon.textContent)).toEqual(['add', 'arrow_forward'])
    expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true)
  })

  it('iconFilled : pose data-filled sur iconStart et iconEnd, absent par défaut', () => {
    const plein = render(VButton, {
      props: { iconStart: 'add', iconEnd: 'arrow_forward', iconFilled: true },
      slots: { default: 'Ajouter' },
    })
    const iconsPleins = Array.from(plein.container.querySelectorAll('.v-icon'))
    expect(iconsPleins).toHaveLength(2)
    expect(iconsPleins.every((icon) => icon.hasAttribute('data-filled'))).toBe(true)

    const contour = render(VButton, {
      props: { iconStart: 'add', iconEnd: 'arrow_forward' },
      slots: { default: 'Ajouter' },
    })
    const iconsContour = Array.from(contour.container.querySelectorAll('.v-icon'))
    expect(iconsContour).toHaveLength(2)
    expect(iconsContour.some((icon) => icon.hasAttribute('data-filled'))).toBe(false)
  })

  it('en loading : le spinner remplace iconStart, iconEnd reste affiché', () => {
    const { getByRole } = render(VButton, {
      props: { loading: true, iconStart: 'add', iconEnd: 'arrow_forward' },
      slots: { default: 'Envoyer' },
    })
    const button = getByRole('button')
    expect(button.querySelector('.v-button-spinner')).not.toBeNull()
    const icons = Array.from(button.querySelectorAll('.v-icon'))
    expect(icons.map((icon) => icon.textContent)).toEqual(['arrow_forward'])
  })

  it('le slot #start prime sur iconStart', () => {
    const { getByRole } = render(VButton, {
      props: { iconStart: 'add' },
      slots: { default: 'Ajouter', start: '<svg data-testid="custom" aria-hidden="true" />' },
    })
    const button = getByRole('button')
    expect(button.querySelector('[data-testid="custom"]')).not.toBeNull()
    expect(button.querySelector('.v-icon')).toBeNull()
  })

  it('avec href : rend un lien <a> sans type ni disabled', () => {
    const { getByRole } = render(VButton, {
      props: { href: 'https://exemple.fr' },
      attrs: { target: '_blank', rel: 'noreferrer' },
      slots: { default: 'Documentation' },
    })
    const link = getByRole('link', { name: 'Documentation' })
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('https://exemple.fr')
    expect(link.getAttribute('type')).toBeNull()
    expect(link.getAttribute('disabled')).toBeNull()
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noreferrer')
  })

  it('lien désactivé : inerte (sans href, aria-disabled, click filtré)', async () => {
    const onClick = vi.fn()
    const { container } = render(VButton, {
      props: { href: 'https://exemple.fr', disabled: true },
      attrs: { onClick },
      slots: { default: 'Lien désactivé' },
    })
    const anchor = container.querySelector('a.v-button') as HTMLAnchorElement
    expect(anchor).not.toBeNull()
    expect(anchor.getAttribute('href')).toBeNull()
    expect(anchor.getAttribute('aria-disabled')).toBe('true')
    anchor.click()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('lien en loading : inerte + aria-busy + spinner', () => {
    const { container } = render(VButton, {
      props: { href: 'https://exemple.fr', loading: true },
      slots: { default: 'Envoi…' },
    })
    const anchor = container.querySelector('a.v-button') as HTMLAnchorElement
    expect(anchor.getAttribute('href')).toBeNull()
    expect(anchor.getAttribute('aria-disabled')).toBe('true')
    expect(anchor.getAttribute('aria-busy')).toBe('true')
    expect(anchor.querySelector('.v-button-spinner')).not.toBeNull()
  })
})
