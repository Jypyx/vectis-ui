import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

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
})
