import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VStepper from './VStepper.vue'
import type { StepperStep } from './VStepper.vue'

const STEPS: StepperStep[] = [
  { value: 'account', title: 'Account' },
  { value: 'shipping', title: 'Shipping', description: 'Where it goes' },
  { value: 'payment', title: 'Payment' },
  { value: 'review', title: 'Review' },
]

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VStepper },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

function renderStepper(attrs = '', initial: string | undefined = 'shipping', steps = STEPS) {
  const value = ref(initial)
  const utils = renderHarness(`<VStepper v-model="value" :steps="steps" ${attrs} />`, {
    value,
    steps,
  })
  const items = () => [...utils.container.querySelectorAll<HTMLElement>('.v-stepper-step')]
  return { value, items, ...utils }
}

describe('VStepper', () => {
  it('is an ordered list named from the dictionary, the current step marked', () => {
    const { getByRole, items } = renderStepper()
    expect(getByRole('list', { name: 'Progress' }).tagName).toBe('OL')
    const current = items()[1]!.querySelector('[aria-current]')
    expect(current?.getAttribute('aria-current')).toBe('step')
    expect(items().filter((item) => item.querySelector('[aria-current]'))).toHaveLength(1)
  })

  it('label renames the list', () => {
    const { getByRole } = renderStepper('label="Checkout"')
    expect(getByRole('list', { name: 'Checkout' })).toBeTruthy()
  })

  it('derives the states: done before the current step, upcoming after it', () => {
    const { items } = renderStepper('', 'payment')
    expect(items().map((item) => item.dataset.state)).toEqual([
      'completed',
      'completed',
      'active',
      'upcoming',
    ])
  })

  it('an explicit completed and an error override the derivation', () => {
    const steps: StepperStep[] = [
      { value: 'a', title: 'A', completed: false },
      { value: 'b', title: 'B', error: true },
      { value: 'c', title: 'C' },
      { value: 'd', title: 'D', completed: true },
    ]
    const { items } = renderStepper('', 'c', steps)
    expect(items().map((item) => item.dataset.state)).toEqual([
      'upcoming',
      'error',
      'active',
      'completed',
    ])
  })

  it('says in words what the tick and the exclamation mark show', () => {
    const steps: StepperStep[] = [
      { value: 'a', title: 'A' },
      { value: 'b', title: 'B', error: true },
      { value: 'c', title: 'C' },
    ]
    const { items } = renderStepper('', 'c', steps)
    expect(items()[0]!.querySelector('.v-visually-hidden')?.textContent?.trim()).toBe('Completed')
    expect(items()[1]!.querySelector('.v-visually-hidden')?.textContent?.trim()).toBe('Error')
    expect(items()[0]!.querySelector('.v-stepper-indicator')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
  })

  it('numbers the steps that are neither done nor in error', () => {
    const { items } = renderStepper()
    expect(items()[2]!.querySelector('.v-stepper-indicator')?.textContent?.trim()).toBe('3')
  })

  it('linear: the steps reached are buttons, the ones ahead are not', async () => {
    const { value, items, getByRole } = renderStepper()
    expect(items().map((item) => !!item.querySelector('button'))).toEqual([
      true,
      true,
      false,
      false,
    ])
    await fireEvent.click(getByRole('button', { name: /Account/ }))
    expect(value.value).toBe('account')
  })

  it('linear: going back keeps the steps already reached within reach', async () => {
    const { value, items } = renderStepper('', 'payment')
    value.value = 'account'
    await nextTick()
    expect(items().map((item) => !!item.querySelector('button'))).toEqual([true, true, true, false])
  })

  it('nonLinear makes every step a button, except a disabled one', () => {
    const steps: StepperStep[] = [...STEPS.slice(0, 3), { ...STEPS[3]!, disabled: true }]
    const { items } = renderStepper('non-linear', 'account', steps)
    expect(items().map((item) => !!item.querySelector('button'))).toEqual([true, true, true, false])
    expect(items()[3]!.hasAttribute('data-disabled')).toBe(true)
  })

  it('without a model, or with an unknown one, the first step is current', () => {
    for (const model of [undefined, 'unknown']) {
      const { container, unmount } = renderHarness(
        '<VStepper :model-value="model" :steps="steps" />',
        { model, steps: STEPS },
      )
      const first = container.querySelector<HTMLElement>('.v-stepper-step')!
      expect(first.dataset.state).toBe('active')
      expect(first.querySelector('[aria-current="step"]')).toBeTruthy()
      unmount()
    }
  })

  it('draws a connector between steps, not after the last', () => {
    const { items } = renderStepper()
    expect(items().map((item) => !!item.querySelector('.v-stepper-connector'))).toEqual([
      true,
      true,
      true,
      false,
    ])
  })

  it('orientation is exposed as data-orientation, and attributes fall through', () => {
    const { container } = renderStepper('orientation="vertical" data-qa="steps"')
    const list = container.querySelector('ol')
    expect(list?.dataset.orientation).toBe('vertical')
    expect(list?.getAttribute('data-qa')).toBe('steps')
  })

  it('the #indicator slot replaces the circle content', () => {
    const value = ref('a')
    const { container } = renderHarness(
      `<VStepper v-model="value" :steps="steps">
        <template #indicator="{ index, state }">{{ state }}-{{ index }}</template>
      </VStepper>`,
      { value, steps: [{ value: 'a', title: 'A' }] },
    )
    expect(container.querySelector('.v-stepper-indicator')?.textContent?.trim()).toBe('active-0')
  })
})
