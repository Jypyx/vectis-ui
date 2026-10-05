/**
 * The `error` prop every control with a `hint` shares: the message takes the place of the hint,
 * on screen and in the control's description, and the control is marked invalid where its role
 * allows it.
 */
import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import type { Component } from 'vue'

import VCheckbox from '../VCheckbox/VCheckbox.vue'
import VCombobox from '../VCombobox/VCombobox.vue'
import VDateInput from '../VDateInput/VDateInput.vue'
import VFileInput from '../VFileInput/VFileInput.vue'
import VInput from '../VInput/VInput.vue'
import VInputGroup from '../VInput/VInputGroup.vue'
import VInputOTP from '../VInputOTP/VInputOTP.vue'
import VRadio from '../VRadio/VRadio.vue'
import VSlider from '../VSlider/VSlider.vue'
import VSwitch from '../VSwitch/VSwitch.vue'
import VTextarea from '../VTextarea/VTextarea.vue'
import VTimeInput from '../VTimeInput/VTimeInput.vue'

/** The controls, with the props each needs to render, and whether it can carry aria-invalid. */
const CONTROLS: [string, Component, Record<string, unknown>, boolean][] = [
  ['VInput', VInput, {}, true],
  ['VTextarea', VTextarea, {}, true],
  ['VCheckbox', VCheckbox, {}, true],
  ['VRadio', VRadio, { value: 'a' }, true],
  ['VSwitch', VSwitch, {}, true],
  ['VCombobox', VCombobox, { options: [] }, true],
  ['VDateInput', VDateInput, {}, true],
  ['VTimeInput', VTimeInput, {}, true],
  ['VFileInput', VFileInput, {}, true],
  ['VInputOTP', VInputOTP, {}, true],
  ['VSlider', VSlider, {}, true],
  // A group role may not carry aria-invalid: the segments are marked by the consumer.
  ['VInputGroup', VInputGroup, {}, false],
]

describe.each(CONTROLS)('%s error', (_, component, props, carriesInvalid) => {
  it('shows the message in place of the hint, describes the control by it and marks it invalid', () => {
    const { container, getByText, queryByText } = render(component, {
      props: { ...props, label: 'Field', hint: 'Help', error: 'Wrong value' },
    })
    const message = getByText('Wrong value')
    expect(message.classList.contains('v-field-error')).toBe(true)
    expect(message.id).not.toBe('')
    expect(queryByText('Help')).toBeNull()

    const described = container.querySelector(`[aria-describedby~="${message.id}"]`)
    expect(described).not.toBeNull()
    const ids = described!.getAttribute('aria-describedby')!.split(' ')
    expect(ids[0]).toBe(message.id)
    // No reference is left pointing at the hint that the message replaced.
    for (const id of ids) expect(container.querySelector(`[id="${id}"]`)).not.toBeNull()

    expect(container.querySelector('[aria-invalid="true"]') !== null).toBe(carriesInvalid)
  })

  it('renders no message and no reference without an error', () => {
    const { container } = render(component, { props: { ...props, label: 'Field' } })
    expect(container.querySelector('.v-field-error')).toBeNull()
    expect(container.querySelector('[aria-invalid="true"]')).toBeNull()
  })
})
