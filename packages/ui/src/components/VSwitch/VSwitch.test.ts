import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

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
      attrs: { 'aria-label': 'Activer les notifications' },
    })
    expect(getByRole('switch', { name: 'Activer les notifications' })).toBeTruthy()
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
    expect(root.hasAttribute('data-spread')).toBe(true)
  })

  it('spread absent by default (no data-spread attribute)', () => {
    const { container } = render(VSwitch, { props: { modelValue: false } })
    const root = container.querySelector('.v-switch') as HTMLElement
    expect(root.getAttribute('data-label-position')).toBe('end')
    expect(root.hasAttribute('data-spread')).toBe(false)
  })
})
