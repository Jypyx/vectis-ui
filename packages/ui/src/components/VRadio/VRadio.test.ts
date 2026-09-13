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

  it('exposes focus and the real radio button, the root being the label', async () => {
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
})
