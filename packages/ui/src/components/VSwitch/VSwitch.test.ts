import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import { nextTick, ref } from 'vue'

import VSwitch from './VSwitch.vue'

describe('VSwitch', () => {
  it('exposes role="switch" and syncs v-model', async () => {
    const { getByRole, emitted } = render(VSwitch, {
      props: { modelValue: false },
      slots: { default: 'Notifications' },
    })
    const sw = getByRole('switch', { name: 'Notifications' })
    await fireEvent.click(sw)
    expect(emitted('update:modelValue')).toEqual([[true]])
  })

  it('aria-label (fallthrough) names the control with no visible label', () => {
    const { getByRole } = render(VSwitch, {
      props: { modelValue: false },
      attrs: { 'aria-label': 'Enable notifications' },
    })
    expect(getByRole('switch', { name: 'Enable notifications' })).toBeTruthy()
  })

  it('disabled blocks the control', () => {
    const { getByRole } = render(VSwitch, {
      props: { modelValue: false, disabled: true },
    })
    expect((getByRole('switch') as HTMLInputElement).disabled).toBe(true)
  })

  it('labelPosition and spread set the data-* attributes on the root', () => {
    const { container } = render(VSwitch, {
      props: { modelValue: false, labelPosition: 'start', spread: true },
      slots: { default: 'Notifications' },
    })
    const root = container.querySelector('.v-switch') as HTMLElement
    expect(root.getAttribute('data-label-position')).toBe('start')
    expect(root.getAttribute('data-spread')).toBe('')
  })

  it('spread absent by default (no data-spread attribute)', () => {
    const { container } = render(VSwitch, { props: { modelValue: false } })
    const root = container.querySelector('.v-switch') as HTMLElement
    expect(root.getAttribute('data-label-position')).toBe('end')
    expect(root.hasAttribute('data-spread')).toBe(false)
  })
})

describe('VSwitch — invalid', () => {
  it('reports it on the input, where VCheckbox and VRadio report theirs', () => {
    const { getByRole } = render(VSwitch, { props: { invalid: true } })
    expect(getByRole('switch').getAttribute('aria-invalid')).toBe('true')
  })

  it('says nothing when it is valid', () => {
    const { getByRole } = render(VSwitch)
    expect(getByRole('switch').hasAttribute('aria-invalid')).toBe(false)
  })

  it('exposes focus and the real switch, the root being a wrapper', async () => {
    const control = ref<InstanceType<typeof VSwitch> | null>(null)
    render({
      components: { VSwitch },
      setup: () => ({ control }),
      template: '<VSwitch ref="control">Wi-Fi</VSwitch>',
    })
    await nextTick()
    expect(control.value?.el?.getAttribute('role')).toBe('switch')
    control.value?.focus()
    expect(document.activeElement).toBe(control.value?.el)
  })
})

describe('VSwitch — label, hint and readonly', () => {
  it('label: the prop names the control, and the slot replaces it', () => {
    const { getByRole } = render(VSwitch, { props: { label: 'From the prop' } })
    expect(getByRole('switch', { name: 'From the prop' })).toBeTruthy()
    const slotted = render(VSwitch, {
      props: { label: 'Ignored' },
      slots: { default: 'From the slot' },
    })
    expect(slotted.getByRole('switch', { name: 'From the slot' })).toBeTruthy()
  })

  // The hint sits OUTSIDE the <label>: inside it, it would be read as part of the name.
  it('hint: a description aggregated with the consumer one, never part of the name', () => {
    const { getByRole, getByText } = render(VSwitch, {
      props: { label: 'Notifications', hint: 'Sent once a day' },
      attrs: { 'aria-describedby': 'mine' },
    })
    const control = getByRole('switch', { name: 'Notifications' })
    const hint = getByText('Sent once a day')
    expect(hint.closest('label')).toBeNull()
    expect(control.getAttribute('aria-describedby')).toBe(`mine ${hint.id}`)
  })

  it('no hint: the consumer aria-describedby passes through untouched', () => {
    const { getByRole } = render(VSwitch, {
      props: { label: 'x' },
      attrs: { 'aria-describedby': 'mine' },
    })
    expect(getByRole('switch').getAttribute('aria-describedby')).toBe('mine')
  })

  it('keeps class and style on the root, the rest on the input', () => {
    const { container, getByRole } = render(VSwitch, {
      props: { label: 'x' },
      attrs: { class: 'mine', style: 'margin: 4px', name: 'n' },
    })
    const root = container.firstElementChild as HTMLElement
    expect(root.classList.contains('mine')).toBe(true)
    expect(root.style.margin).toBe('4px')
    expect(getByRole('switch').classList.contains('mine')).toBe(false)
    expect(getByRole('switch').getAttribute('name')).toBe('n')
  })

  it('readonly: a click changes nothing, and the switch says so', async () => {
    const { getByRole, emitted } = render(VSwitch, {
      props: { modelValue: true, readonly: true, label: 'Locked' },
    })
    const input = getByRole('switch') as HTMLInputElement
    expect(input.getAttribute('aria-readonly')).toBe('true')
    await fireEvent.click(input)
    expect(input.checked).toBe(true)
    expect(emitted('update:modelValue')).toBeUndefined()
  })
})

// A validation library marks the field invalid through the attribute. The component's own
// `invalid` binding comes after the forwarded attributes, so it must hand the consumer's value
// through rather than overwrite it with nothing.
describe('VSwitch — a consumer aria-invalid', () => {
  it('reaches the control when `invalid` is not set', () => {
    const { getByRole } = render(VSwitch, {
      props: {},
      attrs: { 'aria-invalid': 'true' },
    })
    expect(getByRole('switch').getAttribute('aria-invalid')).toBe('true')
  })
})
