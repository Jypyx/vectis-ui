import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Typography from './Typography.vue'

describe('Typography', () => {
  it('défaut : <p> body-md, sans data-tone ni data-truncate', () => {
    const { container } = render(Typography, { slots: { default: 'Texte' } })
    const root = container.firstElementChild!
    expect(root.tagName).toBe('P')
    expect(root.classList.contains('v-typography')).toBe(true)
    expect(root.getAttribute('data-variant')).toBe('body-md')
    expect(root.hasAttribute('data-tone')).toBe(false)
    expect(root.hasAttribute('data-truncate')).toBe(false)
    expect(root.textContent).toBe('Texte')
  })

  it('balise par défaut dérivée de la variante', () => {
    const cases: Array<[string, string]> = [
      ['display', 'P'],
      ['heading-1', 'H1'],
      ['heading-2', 'H2'],
      ['heading-3', 'H3'],
      ['heading-4', 'H4'],
      ['subtitle', 'P'],
      ['body-lg', 'P'],
      ['body-md', 'P'],
      ['body-sm', 'P'],
      ['label', 'SPAN'],
      ['caption', 'P'],
      ['overline', 'SPAN'],
      ['code', 'CODE'],
    ]
    for (const [variant, tagName] of cases) {
      const { container } = render(Typography, {
        props: { variant: variant as never },
        slots: { default: 'x' },
      })
      const root = container.firstElementChild!
      expect(root.tagName, variant).toBe(tagName)
      expect(root.getAttribute('data-variant'), variant).toBe(variant)
    }
  })

  it('`as` prime sur la balise par défaut de la variante', () => {
    const { container } = render(Typography, {
      props: { variant: 'heading-1', as: 'strong' },
      slots: { default: 'x' },
    })
    expect(container.firstElementChild!.tagName).toBe('STRONG')
  })

  it('tone explicite posé en data-tone', () => {
    const { container } = render(Typography, {
      props: { tone: 'muted' },
      slots: { default: 'x' },
    })
    expect(container.firstElementChild!.getAttribute('data-tone')).toBe('muted')
  })

  it('truncate : data-truncate posé', () => {
    const { container } = render(Typography, {
      props: { truncate: true },
      slots: { default: 'x' },
    })
    expect(container.firstElementChild!.hasAttribute('data-truncate')).toBe(true)
  })

  it('fallthrough : for/id/class atterrissent sur la racine (usage label de champ)', () => {
    const { container } = render(Typography, {
      props: { variant: 'label', as: 'label' },
      attrs: { for: 'champ', id: 'mon-label', class: 'extra' },
      slots: { default: 'Nom' },
    })
    const root = container.firstElementChild!
    expect(root.tagName).toBe('LABEL')
    expect(root.getAttribute('for')).toBe('champ')
    expect(root.getAttribute('id')).toBe('mon-label')
    expect(root.classList.contains('extra')).toBe(true)
    expect(root.classList.contains('v-typography')).toBe(true)
  })
})
