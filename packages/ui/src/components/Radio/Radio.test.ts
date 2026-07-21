import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'

import Radio from './Radio.vue'

describe('Radio', () => {
  it('coché quand le modèle correspond à value, émet la sélection sinon', async () => {
    const Harness = defineComponent({
      components: { Radio },
      setup: () => ({ plan: ref('a') }),
      template: `
        <Radio v-model="plan" name="plan" value="a">Alpha</Radio>
        <Radio v-model="plan" name="plan" value="b">Beta</Radio>
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

  it('labelPosition et spread posent les attributs data-* sur la racine', () => {
    const { container } = render(Radio, {
      props: { modelValue: '', value: 'x', labelPosition: 'start', spread: true },
      slots: { default: 'X' },
    })
    const root = container.querySelector('.ds-radio') as HTMLElement
    expect(root.getAttribute('data-label-position')).toBe('start')
    expect(root.hasAttribute('data-spread')).toBe(true)
  })

  it('name (fallthrough) atterrit sur l’input pour former le groupe natif', () => {
    const { getByRole } = render(Radio, {
      props: { modelValue: '', value: 'x' },
      attrs: { name: 'groupe' },
      slots: { default: 'X' },
    })
    expect(getByRole('radio').getAttribute('name')).toBe('groupe')
  })
})
