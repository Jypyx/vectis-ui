import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Switch from './VSwitch.vue'

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

  it('labelPosition et spread posent les attributs data-* sur la racine', () => {
    const { container } = render(Switch, {
      props: { modelValue: false, labelPosition: 'start', spread: true },
      slots: { default: 'Notifications' },
    })
    const root = container.querySelector('.v-switch') as HTMLElement
    expect(root.getAttribute('data-label-position')).toBe('start')
    expect(root.hasAttribute('data-spread')).toBe(true)
  })

  it('spread absent par défaut (pas d’attribut data-spread)', () => {
    const { container } = render(Switch, { props: { modelValue: false } })
    const root = container.querySelector('.v-switch') as HTMLElement
    expect(root.getAttribute('data-label-position')).toBe('end')
    expect(root.hasAttribute('data-spread')).toBe(false)
  })
})
