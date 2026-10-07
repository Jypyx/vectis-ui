import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VSelect from './VSelect.vue'
import type { SelectItem } from './VSelect.vue'

const OPTIONS = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgium' },
  { value: 'br', label: 'Brazil' },
  { value: 'mc', label: 'Monaco', disabled: true },
  { value: 'ca', label: 'Canada' },
]

function renderSelect(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
  return render(VSelect, {
    props: { options: OPTIONS, modelValue: '', ...props },
    attrs: { 'aria-label': 'Country', ...attrs },
  })
}

function renderHarness(template: string, bindings: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    components: { VSelect },
    setup: () => bindings,
    template,
  })
  return render(Harness)
}

const activeLabel = (container: Element) =>
  container.querySelector('[role="option"][data-active]')?.textContent?.trim()

const optionByText = (container: Element, text: string) =>
  [...container.querySelectorAll<HTMLElement>('[role="option"]')].find((o) =>
    o.textContent?.includes(text),
  )!

describe('VSelect', () => {
  it('is a button acting as a combobox bound to its listbox', async () => {
    const { getByRole, container } = renderSelect()
    const trigger = getByRole('combobox')
    const listbox = container.querySelector('[role="listbox"]') as HTMLElement
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger.getAttribute('type')).toBe('button')
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false)

    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-activedescendant')).toBe(
      container.querySelector('[role="option"][data-active]')?.id,
    )
  })

  it('loading puts an announced spinner in the place of the chevron', async () => {
    const { container, getByRole, rerender } = renderSelect({ loading: true })
    const field = container.querySelector('.v-input-field')!
    expect(field.querySelector('.v-listbox-chevron')).toBeNull()
    expect(getByRole('status').textContent).toBe('Loading…')
    await rerender({ loading: true, loadingText: 'Fetching countries' })
    expect(getByRole('status').textContent).toBe('Fetching countries')
    await rerender({ loading: false })
    expect(field.querySelector('.v-listbox-chevron')).not.toBeNull()
  })

  it('a loading list still opens', async () => {
    const { getByRole } = renderSelect({ loading: true })
    const trigger = getByRole('combobox')
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('is named by its label, which points at the button', () => {
    const { getByRole } = render(VSelect, { props: { options: OPTIONS, label: 'Country' } })
    expect(getByRole('combobox', { name: 'Country' }).tagName).toBe('BUTTON')
  })

  it('shows the chosen label, or the placeholder while nothing is chosen', async () => {
    const { getByRole, rerender } = renderSelect({ placeholder: 'Pick a country' })
    const trigger = getByRole('combobox')
    expect(trigger.querySelector('.v-select-placeholder')?.textContent).toBe('Pick a country')
    await rerender({ modelValue: 'be' })
    expect(trigger.textContent?.trim()).toBe('Belgium')
    expect(trigger.querySelector('.v-select-placeholder')).toBeNull()
  })

  it('opens on the chosen option and picks with Enter', async () => {
    const { getByRole, container, emitted } = renderSelect({ modelValue: 'br' })
    const trigger = getByRole('combobox')
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(activeLabel(container)).toBe('Brazil')
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    // Monaco is disabled: the highlight steps over it.
    expect(activeLabel(container)).toBe('Canada')
    await fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(emitted('update:modelValue')).toEqual([['ca']])
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('consumes Enter and Space on the closed button, so the list opens once', async () => {
    const { getByRole } = renderSelect()
    const trigger = getByRole('combobox')
    const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true })
    trigger.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(true)
    await nextTick()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('Escape closes without changing the value, and is left alone on a closed list', async () => {
    const { getByRole, emitted } = renderSelect({ modelValue: 'fr' })
    const trigger = getByRole('combobox')
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(emitted('update:modelValue')).toBeUndefined()

    const escape = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    trigger.dispatchEvent(escape)
    expect(escape.defaultPrevented).toBe(false)
  })

  it('Home, End, Page Up and Page Down jump to the ends of the list', async () => {
    const { getByRole, container } = renderSelect()
    const trigger = getByRole('combobox')
    await fireEvent.keyDown(trigger, { key: 'End' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(activeLabel(container)).toBe('Canada')
    await fireEvent.keyDown(trigger, { key: 'Home' })
    expect(activeLabel(container)).toBe('France')
    await fireEvent.keyDown(trigger, { key: 'PageDown' })
    expect(activeLabel(container)).toBe('Canada')
    await fireEvent.keyDown(trigger, { key: 'PageUp' })
    expect(activeLabel(container)).toBe('France')
  })

  it('typing highlights by prefix, and a repeated letter cycles', async () => {
    const { getByRole, container } = renderSelect()
    const trigger = getByRole('combobox')
    await fireEvent.keyDown(trigger, { key: 'b' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(activeLabel(container)).toBe('Belgium')
    await fireEvent.keyDown(trigger, { key: 'r' })
    expect(activeLabel(container)).toBe('Brazil')
  })

  it('a repeated letter cycles through the options it starts', async () => {
    const { getByRole, container } = renderSelect()
    const trigger = getByRole('combobox')
    await fireEvent.keyDown(trigger, { key: 'b' })
    expect(activeLabel(container)).toBe('Belgium')
    await fireEvent.keyDown(trigger, { key: 'b' })
    expect(activeLabel(container)).toBe('Brazil')
    await fireEvent.keyDown(trigger, { key: 'b' })
    expect(activeLabel(container)).toBe('Belgium')
  })

  it('Tab takes the highlighted option of a single list', async () => {
    const { getByRole, emitted } = renderSelect()
    const trigger = getByRole('combobox')
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await fireEvent.keyDown(trigger, { key: 'Tab' })
    expect(emitted('update:modelValue')).toEqual([['be']])
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('choosing the option already chosen emits nothing', async () => {
    const { getByRole, emitted } = renderSelect({ modelValue: 'be' })
    const trigger = getByRole('combobox')
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await fireEvent.keyDown(trigger, { key: 'Tab' })
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('a click toggles the list, and a click on an option picks it', async () => {
    const { getByRole, container } = renderHarness(
      `<VSelect v-model="value" :options="options" aria-label="Country" />
       <output>{{ value }}</output>`,
      { options: OPTIONS, value: ref('') },
    )
    const trigger = getByRole('combobox')
    await fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    await fireEvent.click(optionByText(container, 'Brazil'))
    await nextTick()
    expect(container.querySelector('output')?.textContent).toBe('br')
    expect(trigger.textContent?.trim()).toBe('Brazil')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('a disabled option cannot be picked', async () => {
    const { getByRole, container, emitted } = renderSelect()
    await fireEvent.click(getByRole('combobox'))
    await fireEvent.click(optionByText(container, 'Monaco'))
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('renders groups and separators as in VCombobox', async () => {
    const items: SelectItem[] = [
      { label: 'Europe', options: [{ value: 'fr', label: 'France' }] },
      { separator: true },
      { value: 'ca', label: 'Canada' },
    ]
    const { getByRole, container } = renderSelect({ options: items })
    await fireEvent.click(getByRole('combobox'))
    const groupEl = container.querySelector('[role="group"]') as HTMLElement
    expect(document.getElementById(groupEl.getAttribute('aria-labelledby')!)?.textContent).toBe(
      'Europe',
    )
    expect(container.querySelectorAll('.v-listbox-separator')).toHaveLength(1)
  })

  it('multiple: toggles with Enter, stays open and says so', async () => {
    const { getByRole, container, emitted } = renderSelect({ multiple: true, modelValue: ['fr'] })
    const trigger = getByRole('combobox')
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(container.querySelector('[role="listbox"]')?.getAttribute('aria-multiselectable')).toBe(
      'true',
    )
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(emitted('update:modelValue')).toEqual([[['fr', 'be']]])
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('multiple: one chip per value, whose cross removes it, and the button speaks them all', async () => {
    const { getByRole, emitted } = renderSelect({ multiple: true, modelValue: ['fr', 'ca'] })
    expect(getByRole('combobox').textContent?.trim()).toBe('France, Canada')
    await fireEvent.click(getByRole('button', { name: 'Remove France' }))
    expect(emitted('update:modelValue')).toEqual([[['ca']]])
  })

  it('multiple text display: the line is hidden from assistive technology', () => {
    const { container } = renderSelect({
      multiple: true,
      display: 'text',
      modelValue: ['fr', 'ca'],
    })
    const line = container.querySelector('.v-listbox-text')!
    expect(line.textContent).toBe('France, Canada')
    expect(line.getAttribute('aria-hidden')).toBe('true')
  })

  it('multiple: values beyond max are summed up while the field is not focused', () => {
    const { container } = renderSelect({
      multiple: true,
      max: 1,
      modelValue: ['fr', 'be', 'ca'],
    })
    expect(container.querySelectorAll('.v-chip[data-tone="accent"]')).toHaveLength(1)
    expect(container.querySelector('.v-listbox-overflow-chip')?.textContent?.trim()).toBe('+2')
  })

  it('the clear cross empties the selection and gives the focus back to the button', async () => {
    const { getByRole, emitted } = renderSelect({ clearable: true, modelValue: 'fr' })
    await fireEvent.click(getByRole('button', { name: 'Clear selection' }))
    expect(emitted('update:modelValue')).toEqual([['']])
    expect(emitted('clear')).toHaveLength(1)
  })

  it('read-only: the list never opens', async () => {
    const { getByRole } = renderSelect({ readonly: true, modelValue: 'fr' })
    const trigger = getByRole('combobox')
    expect(trigger.getAttribute('aria-readonly')).toBe('true')
    await fireEvent.click(trigger)
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('disabled: the button and the hidden select are both disabled', () => {
    const { getByRole, container } = renderSelect({ disabled: true })
    expect((getByRole('combobox') as HTMLButtonElement).disabled).toBe(true)
    expect(container.querySelector<HTMLSelectElement>('.v-select-native')!.disabled).toBe(true)
  })

  it('forwards attributes to the button, keeping class and style on the wrapper', () => {
    const { getByRole, container } = renderSelect(
      {},
      { id: 'country', class: 'mine', 'data-test': 'x', 'aria-label': 'Land' },
    )
    const trigger = getByRole('combobox')
    expect(trigger.id).toBe('country')
    expect(trigger.getAttribute('data-test')).toBe('x')
    expect(trigger.getAttribute('aria-label')).toBe('Land')
    expect(container.querySelector('.v-select')?.classList.contains('mine')).toBe(true)
    expect(trigger.classList.contains('mine')).toBe(false)
  })
})

describe('VSelect in a form', () => {
  it('the hidden select carries the name and the value, the button stays out of the form', async () => {
    const { container, getByRole } = renderSelect({ modelValue: 'be' }, { name: 'country' })
    await nextTick()
    const native = container.querySelector<HTMLSelectElement>('.v-select-native')!
    expect(native.name).toBe('country')
    expect(native.value).toBe('be')
    expect(native.tabIndex).toBe(-1)
    expect(native.getAttribute('aria-hidden')).toBe('true')
    expect(getByRole('combobox').hasAttribute('name')).toBe(false)
  })

  it('submits numbers as their text, and several values in a multiple field', async () => {
    const { container } = renderSelect(
      {
        multiple: true,
        options: [
          { value: 1, label: 'One' },
          { value: 2, label: 'Two' },
        ],
        modelValue: [1, 2],
      },
      { name: 'n' },
    )
    await nextTick()
    const native = container.querySelector<HTMLSelectElement>('.v-select-native')!
    expect([...native.selectedOptions].map((o) => o.value)).toEqual(['1', '2'])
  })

  it('required goes to the hidden select, and to the button as aria-required', () => {
    const { container, getByRole } = renderSelect({}, { required: true })
    expect(container.querySelector<HTMLSelectElement>('.v-select-native')!.required).toBe(true)
    const trigger = getByRole('combobox')
    expect(trigger.getAttribute('aria-required')).toBe('true')
    expect(trigger.hasAttribute('required')).toBe(false)
  })

  it('a failed validation marks the field invalid until a value satisfies it', async () => {
    const { container, getByRole } = renderHarness(
      `<form><VSelect v-model="value" :options="options" aria-label="Country" required /></form>`,
      { options: OPTIONS, value: ref('') },
    )
    const native = container.querySelector<HTMLSelectElement>('.v-select-native')!
    const trigger = getByRole('combobox')
    expect(native.checkValidity()).toBe(false)
    await nextTick()
    expect(trigger.getAttribute('aria-invalid')).toBe('true')

    await fireEvent.click(trigger)
    await fireEvent.click(optionByText(container, 'France'))
    await nextTick()
    await nextTick()
    expect(trigger.hasAttribute('aria-invalid')).toBe(false)
  })

  it('autofill writing the hidden select reaches the model, as the option value', async () => {
    const { container, emitted } = renderSelect({
      options: [
        { value: 1, label: 'One' },
        { value: 2, label: 'Two' },
      ],
    })
    const native = container.querySelector<HTMLSelectElement>('.v-select-native')!
    native.value = '2'
    await fireEvent.change(native)
    expect(emitted('update:modelValue')).toEqual([[2]])
  })

  it('a form reset restores the value the field was created with', async () => {
    const { container, getByRole } = renderHarness(
      `<form><VSelect v-model="value" :options="options" aria-label="Country" /></form>
       <output>{{ value }}</output>`,
      { options: OPTIONS, value: ref('fr') },
    )
    await fireEvent.click(getByRole('combobox'))
    await fireEvent.click(optionByText(container, 'Canada'))
    await nextTick()
    expect(container.querySelector('output')?.textContent).toBe('ca')

    container.querySelector('form')!.reset()
    await nextTick()
    expect(container.querySelector('output')?.textContent).toBe('fr')
    await new Promise((resolve) => setTimeout(resolve))
    expect(container.querySelector<HTMLSelectElement>('.v-select-native')!.value).toBe('fr')
  })

  it('the hidden select hands a focus it receives to the button', async () => {
    const { container, getByRole } = renderSelect()
    container.querySelector<HTMLSelectElement>('.v-select-native')!.focus()
    expect(document.activeElement).toBe(getByRole('combobox'))
  })
})
