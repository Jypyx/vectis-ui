import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Input from './Input.vue'

describe('Input', () => {
  it('synchronise v-model (update:modelValue)', async () => {
    const { getByRole, emitted } = render(Input, {
      props: { modelValue: '' },
    })
    const input = getByRole('textbox') as HTMLInputElement
    await fireEvent.update(input, 'bonjour')
    expect(emitted('update:modelValue')).toEqual([['bonjour']])
  })

  it('affiche la valeur du modèle', () => {
    const { getByRole } = render(Input, {
      props: { modelValue: 'initial' },
    })
    expect((getByRole('textbox') as HTMLInputElement).value).toBe('initial')
  })

  it('invalid pose aria-invalid, sinon rien', () => {
    const { getByRole, rerender } = render(Input, {
      props: { modelValue: '', invalid: true },
    })
    expect(getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
    return rerender({ invalid: false }).then(() => {
      expect(getByRole('textbox').hasAttribute('aria-invalid')).toBe(false)
    })
  })

  it('laisse passer les attributs natifs (type, required, placeholder)', () => {
    const { getByRole } = render(Input, {
      props: { modelValue: '' },
      attrs: { type: 'email', required: true, placeholder: 'votre@email.fr' },
    })
    const input = getByRole('textbox')
    expect(input.getAttribute('type')).toBe('email')
    expect(input.hasAttribute('required')).toBe(true)
    expect(input.getAttribute('placeholder')).toBe('votre@email.fr')
  })
})
