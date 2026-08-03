import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import Checkbox from './VCheckbox.vue'

describe('Checkbox', () => {
  it('synchronise v-model au clic', async () => {
    const { getByRole, emitted } = render(Checkbox, {
      props: { modelValue: false },
      slots: { default: 'Cocher' },
    })
    await fireEvent.click(getByRole('checkbox'))
    expect(emitted('update:modelValue')).toEqual([[true]])
  })

  it('le libellé du slot nomme le contrôle (label englobant)', () => {
    const { getByRole } = render(Checkbox, {
      props: { modelValue: false },
      slots: { default: 'Recevoir la newsletter' },
    })
    expect(getByRole('checkbox', { name: 'Recevoir la newsletter' })).toBeTruthy()
  })

  it('applique la propriété DOM indeterminate (pas d’attribut HTML équivalent)', async () => {
    const { getByRole, rerender } = render(Checkbox, {
      props: { modelValue: false, indeterminate: true },
    })
    const input = getByRole('checkbox') as HTMLInputElement
    expect(input.indeterminate).toBe(true)
    await rerender({ indeterminate: false })
    await nextTick()
    expect(input.indeterminate).toBe(false)
  })

  it('labelPosition et spread posent les attributs data-* sur la racine', () => {
    const { container } = render(Checkbox, {
      props: { modelValue: false, labelPosition: 'start', spread: true },
      slots: { default: 'Cocher' },
    })
    const root = container.querySelector('.v-checkbox') as HTMLElement
    expect(root.getAttribute('data-label-position')).toBe('start')
    expect(root.hasAttribute('data-spread')).toBe(true)
  })

  it('spread absent par défaut (pas d’attribut data-spread)', () => {
    const { container } = render(Checkbox, { props: { modelValue: false } })
    const root = container.querySelector('.v-checkbox') as HTMLElement
    expect(root.getAttribute('data-label-position')).toBe('end')
    expect(root.hasAttribute('data-spread')).toBe(false)
  })

  it('les attributs natifs atterrissent sur l’input, pas sur le label', () => {
    const { getByRole } = render(Checkbox, {
      props: { modelValue: false },
      attrs: { name: 'cgu', required: true },
    })
    const input = getByRole('checkbox')
    expect(input.getAttribute('name')).toBe('cgu')
    expect(input.hasAttribute('required')).toBe(true)
  })
})
