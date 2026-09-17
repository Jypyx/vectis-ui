import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VInputOTP from './VInputOTP.vue'

function renderOtp(props: Record<string, unknown> = {}) {
  return render(VInputOTP, { props: { modelValue: '', ...props } })
}

describe('VInputOTP', () => {
  it('renders N named cells inside a labelled group', () => {
    const { getByRole, getAllByRole } = renderOtp({ length: 4 })
    expect(getByRole('group', { name: 'Verification code' })).toBeTruthy()
    expect(getAllByRole('textbox')).toHaveLength(4)
    expect(getAllByRole('textbox')[0]?.getAttribute('autocomplete')).toBe('one-time-code')
  })

  it('typing fills the cell, advances the focus and synchronizes the model', async () => {
    const { getAllByRole, emitted } = renderOtp()
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, '1')
    expect(emitted('update:modelValue').at(-1)).toEqual(['1'])
    expect(document.activeElement).toBe(inputs[1])
  })

  it('a paste is distributed across the cells and emits complete', async () => {
    const { getAllByRole, emitted } = renderOtp({ length: 4 })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, '1234')
    expect(emitted('update:modelValue').at(-1)).toEqual(['1234'])
    expect(emitted('complete')).toEqual([['1234']])
  })

  it('the numeric format (the default) filters out non-numeric characters', async () => {
    const { getAllByRole, emitted } = renderOtp()
    const input = getAllByRole('textbox')[0] as HTMLInputElement
    await fireEvent.update(input, 'a')
    expect(input.value).toBe('')
    expect(emitted()).not.toHaveProperty('update:modelValue')
  })

  it('the alpha format filters out digits and forces capitals', async () => {
    const { getAllByRole, emitted } = renderOtp({ format: 'alpha' })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, '3')
    expect(emitted()).not.toHaveProperty('update:modelValue')
    await fireEvent.update(inputs[0]!, 'a')
    expect(inputs[0]!.value).toBe('A')
    expect(emitted('update:modelValue').at(-1)).toEqual(['A'])
  })

  it('the alphanumeric format accepts letters and digits, in capitals', async () => {
    const { getAllByRole, emitted } = renderOtp({ format: 'alphanumeric', length: 4 })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, 'a1b2')
    expect(emitted('update:modelValue').at(-1)).toEqual(['A1B2'])
    expect(emitted('complete')).toEqual([['A1B2']])
  })

  it('Backspace on an empty cell erases the previous one and goes back to it', async () => {
    const { getAllByRole, emitted } = renderOtp({ modelValue: '12' })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    inputs[2]!.focus()
    await fireEvent.keyDown(inputs[2]!, { key: 'Backspace' })
    expect(emitted('update:modelValue').at(-1)).toEqual(['1'])
    expect(document.activeElement).toBe(inputs[1])
  })

  it('pattern: the # become cells, the literals become decorative text', () => {
    const { container, getAllByRole } = renderOtp({ pattern: '###.###.###' })
    const inputs = getAllByRole('textbox')
    expect(inputs).toHaveLength(9)
    expect(inputs[3]?.getAttribute('aria-label')).toBe('Character 4 of 9')
    const literals = container.querySelectorAll('.v-input-otp-literal')
    expect(literals).toHaveLength(2)
    expect(literals[0]?.textContent).toBe('.')
    expect(literals[0]?.getAttribute('aria-hidden')).toBe('true')
  })

  it('pattern wins over length', () => {
    expect(renderOtp({ pattern: '##-##', length: 6 }).getAllByRole('textbox')).toHaveLength(4)
  })

  it('a pattern with no # falls back to length (with a DEV warning)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(renderOtp({ pattern: 'abc', length: 6 }).getAllByRole('textbox')).toHaveLength(6)
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('pasting the formatted string: the literals are consumed', async () => {
    const { getAllByRole, emitted } = renderOtp({ pattern: '###.###.###' })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, '123.456.789')
    expect(emitted('update:modelValue').at(-1)).toEqual(['123456789'])
    expect(emitted('complete')).toEqual([['123456789']])
  })

  it('a paste with a literal prefix ("GT-123" onto GT-###) keeps only the cells', async () => {
    const { getAllByRole, emitted } = renderOtp({ pattern: 'GT-###' })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    await fireEvent.update(inputs[0]!, 'GT-123')
    expect(emitted('update:modelValue').at(-1)).toEqual(['123'])
    expect(emitted('complete')).toEqual([['123']])
  })

  it('Backspace crosses a literal: it erases the previous slot', async () => {
    const { getAllByRole, emitted } = renderOtp({ pattern: '##-##', modelValue: '12' })
    const inputs = getAllByRole('textbox') as HTMLInputElement[]
    inputs[2]!.focus()
    await fireEvent.keyDown(inputs[2]!, { key: 'Backspace' })
    expect(emitted('update:modelValue').at(-1)).toEqual(['1'])
    expect(document.activeElement).toBe(inputs[1])
  })

  it('separatorIcon replaces the literals with an icon', () => {
    const { container } = renderOtp({ pattern: '##-##', separatorIcon: 'horizontal_rule' })
    const literal = container.querySelector('.v-input-otp-literal')
    expect(literal?.textContent).not.toContain('-')
    expect(literal?.querySelector('.v-icon-symbol')?.textContent).toBe('horizontal_rule')
  })

  it('sets data-size/data-compact/data-disabled on the root', () => {
    const { getByRole, getAllByRole } = renderOtp({ size: 'sm', compact: true, disabled: true })
    const group = getByRole('group')
    expect(group.getAttribute('data-size')).toBe('sm')
    expect(group.hasAttribute('data-compact')).toBe(true)
    expect(group.hasAttribute('data-disabled')).toBe(true)
    expect((getAllByRole('textbox')[0] as HTMLInputElement).disabled).toBe(true)
  })
})

