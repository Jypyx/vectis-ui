import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Switch from './Switch.vue'

describe('Switch', () => {
  it('expose role="switch" et synchronise v-model', async () => {
    const { getByRole, emitted } = render(Switch, {
      props: { modelValue: false },
      slots: { default: 'Notifications' },
    })
    const sw = getByRole('switch', { name: 'Notifications' })
    await fireEvent.click(sw)
    expect(emitted('update:modelValue')).toEqual([[true]])
  })

  it('aria-label (fallthrough) nomme le contrôle sans libellé visible', () => {
    const { getByRole } = render(Switch, {
      props: { modelValue: false },
      attrs: { 'aria-label': 'Activer les notifications' },
    })
    expect(getByRole('switch', { name: 'Activer les notifications' })).toBeTruthy()
  })

  it('disabled bloque le contrôle', () => {
    const { getByRole } = render(Switch, {
      props: { modelValue: false, disabled: true },
    })
    expect((getByRole('switch') as HTMLInputElement).disabled).toBe(true)
  })
})
