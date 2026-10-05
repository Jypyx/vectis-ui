import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VNumberInput from './VNumberInput.vue'
import { decimalsOf, numberSeparators, parseNumber, scale, stepValue } from './number'

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VNumberInput },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

/** A field bound to a model, its props written into the template. */
function renderField(attrs = '', initial: number | null = null) {
  const value = ref<number | null>(initial)
  const utils = renderHarness(
    `<VNumberInput v-model="value" label="Quantity" locale="en" ${attrs} />`,
    { value },
  )
  const input = utils.getByRole('spinbutton', { name: 'Quantity' }) as HTMLInputElement
  return { value, input, ...utils }
}

async function type(input: HTMLInputElement, text: string) {
  await fireEvent.focus(input)
  await fireEvent.update(input, text)
}

const key = (input: HTMLInputElement, name: string) => fireEvent.keyDown(input, { key: name })

describe('number helpers', () => {
  it('reads the separators of a locale', () => {
    expect(numberSeparators('en')).toEqual({ group: ',', decimal: '.' })
    expect(numberSeparators('de').decimal).toBe(',')
    expect(numberSeparators('de').group).toBe('.')
  })

  it('parses typed text in the locale, ignoring symbols', () => {
    const en = numberSeparators('en')
    const fr = numberSeparators('fr')
    const de = numberSeparators('de')
    expect(parseNumber('', en)).toBeNull()
    expect(parseNumber('  ', en)).toBeNull()
    expect(parseNumber('1,234.5', en)).toBe(1234.5)
    expect(parseNumber('1 234,5', fr)).toBe(1234.5)
    expect(parseNumber('1.5', fr)).toBe(1.5)
    expect(parseNumber('1.234,5', de)).toBe(1234.5)
    expect(parseNumber('−12', en)).toBe(-12)
    expect(parseNumber('$1,200.50', en)).toBe(1200.5)
    expect(parseNumber('25 %', fr)).toBe(25)
    expect(parseNumber('.5', en)).toBe(0.5)
    expect(parseNumber('abc', en)).toBeNaN()
    expect(parseNumber('1-2', en)).toBeNaN()
  })

  it('counts decimals and scales without drift', () => {
    expect(decimalsOf(3)).toBe(0)
    expect(decimalsOf(0.25)).toBe(2)
    expect(decimalsOf(1e-7)).toBe(7)
    expect(scale(0.07, 100)).toBe(7)
    expect(scale(7, 0.01)).toBe(0.07)
  })

  it('steps on the grid without drift, landing on it first when off it', () => {
    expect(stepValue(0.1, 2, 0.1, 0)).toBe(0.3)
    expect(stepValue(1.5, 1, 1, 0)).toBe(2)
    expect(stepValue(1.5, -1, 1, 0)).toBe(1)
    expect(stepValue(3, 10, 1, 0)).toBe(13)
    expect(stepValue(5, 1, 5, 2)).toBe(7)
  })
})

