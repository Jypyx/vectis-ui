import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VTypography from './VTypography.vue'

describe('VTypography', () => {
  it('default: a body-md <p>, with no data-tone and no data-truncate', () => {
    const { container } = render(VTypography, { slots: { default: 'Text' } })
    const root = container.firstElementChild!
    expect(root.tagName).toBe('P')
    expect(root.classList.contains('v-typography')).toBe(true)
    expect(root.getAttribute('data-variant')).toBe('body-md')
    expect(root.hasAttribute('data-tone')).toBe(false)
    expect(root.hasAttribute('data-truncate')).toBe(false)
    expect(root.textContent).toBe('Text')
  })

  it('default tag derived from the variant', () => {
    const cases: Array<[string, string]> = [
      ['display', 'P'],
      ['heading-1', 'H1'],
      ['heading-2', 'H2'],
      ['heading-3', 'H3'],
      ['heading-4', 'H4'],
      ['subtitle', 'P'],
      ['body-xl', 'P'],
      ['body-lg', 'P'],
      ['body-md', 'P'],
      ['body-sm', 'P'],
      ['label', 'SPAN'],
      ['caption', 'P'],
      ['overline', 'SPAN'],
      ['code', 'CODE'],
    ]
    for (const [variant, tagName] of cases) {
      const { container } = render(VTypography, {
        props: { variant: variant as never },
        slots: { default: 'x' },
      })
      const root = container.firstElementChild!
      expect(root.tagName, variant).toBe(tagName)
      expect(root.getAttribute('data-variant'), variant).toBe(variant)
    }
  })

  it("`as` wins over the variant's default tag", () => {
    const { container } = render(VTypography, {
      props: { variant: 'heading-1', as: 'strong' },
      slots: { default: 'x' },
    })
    expect(container.firstElementChild!.tagName).toBe('STRONG')
  })

  it('an explicit tone is set as data-tone', () => {
    const { container } = render(VTypography, {
      props: { tone: 'muted' },
      slots: { default: 'x' },
    })
    expect(container.firstElementChild!.getAttribute('data-tone')).toBe('muted')
  })

  it('truncate: data-truncate is set', () => {
    const { container } = render(VTypography, {
      props: { truncate: true },
      slots: { default: 'x' },
    })
    expect(container.firstElementChild!.hasAttribute('data-truncate')).toBe(true)
  })

  it('fallthrough: for/id/class land on the root (field-label usage)', () => {
    const { container } = render(VTypography, {
      props: { variant: 'label', as: 'label' },
      attrs: { for: 'field', id: 'my-label', class: 'extra' },
      slots: { default: 'Name' },
    })
    const root = container.firstElementChild!
    expect(root.tagName).toBe('LABEL')
    expect(root.getAttribute('for')).toBe('field')
    expect(root.getAttribute('id')).toBe('my-label')
    expect(root.classList.contains('extra')).toBe(true)
    expect(root.classList.contains('v-typography')).toBe(true)
  })
})