describe('VInputOTP — hint', () => {
  it('renders the hint and ties it to the group', () => {
    const { container } = renderOtp({ hint: 'Sent to +33 6 12 34 56 78' })
    const group = container.querySelector('[role="group"]') as HTMLElement
    const hint = container.querySelector('.v-input-otp-hint') as HTMLElement
    expect(hint.textContent).toContain('Sent to')
    expect(group.getAttribute('aria-describedby')).toBe(hint.id)
  })

  it("appends the hint to the consumer's own describedby rather than replacing it", () => {
    const { container } = render(VInputOTP, {
      props: { modelValue: '', hint: 'Six digits' },
      attrs: { 'aria-describedby': 'outside' },
    })
    const group = container.querySelector('[role="group"]') as HTMLElement
    const hint = container.querySelector('.v-input-otp-hint') as HTMLElement
    expect(group.getAttribute('aria-describedby')).toBe('outside ' + hint.id)
  })

  it('with no hint the group points at nothing of its own', () => {
    const { container } = renderOtp()
    expect(container.querySelector('[role="group"]')?.hasAttribute('aria-describedby')).toBe(false)
  })
})

describe('VInputOTP — the code stays positional', () => {
  const boxes = (getAllByRole: (role: string) => HTMLElement[]) =>
    getAllByRole('textbox') as HTMLInputElement[]

  it('readonly: Backspace on an empty box erases nothing', async () => {
    const { getAllByRole, emitted } = renderOtp({ modelValue: '12', readonly: true })
    const inputs = boxes(getAllByRole)
    await fireEvent.keyDown(inputs[2]!, { key: 'Backspace' })
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(inputs[1]!.value).toBe('2')
  })

  // The value is the filled boxes read in order, so the filled boxes must stay a prefix:
  // a character typed past the first empty box lands in that box instead.
  it('typing into a box past the first empty one fills the first empty one', async () => {
    const { getAllByRole, emitted } = renderOtp({ length: 4, modelValue: '1' })
    const inputs = boxes(getAllByRole)
    await fireEvent.update(inputs[2]!, '3')
    expect(emitted('update:modelValue').at(-1)).toEqual(['13'])
    expect(inputs.map((i) => i.value)).toEqual(['1', '3', '', ''])
  })

  it('focusing a box past the first empty one moves the focus back to it', async () => {
    const { getAllByRole } = renderOtp({ length: 4, modelValue: '1' })
    const inputs = boxes(getAllByRole)
    inputs[3]!.focus()
    await fireEvent.focus(inputs[3]!)
    expect(document.activeElement).toBe(inputs[1])
  })

  it('emptying a box in the middle closes the gap', async () => {
    const { getAllByRole, emitted } = renderOtp({ length: 4, modelValue: '1234' })
    const inputs = boxes(getAllByRole)
    await fireEvent.update(inputs[1]!, '')
    expect(emitted('update:modelValue').at(-1)).toEqual(['134'])
    expect(inputs.map((i) => i.value)).toEqual(['1', '3', '4', ''])
  })

  it('an invalid character typed over a middle box closes the gap too', async () => {
    const { getAllByRole, emitted } = renderOtp({ length: 4, modelValue: '1234' })
    const inputs = boxes(getAllByRole)
    await fireEvent.update(inputs[1]!, 'x')
    expect(emitted('update:modelValue').at(-1)).toEqual(['134'])
  })

  it('complete is emitted when the code BECOMES full, not on every write of a full code', async () => {
    const { getAllByRole, emitted } = renderOtp({ length: 4 })
    const inputs = boxes(getAllByRole)
    await fireEvent.update(inputs[0]!, '1234')
    expect(emitted('complete')).toEqual([['1234']])
    await fireEvent.update(inputs[3]!, '4')
    expect(emitted('complete')).toHaveLength(1)
  })

  // A filled box whose content was not selected receives the new character NEXT to the old
  // one: it is the new character that counts.
  it('a character typed next to the old one in a filled box replaces it', async () => {
    const { getAllByRole, emitted } = renderOtp({ length: 4, modelValue: '1234' })
    const inputs = boxes(getAllByRole)
    const last = inputs[3]!
    last.value = '47'
    last.setSelectionRange(2, 2)
    await fireEvent.input(last)
    expect(emitted('update:modelValue').at(-1)).toEqual(['1237'])
    expect(last.value).toBe('7')
  })

  it('a single typed character equal to a literal of the pattern fills the box', async () => {
    const { getAllByRole, emitted } = renderOtp({ pattern: 'GT-###', format: 'alphanumeric' })
    await fireEvent.update(boxes(getAllByRole)[0]!, 'g')
    expect(emitted('update:modelValue').at(-1)).toEqual(['G'])
  })

  it('shows an external value through the format filter', () => {
    const { getAllByRole } = renderOtp({ length: 4, modelValue: 'ab12' })
    expect(boxes(getAllByRole).map((i) => i.value)).toEqual(['1', '2', '', ''])
  })

  it('Home and End move to the first box and to the first empty one', async () => {
    const { getAllByRole } = renderOtp({ length: 4, modelValue: '12' })
    const inputs = boxes(getAllByRole)
    inputs[1]!.focus()
    await fireEvent.keyDown(inputs[1]!, { key: 'End' })
    expect(document.activeElement).toBe(inputs[2])
    await fireEvent.keyDown(inputs[2]!, { key: 'Home' })
    expect(document.activeElement).toBe(inputs[0])
  })
})

