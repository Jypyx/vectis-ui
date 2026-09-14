import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

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
    expect(root.getAttribute('data-spread')).toBe('')
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

  it('exposes focus and the real checkbox, the root being a wrapper', async () => {
    const box = ref<InstanceType<typeof VCheckbox> | null>(null)
    render({
      components: { VCheckbox },
      setup: () => ({ box }),
      template: '<VCheckbox ref="box">Terms</VCheckbox>',
    })
    await nextTick()
    expect(box.value?.el?.type).toBe('checkbox')
    box.value?.focus({ preventScroll: true })
    expect(document.activeElement).toBe(box.value?.el)
  })

  it('label: the prop names the control, and the slot replaces it', () => {
    const { getByRole } = render(VCheckbox, { props: { label: 'From the prop' } })
    expect(getByRole('checkbox', { name: 'From the prop' })).toBeTruthy()
    const slotted = render(VCheckbox, {
      props: { label: 'Ignored' },
      slots: { default: 'From the slot' },
    })
    expect(slotted.getByRole('checkbox', { name: 'From the slot' })).toBeTruthy()
  })

  // The hint sits OUTSIDE the <label>: inside it, it would be read as part of the name.
  it('hint: a description aggregated with the consumer one, never part of the name', () => {
    const { getByRole, getByText } = render(VCheckbox, {
      props: { label: 'Notifications', hint: 'Sent once a day' },
      attrs: { 'aria-describedby': 'mine' },
    })
    const control = getByRole('checkbox', { name: 'Notifications' })
    const hint = getByText('Sent once a day')
    expect(hint.closest('label')).toBeNull()
    expect(control.getAttribute('aria-describedby')).toBe(`mine ${hint.id}`)
  })

  it('no hint: the consumer aria-describedby passes through untouched', () => {
    const { getByRole } = render(VCheckbox, {
      props: { label: 'x' },
      attrs: { 'aria-describedby': 'mine' },
    })
    expect(getByRole('checkbox').getAttribute('aria-describedby')).toBe('mine')
  })

  it('keeps class and style on the root, the rest on the input', () => {
    const { container, getByRole } = render(VCheckbox, {
      props: { label: 'x' },
      attrs: { class: 'mine', style: 'margin: 4px', name: 'n' },
    })
    const root = container.firstElementChild as HTMLElement
    expect(root.classList.contains('mine')).toBe(true)
    expect(root.style.margin).toBe('4px')
    expect(getByRole('checkbox').classList.contains('mine')).toBe(false)
    expect(getByRole('checkbox').getAttribute('name')).toBe('n')
  })

  // The native readonly attribute is inert on a checkbox: the refusal is the component's.
  it('readonly: a click changes nothing, the state and the dash included', async () => {
    const { getByRole, emitted } = render(VCheckbox, {
      props: { modelValue: false, indeterminate: true, readonly: true, label: 'Locked' },
    })
    const input = getByRole('checkbox') as HTMLInputElement
    expect(input.getAttribute('aria-readonly')).toBe('true')
    expect(input.disabled).toBe(false)
    await fireEvent.click(input)
    expect(input.checked).toBe(false)
    expect(input.indeterminate).toBe(true)
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(input.closest('.v-checkbox')?.hasAttribute('data-readonly')).toBe(true)
  })

  it('not readonly: no aria-readonly and no data-readonly', () => {
    const { getByRole } = render(VCheckbox, { props: { label: 'x' } })
    expect(getByRole('checkbox').hasAttribute('aria-readonly')).toBe(false)
    expect(getByRole('checkbox').closest('.v-checkbox')?.hasAttribute('data-readonly')).toBe(false)
  })
})
