import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Select from './Select.vue'

const slots = {
  default: `
    <option value="a">Alpha</option>
    <option value="b">Beta</option>
  `,
}

describe('Select', () => {
  it('synchronise v-model à la sélection', async () => {
    const { getByRole, emitted } = render(Select, {
      props: { modelValue: 'a' },
      slots,
    })
    await fireEvent.update(getByRole('combobox'), 'b')
    expect(emitted('update:modelValue')).toEqual([['b']])
  })

  it('les attributs natifs atterrissent sur le <select>, pas sur le wrapper', () => {
    const { getByRole } = render(Select, {
      props: { modelValue: 'a' },
      attrs: { name: 'pays', required: true },
      slots,
    })
    const select = getByRole('combobox')
    expect(select.tagName).toBe('SELECT')
    expect(select.getAttribute('name')).toBe('pays')
    expect(select.hasAttribute('required')).toBe(true)
  })

  it('disabled désactive le contrôle', () => {
    const { getByRole } = render(Select, {
      props: { modelValue: 'a', disabled: true },
      slots,
    })
    expect((getByRole('combobox') as HTMLSelectElement).disabled).toBe(true)
  })
})
