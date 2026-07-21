import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import Button from './Button.vue'

describe('Button', () => {
  it('rend le libellé et les data-attributes de variante', () => {
    const { getByRole } = render(Button, {
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
    const { getByRole } = render(Button, {
      props: { variant: 'tonal', tone: 'warning', compact: true },
      slots: { default: 'Attention' },
    })
    const button = getByRole('button')
    expect(button.dataset.variant).toBe('tonal')
    expect(button.dataset.tone).toBe('warning')
    expect(button.dataset.compact).toBe('')
  })

  it('sans compact : pas de data-compact', () => {
    const { getByRole } = render(Button, { slots: { default: 'Ok' } })
    expect(getByRole('button').dataset.compact).toBeUndefined()
  })

  it('en loading : désactivé, aria-busy, spinner présent', () => {
    const { getByRole } = render(Button, {
      props: { loading: true },
      slots: { default: 'Envoyer' },
    })
    const button = getByRole('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(button.querySelector('.ds-button-spinner')).not.toBeNull()
  })

  it('laisse passer les attributs natifs (fallthrough)', () => {
    const { getByRole } = render(Button, {
      attrs: { name: 'action', form: 'mon-formulaire' },
      slots: { default: 'Ok' },
    })
    const button = getByRole('button')
    expect(button.getAttribute('name')).toBe('action')
    expect(button.getAttribute('form')).toBe('mon-formulaire')
  })

  it('iconStart/iconEnd : icônes décoratives, nom accessible = libellé seul', () => {
    const { getByRole } = render(Button, {
      props: { iconStart: 'add', iconEnd: 'arrow_forward' },
      slots: { default: 'Ajouter' },
    })
    const button = getByRole('button', { name: 'Ajouter' })
    const icons = Array.from(button.querySelectorAll('.ds-icon'))
    expect(icons).toHaveLength(2)
    expect(icons.map((icon) => icon.textContent)).toEqual(['add', 'arrow_forward'])
    expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true)
  })

  it('le slot #start prime sur iconStart', () => {
    const { getByRole } = render(Button, {
      props: { iconStart: 'add' },
      slots: { default: 'Ajouter', start: '<svg data-testid="custom" aria-hidden="true" />' },
    })
    const button = getByRole('button')
    expect(button.querySelector('[data-testid="custom"]')).not.toBeNull()
    expect(button.querySelector('.ds-icon')).toBeNull()
  })

  it('avec href : rend un lien <a> sans type ni disabled', () => {
    const { getByRole } = render(Button, {
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
    const { container } = render(Button, {
      props: { href: 'https://exemple.fr', disabled: true },
      attrs: { onClick },
      slots: { default: 'Lien désactivé' },
    })
    const anchor = container.querySelector('a.ds-button') as HTMLAnchorElement
    expect(anchor).not.toBeNull()
    expect(anchor.getAttribute('href')).toBeNull()
    expect(anchor.getAttribute('aria-disabled')).toBe('true')
    anchor.click()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('lien en loading : inerte + aria-busy + spinner', () => {
    const { container } = render(Button, {
      props: { href: 'https://exemple.fr', loading: true },
      slots: { default: 'Envoi…' },
    })
    const anchor = container.querySelector('a.ds-button') as HTMLAnchorElement
    expect(anchor.getAttribute('href')).toBeNull()
    expect(anchor.getAttribute('aria-disabled')).toBe('true')
    expect(anchor.getAttribute('aria-busy')).toBe('true')
    expect(anchor.querySelector('.ds-button-spinner')).not.toBeNull()
  })
})
