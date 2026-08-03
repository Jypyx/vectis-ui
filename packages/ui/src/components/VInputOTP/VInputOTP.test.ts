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
    const literals = container.querySelectorAll('.v-otp-literal')
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
    const literal = container.querySelector('.v-otp-literal')
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
