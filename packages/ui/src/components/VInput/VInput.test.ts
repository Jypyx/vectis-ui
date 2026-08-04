import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VInput from './VInput.vue'

describe('VInput', () => {
  it('syncs v-model (update:modelValue)', async () => {
    const { getByRole, emitted } = render(VInput, {
      props: { modelValue: '' },
    })
    const input = getByRole('textbox') as HTMLInputElement
    await fireEvent.update(input, 'bonjour')
    expect(emitted('update:modelValue')).toEqual([['bonjour']])
  })

  it("displays the model's value", () => {
    const { getByRole } = render(VInput, {
      props: { modelValue: 'initial' },
    })
    expect((getByRole('textbox') as HTMLInputElement).value).toBe('initial')
  })

  it('invalid sets aria-invalid, nothing otherwise', async () => {
    const { getByRole, rerender } = render(VInput, {
      props: { modelValue: '', invalid: true },
    })
    expect(getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
    await rerender({ invalid: false })
    expect(getByRole('textbox').hasAttribute('aria-invalid')).toBe(false)
  })

  it('lets the native attributes through onto the control (type, required, name)', () => {
    const { getByRole } = render(VInput, {
      props: { modelValue: '' },
      attrs: { type: 'email', required: true, name: 'email', placeholder: 'votre@email.fr' },
    })
    const input = getByRole('textbox')
    expect(input.getAttribute('type')).toBe('email')
    expect(input.hasAttribute('required')).toBe(true)
    expect(input.getAttribute('name')).toBe('email')
    expect(input.getAttribute('placeholder')).toBe('votre@email.fr')
  })

  it('class and style land on the root, not on the control', () => {
    const { container, getByRole } = render(VInput, {
      props: { modelValue: '' },
      attrs: { class: 'consommateur', style: 'width: 320px' },
    })
    const root = container.querySelector('.v-input') as HTMLElement
    const input = getByRole('textbox')
    expect(root.classList.contains('consommateur')).toBe(true)
    expect(root.style.width).toBe('320px')
    expect(input.classList.contains('consommateur')).toBe(false)
    expect(input.getAttribute('style')).toBeNull()
  })

  it('the label is associated with the control through for/id', () => {
    const { getByLabelText } = render(VInput, {
      props: { modelValue: '', label: 'Email' },
    })
    const input = getByLabelText('Email')
    expect(input.classList.contains('v-input-control')).toBe(true)
  })

  it("the hint is rendered and linked through aria-describedby (merged with the consumer's)", () => {
    const { getByRole, getByText } = render(VInput, {
      props: { modelValue: '', hint: 'Format attendu : a@b.fr' },
      attrs: { 'aria-describedby': 'externe' },
    })
    const hint = getByText('Format attendu : a@b.fr')
    const describedBy = getByRole('textbox').getAttribute('aria-describedby')
    expect(describedBy).toContain('externe')
    expect(describedBy).toContain(hint.id)
  })

  it('decorative icons: no button rendered', () => {
    const { queryByRole } = render(VInput, {
      props: { modelValue: '', iconStart: 'search', iconEnd: 'visibility' },
    })
    expect(queryByRole('button')).toBeNull()
  })

  it('clickable icon: an accessible button, the event emitted, no leak onto the input', async () => {
    const onClick = vi.fn()
    const { getByRole, emitted } = render(VInput, {
      props: { modelValue: '', iconEnd: 'visibility', iconEndLabel: 'Show the password' },
      attrs: { 'onClick:iconEnd': onClick },
    })
    const button = getByRole('button', { name: 'Show the password' })
    await fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
    expect(emitted('click:icon-end')).toHaveLength(1)
    expect(getByRole('textbox').hasAttribute('onclick:iconend')).toBe(false)
  })

  it('clear: visible only when non-empty, empties the field and refocuses the control', async () => {
    const { getByRole, queryByRole, rerender, emitted } = render(VInput, {
      props: { modelValue: '', clearable: true },
    })
    expect(queryByRole('button', { name: 'Clear' })).toBeNull()
    await rerender({ modelValue: 'text' })
    const clear = getByRole('button', { name: 'Clear' })
    await fireEvent.click(clear)
    expect(emitted('update:modelValue')).toEqual([['']])
    expect(emitted('clear')).toHaveLength(1)
    expect(document.activeElement).toBe(getByRole('textbox'))
  })

  it('clear: hidden when disabled and when readonly', () => {
    const { queryByRole, container } = render(VInput, {
      props: { modelValue: 'text', clearable: true, disabled: true },
    })
    expect(queryByRole('button', { name: 'Effacer' })).toBeNull()
    expect(container.querySelector('.v-input')?.hasAttribute('data-disabled')).toBe(true)

    const readonly = render(VInput, {
      props: { modelValue: 'text', clearable: true, readonly: true },
    })
    expect(readonly.queryByRole('button', { name: 'Effacer' })).toBeNull()
    expect(readonly.container.querySelector('.v-input')?.hasAttribute('data-readonly')).toBe(true)
  })

  it('loading: the spinner is present, the end icon absent', () => {
    const { getByRole, container } = render(VInput, {
      props: { modelValue: '', loading: true, iconEnd: 'visibility' },
    })
    expect(getByRole('status')).toBeTruthy()
    expect(container.querySelectorAll('.v-icon')).toHaveLength(0)
  })

  it('blocking maxlength: the native attribute is set', () => {
    const { getByRole } = render(VInput, {
      props: { modelValue: '', maxlength: 10 },
    })
    expect(getByRole('textbox').getAttribute('maxlength')).toBe('10')
  })

  it('softLimit: no native maxlength, customError beyond the limit', async () => {
    const { getByRole, rerender } = render(VInput, {
      props: { modelValue: 'ok', maxlength: 5, softLimit: true },
    })
    const input = getByRole('textbox') as HTMLInputElement
    expect(input.hasAttribute('maxlength')).toBe(false)
    expect(input.validity.customError).toBe(false)
    await rerender({ modelValue: 'trop long' })
    expect(input.validity.customError).toBe(true)
    await rerender({ modelValue: 'ok' })
    expect(input.validity.customError).toBe(false)
  })

  it('counter: "n/max", data-over beyond it', async () => {
    const { container, rerender } = render(VInput, {
      props: { modelValue: 'abc', maxlength: 10, softLimit: true, counter: true },
    })
    const counter = container.querySelector('.v-input-counter') as HTMLElement
    expect(counter.textContent?.trim()).toBe('3/10')
    expect(counter.hasAttribute('data-over')).toBe(false)
    await rerender({ modelValue: 'abcdefghijk' })
    expect(counter.textContent?.trim()).toBe('11/10')
    expect(counter.hasAttribute('data-over')).toBe(true)
  })

  it('numeric model: the value rendered, counter and cross measured on the text', () => {
    // On `type="number"`, Vue casts the v-model value to a number: the model must
    // accept a number without breaking the length measurements.
    const { container, getByRole } = render(VInput, {
      props: { modelValue: 150, type: 'number', maxlength: 2, counter: true, clearable: true },
    })
    expect((getByRole('spinbutton') as HTMLInputElement).value).toBe('150')
    const counter = container.querySelector('.v-input-counter') as HTMLElement
    expect(counter.textContent?.trim()).toBe('3/2')
    expect(counter.hasAttribute('data-over')).toBe(true)
    expect(container.querySelector('.v-input-clear')).toBeTruthy()
  })

  it('disabled: the internal buttons are disabled', () => {
    const onClick = vi.fn()
    const { getByRole } = render(VInput, {
      props: { modelValue: '', iconStart: 'search', iconStartLabel: 'Rechercher', disabled: true },
      attrs: { 'onClick:iconStart': onClick },
    })
    const button = getByRole('button', { name: 'Rechercher' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('readonly: the native attribute is set on the control', () => {
    const { getByRole } = render(VInput, {
      props: { modelValue: '', readonly: true },
    })
    expect(getByRole('textbox').hasAttribute('readonly')).toBe(true)
  })

  it("type: 'text' by default, the prop is set on the control", () => {
    const { getByRole, rerender } = render(VInput, {
      props: { modelValue: '' },
    })
    expect(getByRole('textbox').getAttribute('type')).toBe('text')
    return rerender({ type: 'email' }).then(() => {
      expect(getByRole('textbox').getAttribute('type')).toBe('email')
    })
  })

  it('compact: data-compact set on the root', () => {
    const { container } = render(VInput, {
      props: { modelValue: '', compact: true },
    })
    expect(container.querySelector('.v-input')?.hasAttribute('data-compact')).toBe(true)
  })
})
