import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'

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
    expect(root.hasAttribute('data-spread')).toBe(true)
  })

  it('name (fallthrough) lands on the input to form the native group', () => {
    const { getByRole } = render(VRadio, {
      props: { modelValue: '', value: 'x' },
      attrs: { name: 'groupe' },
      slots: { default: 'X' },
    })
    expect(getByRole('radio').getAttribute('name')).toBe('groupe')
  })
})
