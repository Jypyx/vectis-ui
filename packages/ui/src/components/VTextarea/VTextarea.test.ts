import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VTextarea from './VTextarea.vue'

describe('VTextarea', () => {
  it('syncs v-model (update:modelValue)', async () => {
    const { getByRole, emitted } = render(VTextarea, {
      props: { modelValue: '' },
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await fireEvent.update(textarea, 'ligne 1\nligne 2')
    expect(emitted('update:modelValue')).toEqual([['ligne 1\nligne 2']])
  })

  it('invalid sets aria-invalid, autoGrow sets data-auto-grow on the field', () => {
    const { getByRole, container } = render(VTextarea, {
      props: { modelValue: '', invalid: true, autoGrow: true },
    })
    expect(getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
    const field = container.querySelector('.v-textarea-field') as HTMLElement
    expect(field.hasAttribute('data-auto-grow')).toBe(true)
  })

  it('lets the native attributes through onto the control (required, name, rows)', () => {
    const { getByRole } = render(VTextarea, {
      props: { modelValue: '' },
      attrs: { required: true, name: 'bio', rows: 5 },
    })
    const textarea = getByRole('textbox')
    expect(textarea.hasAttribute('required')).toBe(true)
    expect(textarea.getAttribute('name')).toBe('bio')
    expect(textarea.getAttribute('rows')).toBe('5')
  })

  it('class and style land on the root, not on the control', () => {
    const { container, getByRole } = render(VTextarea, {
      props: { modelValue: '' },
      attrs: { class: 'consommateur', style: 'width: 320px' },
    })
    const root = container.querySelector('.v-textarea') as HTMLElement
    expect(root.classList.contains('consommateur')).toBe(true)
    expect(root.style.width).toBe('320px')
    expect(getByRole('textbox').classList.contains('consommateur')).toBe(false)
  })

  it('the label is associated with the control through for/id, the hint linked through aria-describedby', () => {
    const { getByLabelText, getByText } = render(VTextarea, {
      props: { modelValue: '', label: 'Bio', hint: '500 caractères max' },
    })
    const textarea = getByLabelText('Bio')
    expect(textarea.classList.contains('v-textarea-control')).toBe(true)
    const hint = getByText('500 caractères max')
    expect(textarea.getAttribute('aria-describedby')).toContain(hint.id)
  })

  it('clickable icon: an accessible button and the event emitted', async () => {
    const onClick = vi.fn()
    const { getByRole, emitted } = render(VTextarea, {
      props: { modelValue: '', iconEnd: 'edit', iconEndLabel: 'Modifier' },
      attrs: { 'onClick:iconEnd': onClick },
    })
    await fireEvent.click(getByRole('button', { name: 'Modifier' }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(emitted('click:icon-end')).toHaveLength(1)
  })

  it('clear: empties the field, emits clear and refocuses the control; hidden when readonly', async () => {
    const { getByRole, emitted } = render(VTextarea, {
      props: { modelValue: 'text', clearable: true },
    })
    await fireEvent.click(getByRole('button', { name: 'Clear' }))
    expect(emitted('update:modelValue')).toEqual([['']])
    expect(emitted('clear')).toHaveLength(1)
    expect(document.activeElement).toBe(getByRole('textbox'))

    const readonly = render(VTextarea, {
      props: { modelValue: 'text', clearable: true, readonly: true },
    })
    expect(readonly.queryByRole('button', { name: 'Clear' })).toBeNull()
  })

  it('loading: the spinner is present, the end icon absent', () => {
    const { getByRole, container } = render(VTextarea, {
      props: { modelValue: '', loading: true, iconEnd: 'edit' },
    })
    expect(getByRole('status')).toBeTruthy()
    expect(container.querySelectorAll('.v-icon')).toHaveLength(0)
  })

  it('softLimit: no native maxlength, customError beyond the limit', async () => {
    const { getByRole, rerender } = render(VTextarea, {
      props: { modelValue: 'ok', maxlength: 5, softLimit: true },
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.hasAttribute('maxlength')).toBe(false)
    expect(textarea.validity.customError).toBe(false)
    await rerender({ modelValue: 'trop long' })
    expect(textarea.validity.customError).toBe(true)
  })

  it('counter: under the field in the meta row, data-over beyond the limit', async () => {
    const { container, rerender } = render(VTextarea, {
      props: { modelValue: 'abc', maxlength: 10, softLimit: true, counter: true },
    })
    const counter = container.querySelector('.v-textarea-meta .v-textarea-counter') as HTMLElement
    expect(counter.textContent?.trim()).toBe('3/10')
    // jamais de compteur dans le field (différence avec VInput)
    expect(container.querySelector('.v-textarea-field .v-textarea-counter')).toBeNull()
    await rerender({ modelValue: 'abcdefghijk' })
    expect(counter.hasAttribute('data-over')).toBe(true)
  })

  it('disabled and readonly: data-attributes on the root, native attributes on the control', () => {
    const { container, getByRole } = render(VTextarea, {
      props: { modelValue: '', readonly: true },
    })
    expect(container.querySelector('.v-textarea')?.hasAttribute('data-readonly')).toBe(true)
    expect(getByRole('textbox').hasAttribute('readonly')).toBe(true)

    const disabled = render(VTextarea, {
      props: { modelValue: '', disabled: true },
    })
    expect(disabled.container.querySelector('.v-textarea')?.hasAttribute('data-disabled')).toBe(
      true,
    )
  })

  it('compact: data-compact set on the root', () => {
    const { container } = render(VTextarea, {
      props: { modelValue: '', compact: true },
    })
    expect(container.querySelector('.v-textarea')?.hasAttribute('data-compact')).toBe(true)
  })
})