describe('VNumberInput', () => {
  it('is a spinbutton carrying its value, its bounds and the text it shows', async () => {
    const { input } = renderField(':min="0" :max="5000"', 1234.5)
    expect(input.getAttribute('inputmode')).toBe('decimal')
    expect(input.getAttribute('aria-valuenow')).toBe('1234.5')
    expect(input.getAttribute('aria-valuemin')).toBe('0')
    expect(input.getAttribute('aria-valuemax')).toBe('5000')
    expect(input.getAttribute('aria-valuetext')).toBe('1,234.5')
    expect(input.value).toBe('1,234.5')
  })

  it('an empty field has no value to announce', () => {
    const { input } = renderField()
    expect(input.hasAttribute('aria-valuenow')).toBe(false)
    expect(input.hasAttribute('aria-valuetext')).toBe(false)
    expect(input.value).toBe('')
  })

  it('shows the value formatted, and bare while it is edited', async () => {
    const value = ref<number | null>(1234.5)
    const { getByRole } = renderHarness(
      `<VNumberInput v-model="value" label="Price" locale="fr"
        :format-options="{ style: 'currency', currency: 'EUR' }" />`,
      { value },
    )
    const input = getByRole('spinbutton', { name: 'Price' }) as HTMLInputElement
    expect(input.value.replace(/\s/g, ' ')).toBe('1 234,50 €')
    await fireEvent.focus(input)
    expect(input.value).toBe('1234,5')
    await fireEvent.update(input, '99,9')
    await fireEvent.blur(input)
    expect(value.value).toBe(99.9)
    expect(input.value.replace(/\s/g, ' ')).toBe('99,90 €')
  })

  it('commits on blur, within the bounds', async () => {
    const { value, input } = renderField(':min="10" :max="20"')
    await type(input, '1')
    expect(value.value).toBeNull()
    await fireEvent.blur(input)
    expect(value.value).toBe(10)
    await type(input, '150')
    await fireEvent.blur(input)
    expect(value.value).toBe(20)
  })

  it('commits on Enter', async () => {
    const { value, input } = renderField()
    await type(input, '42')
    await key(input, 'Enter')
    expect(value.value).toBe(42)
  })

  it('undoes text that is not a number, and empties to null', async () => {
    const { value, input } = renderField('', 7)
    await type(input, 'seven')
    await fireEvent.blur(input)
    expect(value.value).toBe(7)
    expect(input.value).toBe('7')
    await type(input, '')
    await fireEvent.blur(input)
    expect(value.value).toBeNull()
  })

  it('steps with the arrow keys and ten steps with the page keys', async () => {
    const { value, input } = renderField(':step="0.1"', 0.1)
    await fireEvent.focus(input)
    await key(input, 'ArrowUp')
    await key(input, 'ArrowUp')
    expect(value.value).toBe(0.3)
    await key(input, 'PageDown')
    expect(value.value).toBe(-0.7)
    expect(input.value).toBe('-0.7')
  })

  it('steps from what is typed', async () => {
    const { value, input } = renderField('', 1)
    await type(input, '40')
    await key(input, 'ArrowUp')
    expect(value.value).toBe(41)
  })

  it('an empty field starts from 0, or from the nearest bound', async () => {
    const free = renderField()
    await key(free.input, 'ArrowDown')
    expect(free.value.value).toBe(0)
    free.unmount()

    const bounded = renderField(':min="5" :max="9"')
    await key(bounded.input, 'ArrowUp')
    expect(bounded.value.value).toBe(5)
  })

  it('Home and End go to the bounds, and are left to the caret without them', async () => {
    const { value, input, unmount } = renderField(':min="1" :max="9"', 4)
    await key(input, 'End')
    expect(value.value).toBe(9)
    await key(input, 'Home')
    expect(value.value).toBe(1)
    // Two apps would both number their first id v-0.
    unmount()

    const free = renderHarness('<VNumberInput label="Free" locale="en" :model-value="3" />')
    const freeInput = free.getByRole('spinbutton', { name: 'Free' })
    const event = new KeyboardEvent('keydown', { key: 'Home', cancelable: true })
    freeInput.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })

  it('split puts a minus before and a plus after, out of the tab order', async () => {
    const { value, getByRole } = renderField(':max="2"', 1)
    const minus = getByRole('button', { name: 'Decrease' })
    const plus = getByRole('button', { name: 'Increase' })
    expect(minus.getAttribute('tabindex')).toBe('-1')
    expect(minus.compareDocumentPosition(plus) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    await fireEvent.click(plus)
    expect(value.value).toBe(2)
    expect((plus as HTMLButtonElement).disabled).toBe(true)
    await fireEvent.click(minus)
    expect(value.value).toBe(1)
  })

  it('stacked puts both at the end, and none removes them', () => {
    const stacked = renderField('controls="stacked"')
    const buttons = stacked.container.querySelectorAll('.v-number-input-stack button')
    expect([...buttons].map((b) => b.getAttribute('aria-label'))).toEqual(['Increase', 'Decrease'])
    stacked.unmount()
    expect(renderField('controls="none"').queryAllByRole('button')).toHaveLength(0)
  })

  it('in split, a rule follows the plus only when the cross or the spinner comes after it', async () => {
    const divider = (attrs: string, initial: number | null) => {
      const field = renderField(attrs, initial)
      const found = !!field.container.querySelector('.v-number-input-divider')
      field.unmount()
      return found
    }
    expect(divider('', 3)).toBe(false)
    expect(divider('clearable', 3)).toBe(true)
    expect(divider('clearable', null)).toBe(false)
    expect(divider('clearable readonly', 3)).toBe(false)
    expect(divider('loading', null)).toBe(true)
    expect(divider('controls="stacked" clearable', 3)).toBe(false)
  })

  it('the button labels can be renamed', () => {
    const { getByRole } = renderField('increment-label="More" decrement-label="Less"')
    expect(getByRole('button', { name: 'More' })).toBeTruthy()
    expect(getByRole('button', { name: 'Less' })).toBeTruthy()
  })

  it('readonly refuses the keys and the buttons', async () => {
    const { value, input, getByRole } = renderField('readonly', 3)
    await key(input, 'ArrowUp')
    expect(value.value).toBe(3)
    expect((getByRole('button', { name: 'Increase' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('a percentage is typed and shown in hundredths of the value', async () => {
    const { value, input } = renderField(':format-options="{ style: \'percent\' }"', 0.25)
    expect(input.value).toBe('25%')
    await type(input, '7')
    await fireEvent.blur(input)
    expect(value.value).toBe(0.07)
  })

  it('submits the bare number through a hidden input carrying the name', async () => {
    const { container, input } = renderField('name="quantity" form="order"', 1234.5)
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(hidden.name).toBe('quantity')
    expect(hidden.getAttribute('form')).toBe('order')
    expect(hidden.value).toBe('1234.5')
    expect(input.hasAttribute('name')).toBe(false)
    // Written at once on Enter, before any render, for the submission it triggers.
    await fireEvent.focus(input)
    input.value = '8'
    input.dispatchEvent(new Event('input'))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(hidden.value).toBe('8')
  })

  it('the clear cross empties to null and emits clear', async () => {
    const cleared = ref(0)
    const value = ref<number | null>(5)
    const { getByRole } = renderHarness(
      '<VNumberInput v-model="value" label="Qty" locale="en" clearable @clear="cleared++" />',
      { value, cleared },
    )
    await fireEvent.click(getByRole('button', { name: 'Clear' }))
    await nextTick()
    expect(value.value).toBeNull()
    expect(cleared.value).toBe(1)
  })

  it('class and style land on the wrapper, the rest on the input', () => {
    const { container, input } = renderField('class="mine" data-qa="qty" aria-valuetext="five"')
    expect(container.querySelector('.v-input')?.classList.contains('mine')).toBe(true)
    expect(container.querySelector('.v-input')?.classList.contains('v-number-input')).toBe(true)
    expect(input.getAttribute('data-qa')).toBe('qty')
    expect(input.getAttribute('aria-valuetext')).toBe('five')
  })

  it('the error replaces the hint and marks the field invalid', () => {
    const { input, queryByText } = renderField('hint="Whole units" error="Too many"')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(queryByText('Whole units')).toBeNull()
    expect(queryByText('Too many')).toBeTruthy()
  })
})