describe('VInputOTP — in a form', () => {
  const native = (container: Element) =>
    container.querySelector('input.v-input-otp-native') as HTMLInputElement | null

  it('submits the code under its name, and keeps name/required/form off the group', async () => {
    const { container } = render(VInputOTP, {
      props: { modelValue: '1234', length: 4 },
      attrs: { name: 'code', required: '', form: 'login' },
    })
    const input = native(container)!
    expect(input.name).toBe('code')
    expect(input.value).toBe('1234')
    expect(input.required).toBe(true)
    expect(input.getAttribute('form')).toBe('login')
    const group = container.querySelector('[role="group"]')!
    expect(group.hasAttribute('name')).toBe(false)
    expect(group.hasAttribute('required')).toBe(false)
  })

  it('an incomplete code fails validation, a complete one passes', async () => {
    const { container, rerender } = render(VInputOTP, {
      props: { modelValue: '12', length: 4 },
      attrs: { name: 'code', required: '' },
    })
    expect(native(container)!.checkValidity()).toBe(false)
    await rerender({ modelValue: '1234' })
    expect(native(container)!.checkValidity()).toBe(true)
  })

  it('the native input is hidden from assistive technology and out of the tab order', () => {
    const { container, getAllByRole } = render(VInputOTP, {
      props: { modelValue: '', length: 4 },
      attrs: { name: 'code' },
    })
    const input = native(container)!
    expect(input.getAttribute('aria-hidden')).toBe('true')
    expect(input.tabIndex).toBe(-1)
    expect(getAllByRole('textbox')).toHaveLength(4)
  })
})
