import { render, waitFor } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VInput from '../VInput/VInput.vue'
import VField from './VField.vue'

/** The file's single component factory (vue/one-component-per-file). */
function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VField, VInput },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

describe('VField', () => {
  it('ties the label to a native control through the slot props', () => {
    const { getByLabelText } = renderHarness(
      '<VField label="Email" v-slot="{ fieldProps }"><input v-bind="fieldProps" /></VField>',
    )
    const input = getByLabelText('Email')
    expect(input.tagName).toBe('INPUT')
    expect(input.id).not.toBe('')
  })

  it('ties the label to a library control, whose own attributes still apply', () => {
    const { getByLabelText } = renderHarness(
      '<VField label="Email" v-slot="{ fieldProps }"><VInput v-bind="fieldProps" type="email" /></VField>',
    )
    const input = getByLabelText('Email')
    expect(input.classList.contains('v-input-control')).toBe(true)
    expect(input.getAttribute('type')).toBe('email')
  })

  it('replaces the hint with the error, on screen and in aria-describedby', async () => {
    const error = ref<string | undefined>()
    const { getByLabelText, getByText, queryByText } = renderHarness(
      `<VField label="Email" hint="Work address" :error="error" v-slot="{ fieldProps }">
        <input v-bind="fieldProps" />
      </VField>`,
      { error },
    )
    const input = getByLabelText('Email')
    expect(input.getAttribute('aria-describedby')).toBe(getByText('Work address').id)

    error.value = 'Enter an email'
    await nextTick()
    const message = getByText('Enter an email')
    expect(message.classList.contains('v-field-error')).toBe(true)
    expect(queryByText('Work address')).toBeNull()
    expect(input.getAttribute('aria-describedby')).toBe(message.id)
    expect(input.getAttribute('aria-invalid')).toBe('true')

    error.value = undefined
    await nextTick()
    expect(input.getAttribute('aria-describedby')).toBe(getByText('Work address').id)
  })

  it('hands over no aria key without a hint or an error, so the control keeps its own', () => {
    const { container } = renderHarness(
      '<VField label="Email" v-slot="{ fieldProps }"><VInput v-bind="fieldProps" invalid /></VField>',
    )
    const input = container.querySelector('input')!
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.hasAttribute('aria-describedby')).toBe(false)
    expect(input.hasAttribute('required')).toBe(false)
  })

  it('required: an aria-hidden asterisk after the label, and required on the control', () => {
    const { container, getByRole } = renderHarness(
      '<VField label="Email" required v-slot="{ fieldProps }"><input v-bind="fieldProps" /></VField>',
    )
    const star = container.querySelector('.v-field-required')!
    expect(star.textContent).toBe('*')
    expect(star.getAttribute('aria-hidden')).toBe('true')
    // The accessible name leaves the hidden asterisk out.
    expect(getByRole('textbox', { name: 'Email' }).hasAttribute('required')).toBe(true)
  })

  it('disabled: hands disabled to the control and marks the root', () => {
    const { container, getByLabelText } = renderHarness(
      '<VField label="Email" disabled v-slot="{ fieldProps }"><input v-bind="fieldProps" /></VField>',
    )
    expect(getByLabelText('Email').hasAttribute('disabled')).toBe(true)
    expect(container.querySelector('.v-field')!.hasAttribute('data-disabled')).toBe(true)
  })

  it('group: names the group through aria-labelledby, without the states a group may not carry', () => {
    const { getByRole, getByText } = renderHarness(
      `<VField label="Card" hint="As printed" error="Expired" required disabled group
        v-slot="{ fieldProps }"><div role="group" v-bind="fieldProps" /></VField>`,
    )
    const group = getByRole('group', { name: 'Card' })
    expect(getByText('Card').tagName).toBe('SPAN')
    expect(group.getAttribute('aria-describedby')).toBe(getByText('Expired').id)
    for (const name of ['aria-invalid', 'required', 'disabled'])
      expect(group.hasAttribute(name)).toBe(false)
  })

  it('renders the meta slot on the line of the hint, described after the hint', () => {
    const { getByText, getByLabelText } = renderHarness(
      `<VField label="Bio" hint="Shown on your profile">
        <template #default="{ fieldProps }"><textarea v-bind="fieldProps" /></template>
        <template #meta="{ id }"><span :id="id">12/80</span></template>
      </VField>`,
    )
    const counter = getByText('12/80')
    const hint = getByText('Shown on your profile')
    expect(counter.parentElement!.classList.contains('v-field-meta')).toBe(true)
    expect(counter.parentElement!.contains(hint)).toBe(true)
    expect(getByLabelText('Bio').getAttribute('aria-describedby')).toBe(`${hint.id} ${counter.id}`)
  })

  it('hideLabel keeps the label as the accessible name but hides it visually', () => {
    const { getByLabelText, container } = renderHarness(
      '<VField label="Search" hide-label v-slot="{ fieldProps }"><input v-bind="fieldProps" /></VField>',
    )
    expect(getByLabelText('Search')).toBeTruthy()
    expect(container.querySelector('.v-field-label')!.classList.contains('v-visually-hidden')).toBe(
      true,
    )
  })

  it('mirrors labelPosition, top by default', () => {
    const top = renderHarness(
      '<VField label="A" v-slot="{ fieldProps }"><input v-bind="fieldProps" /></VField>',
    )
    expect(top.container.querySelector('.v-field')!.getAttribute('data-label-position')).toBe('top')
    const start = renderHarness(
      '<VField label="A" label-position="start" v-slot="{ fieldProps }"><input v-bind="fieldProps" /></VField>',
    )
    expect(start.container.querySelector('.v-field')!.getAttribute('data-label-position')).toBe(
      'start',
    )
  })

  it('keeps class and style on the root and forwards the other attributes to the control', () => {
    const { container, getByLabelText } = renderHarness(
      `<VField label="Email" id="email" class="custom" style="color: red" aria-describedby="extra"
        name="email" v-slot="{ fieldProps }"><input v-bind="fieldProps" /></VField>`,
    )
    const root = container.querySelector('.v-field')!
    const input = getByLabelText('Email')
    expect(root.classList.contains('custom')).toBe(true)
    expect(root.getAttribute('style')).toContain('color: red')
    expect(root.hasAttribute('id')).toBe(false)
    expect(input.id).toBe('email')
    expect(input.getAttribute('name')).toBe('email')
    expect(input.getAttribute('aria-describedby')).toBe('extra')
  })

  it('announces an error that appears after the first render, not one present at mount', async () => {
    const error = ref<string | undefined>('Already there')
    const { container } = renderHarness(
      '<VField label="Email" :error="error" v-slot="{ fieldProps }"><input v-bind="fieldProps" /></VField>',
      { error },
    )
    const live = container.querySelector('[aria-live="polite"]')!
    expect(live.textContent).toBe('')

    error.value = 'Enter an email'
    await waitFor(() => expect(live.textContent).toBe('Enter an email'))

    error.value = undefined
    await nextTick()
    expect(live.textContent).toBe('')
    expect(container.querySelector('.v-field-error')).toBeNull()
  })
})
