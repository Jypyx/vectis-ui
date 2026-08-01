import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import VCheckbox from './VCheckbox.vue'

describe('VCheckbox', () => {
  it('syncs v-model on click', async () => {
    const { getByRole, emitted } = render(VCheckbox, {
      props: { modelValue: false },
      slots: { default: 'Cocher' },
    })
    await fireEvent.click(getByRole('checkbox'))
    expect(emitted('update:modelValue')).toEqual([[true]])
  })

  it('the slot label names the control (a wrapping label)', () => {
    const { getByRole } = render(VCheckbox, {
      props: { modelValue: false },
      slots: { default: 'Receive the newsletter' },
    })
    expect(getByRole('checkbox', { name: 'Receive the newsletter' })).toBeTruthy()
  })

  it('applies the indeterminate DOM property (there is no equivalent HTML attribute)', async () => {
    const { getByRole, rerender } = render(VCheckbox, {
      props: { modelValue: false, indeterminate: true },
    })
    const input = getByRole('checkbox') as HTMLInputElement
    expect(input.indeterminate).toBe(true)
    await rerender({ indeterminate: false })
    await nextTick()
    expect(input.indeterminate).toBe(false)
  })

  it('labelPosition and spread set the data-* attributes on the root', () => {
    const { container } = render(VCheckbox, {
      props: { modelValue: false, labelPosition: 'start', spread: true },
      slots: { default: 'Cocher' },
    })
    const root = container.querySelector('.v-checkbox') as HTMLElement
    expect(root.getAttribute('data-label-position')).toBe('start')
    expect(root.hasAttribute('data-spread')).toBe(true)
  })

  it('spread absent by default (no data-spread attribute)', () => {
    const { container } = render(VCheckbox, { props: { modelValue: false } })
    const root = container.querySelector('.v-checkbox') as HTMLElement
    expect(root.getAttribute('data-label-position')).toBe('end')
    expect(root.hasAttribute('data-spread')).toBe(false)
  })

  it('the native attributes land on the input, not on the label', () => {
    const { getByRole } = render(VCheckbox, {
      props: { modelValue: false },
      attrs: { name: 'cgu', required: true },
    })
    const input = getByRole('checkbox')
    expect(input.getAttribute('name')).toBe('cgu')
    expect(input.hasAttribute('required')).toBe(true)
  })
})
