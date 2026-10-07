import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import VRadio from '../VRadio/VRadio.vue'
import VFieldset from './VFieldset.vue'

/** The file's single component factory (vue/one-component-per-file). */
function renderHarness(template: string) {
  const Harness = defineComponent({ components: { VFieldset, VRadio }, template })
  return render(Harness)
}

const RADIOS = `
  <VRadio name="plan" value="free" label="Free" :invalid="invalid" :required="required" />
  <VRadio name="plan" value="pro" label="Pro" :invalid="invalid" :required="required" />
`

describe('VFieldset', () => {
  it('renders a fieldset named by its legend, vertical by default', () => {
    const { getByRole, container } = renderHarness(
      `<VFieldset legend="Plan" v-slot="{ invalid, required }">${RADIOS}</VFieldset>`,
    )
    const group = getByRole('group', { name: 'Plan' })
    expect(group.tagName).toBe('FIELDSET')
    expect(group.getAttribute('data-orientation')).toBe('vertical')
    expect(container.querySelectorAll('.v-fieldset-body input[type="radio"]')).toHaveLength(2)
  })

  it('replaces the hint with the error, after the consumer references', () => {
    const { getByRole, getByText, queryByText } = renderHarness(
      `<VFieldset legend="Plan" hint="Change it any time" error="Choose a plan" aria-describedby="extra"
        v-slot="{ invalid, required }">${RADIOS}</VFieldset>`,
    )
    const error = getByText('Choose a plan')
    expect(queryByText('Change it any time')).toBeNull()
    expect(getByRole('group').getAttribute('aria-describedby')).toBe(`extra ${error.id}`)
  })

  it('hands invalid to the slot while there is an error, never aria-invalid to the group', () => {
    const { getByRole, getAllByRole } = renderHarness(
      `<VFieldset legend="Plan" error="Choose a plan" v-slot="{ invalid, required }">${RADIOS}</VFieldset>`,
    )
    expect(getByRole('group').hasAttribute('aria-invalid')).toBe(false)
    for (const radio of getAllByRole('radio'))
      expect(radio.getAttribute('aria-invalid')).toBe('true')
  })

  it('required: an aria-hidden asterisk after the legend, and required handed to the slot', () => {
    const { getByRole, getAllByRole, container } = renderHarness(
      `<VFieldset legend="Plan" required v-slot="{ invalid, required }">${RADIOS}</VFieldset>`,
    )
    expect(container.querySelector('.v-field-required')!.getAttribute('aria-hidden')).toBe('true')
    expect(getByRole('group', { name: 'Plan' })).toBeTruthy()
    for (const radio of getAllByRole('radio')) expect(radio.hasAttribute('required')).toBe(true)
  })

  it('hideLegend keeps the name but hides the legend visually', () => {
    const { getByRole, container } = renderHarness(
      `<VFieldset legend="Plan" hide-legend v-slot="{ invalid, required }">${RADIOS}</VFieldset>`,
    )
    expect(getByRole('group', { name: 'Plan' })).toBeTruthy()
    expect(
      container.querySelector('.v-fieldset-legend')!.classList.contains('v-visually-hidden'),
    ).toBe(true)
  })

  it('mirrors orientation and lets native attributes fall through', () => {
    const { getByRole } = renderHarness(
      `<VFieldset legend="Plan" orientation="horizontal" id="plan" disabled class="custom"
        v-slot="{ invalid, required }">${RADIOS}</VFieldset>`,
    )
    const group = getByRole('group')
    expect(group.getAttribute('data-orientation')).toBe('horizontal')
    expect(group.id).toBe('plan')
    expect(group.hasAttribute('disabled')).toBe(true)
    expect(group.classList.contains('custom')).toBe(true)
  })
})
