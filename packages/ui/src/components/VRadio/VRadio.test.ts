import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VRadio from './VRadio.vue'

describe('VRadio', () => {
  it('checked when the model matches value, emits the selection otherwise', async () => {
    const Harness = defineComponent({
      components: { VRadio },
      setup: () => ({ plan: ref('a') }),
      template: `
        <VRadio v-model="plan" name="plan" value="a">Alpha</VRadio>
        <VRadio v-model="plan" name="plan" value="b">Beta</VRadio>
      `,
    })
    const { getByRole } = render(Harness)
    const alpha = getByRole('radio', { name: 'Alpha' }) as HTMLInputElement
    const beta = getByRole('radio', { name: 'Beta' }) as HTMLInputElement

    expect(alpha.checked).toBe(true)
    await fireEvent.click(beta)
    expect(beta.checked).toBe(true)
    expect(alpha.checked).toBe(false)
  })

  it('labelPosition and spread set the data-* attributes on the root', () => {
    const { container } = render(VRadio, {
      props: { modelValue: '', value: 'x', labelPosition: 'start', spread: true },
      slots: { default: 'X' },
    })
    const root = container.querySelector('.v-radio') as HTMLElement
    expect(root.getAttribute('data-label-position')).toBe('start')
    expect(root.getAttribute('data-spread')).toBe('')
  })

  it('name (fallthrough) lands on the input to form the native group', () => {
    const { getByRole } = render(VRadio, {
      props: { modelValue: '', value: 'x' },
      attrs: { name: 'groupe' },
      slots: { default: 'X' },
    })
    expect(getByRole('radio').getAttribute('name')).toBe('groupe')
  })

  it('a numeric value makes the round trip as a number', async () => {
    const plan = ref<number>(1)
    const { getByRole } = render({
      components: { VRadio },
      setup: () => ({ plan }),
      template: `
        <VRadio v-model="plan" name="plan" :value="1">One</VRadio>
        <VRadio v-model="plan" name="plan" :value="2">Two</VRadio>
      `,
    })
    expect((getByRole('radio', { name: 'One' }) as HTMLInputElement).checked).toBe(true)
    await fireEvent.click(getByRole('radio', { name: 'Two' }))
    expect(plan.value).toBe(2)
  })

  it('exposes focus and the real radio button, the root being a wrapper', async () => {
    const radio = ref<InstanceType<typeof VRadio> | null>(null)
    render({
      components: { VRadio },
      setup: () => ({ radio }),
      template: '<VRadio ref="radio" value="a">Alpha</VRadio>',
    })
    await nextTick()
    expect(radio.value?.el?.type).toBe('radio')
    radio.value?.focus()
    expect(document.activeElement).toBe(radio.value?.el)
  })

  it('label: the prop names the control, and the slot replaces it', () => {
    const { getByRole } = render(VRadio, { props: { value: 'a', label: 'From the prop' } })
    expect(getByRole('radio', { name: 'From the prop' })).toBeTruthy()
    const slotted = render(VRadio, {
      props: { value: 'a', label: 'Ignored' },
      slots: { default: 'From the slot' },
    })
    expect(slotted.getByRole('radio', { name: 'From the slot' })).toBeTruthy()
  })

  // The hint sits OUTSIDE the <label>: inside it, it would be read as part of the name.
  it('hint: a description aggregated with the consumer one, never part of the name', () => {
    const { getByRole, getByText } = render(VRadio, {
      props: { value: 'a', label: 'Notifications', hint: 'Sent once a day' },
      attrs: { 'aria-describedby': 'mine' },
    })
    const control = getByRole('radio', { name: 'Notifications' })
    const hint = getByText('Sent once a day')
    expect(hint.closest('label')).toBeNull()
    expect(control.getAttribute('aria-describedby')).toBe(`mine ${hint.id}`)
  })

  it('no hint: the consumer aria-describedby passes through untouched', () => {
    const { getByRole } = render(VRadio, {
      props: { value: 'a', label: 'x' },
      attrs: { 'aria-describedby': 'mine' },
    })
    expect(getByRole('radio').getAttribute('aria-describedby')).toBe('mine')
  })

  it('keeps class and style on the root, the rest on the input', () => {
    const { container, getByRole } = render(VRadio, {
      props: { value: 'a', label: 'x' },
      attrs: { class: 'mine', style: 'margin: 4px', name: 'n' },
    })
    const root = container.firstElementChild as HTMLElement
    expect(root.classList.contains('mine')).toBe(true)
    expect(root.style.margin).toBe('4px')
    expect(getByRole('radio').classList.contains('mine')).toBe(false)
    expect(getByRole('radio').getAttribute('name')).toBe('n')
  })

  it('readonly: a click selects nothing, and no aria-readonly is written on a radio', async () => {
    const plan = ref('a')
    const { getByRole } = render({
      components: { VRadio },
      setup: () => ({ plan }),
      template: `
        <VRadio v-model="plan" name="plan" value="a" readonly>Alpha</VRadio>
        <VRadio v-model="plan" name="plan" value="b" readonly>Beta</VRadio>
      `,
    })
    const beta = getByRole('radio', { name: 'Beta' }) as HTMLInputElement
    await fireEvent.click(beta)
    expect(beta.checked).toBe(false)
    expect(plan.value).toBe('a')
    // A browser also puts the previous selection back on Alpha; jsdom does not restore the
    // OTHER button of a cancelled click, which the ReadOnly play function checks instead.
    // ARIA allows aria-readonly on a radiogroup, never on a radio: axe would fail the page.
    expect(beta.hasAttribute('aria-readonly')).toBe(false)
  })
})

// A validation library marks the field invalid through the attribute. The component's own
// `invalid` binding therefore comes BEFORE the forwarded attributes: bound after them,
// `mergeProps` copies its key even when the value is `undefined` and the consumer's verdict
// is silently erased. This test goes red the moment the binding moves back down.
describe('VRadio — a consumer aria-invalid', () => {
  it('reaches the control when `invalid` is not set', () => {
    const { getByRole } = render(VRadio, {
      props: { value: 'a' },
      attrs: { 'aria-invalid': 'true' },
    })
    expect(getByRole('radio').getAttribute('aria-invalid')).toBe('true')
  })
})
