import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VTextarea from './VTextarea.vue'

describe('VTextarea', () => {
  it('synchronise v-model (update:modelValue)', async () => {
    const { getByRole, emitted } = render(VTextarea, {
      props: { modelValue: '' },
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await fireEvent.update(textarea, 'ligne 1\nligne 2')
    expect(emitted('update:modelValue')).toEqual([['ligne 1\nligne 2']])
  })

  it('invalid pose aria-invalid, autoGrow pose data-auto-grow sur le field', () => {
    const { getByRole, container } = render(VTextarea, {
      props: { modelValue: '', invalid: true, autoGrow: true },
    })
    expect(getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
    const field = container.querySelector('.v-textarea-field') as HTMLElement
    expect(field.hasAttribute('data-auto-grow')).toBe(true)
  })

  it('laisse passer les attributs natifs sur le contrôle (required, name, rows)', () => {
    const { getByRole } = render(VTextarea, {
      props: { modelValue: '' },
      attrs: { required: true, name: 'bio', rows: 5 },
    })
    const textarea = getByRole('textbox')
    expect(textarea.hasAttribute('required')).toBe(true)
    expect(textarea.getAttribute('name')).toBe('bio')
    expect(textarea.getAttribute('rows')).toBe('5')
  })

  it('class et style atterrissent sur la racine, pas sur le contrôle', () => {
    const { container, getByRole } = render(VTextarea, {
      props: { modelValue: '' },
      attrs: { class: 'consommateur', style: 'width: 320px' },
    })
    const root = container.querySelector('.v-textarea') as HTMLElement
    expect(root.classList.contains('consommateur')).toBe(true)
    expect(root.style.width).toBe('320px')
    expect(getByRole('textbox').classList.contains('consommateur')).toBe(false)
  })

  it('label est associé au contrôle via for/id, hint lié via aria-describedby', () => {
    const { getByLabelText, getByText } = render(VTextarea, {
      props: { modelValue: '', label: 'Bio', hint: '500 caractères max' },
    })
    const textarea = getByLabelText('Bio')
    expect(textarea.classList.contains('v-textarea-control')).toBe(true)
    const hint = getByText('500 caractères max')
    expect(textarea.getAttribute('aria-describedby')).toContain(hint.id)
  })

  it("icône cliquable : bouton accessible et émission de l'événement", async () => {
    const onClick = vi.fn()
    const { getByRole, emitted } = render(VTextarea, {
      props: { modelValue: '', iconEnd: 'edit', iconEndLabel: 'Modifier' },
      attrs: { 'onClick:iconEnd': onClick },
    })
    await fireEvent.click(getByRole('button', { name: 'Modifier' }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(emitted('click:icon-end')).toHaveLength(1)
  })

  it('clear : vide le champ, émet clear et refocus le contrôle ; masqué en readonly', async () => {
    const { getByRole, emitted } = render(VTextarea, {
      props: { modelValue: 'texte', clearable: true },
    })
    await fireEvent.click(getByRole('button', { name: 'Effacer' }))
    expect(emitted('update:modelValue')).toEqual([['']])
    expect(emitted('clear')).toHaveLength(1)
    expect(document.activeElement).toBe(getByRole('textbox'))

    const readonly = render(VTextarea, {
      props: { modelValue: 'texte', clearable: true, readonly: true },
    })
    expect(readonly.queryByRole('button', { name: 'Effacer' })).toBeNull()
  })

  it("loading : spinner présent, l'icône end absente", () => {
    const { getByRole, container } = render(VTextarea, {
      props: { modelValue: '', loading: true, iconEnd: 'edit' },
    })
    expect(getByRole('status')).toBeTruthy()
    expect(container.querySelectorAll('.v-icon')).toHaveLength(0)
  })

  it('softLimit : pas de maxlength natif, customError au-delà de la limite', async () => {
    const { getByRole, rerender } = render(VTextarea, {
      props: { modelValue: 'ok', maxlength: 5, softLimit: true },
    })
    const textarea = getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.hasAttribute('maxlength')).toBe(false)
    expect(textarea.validity.customError).toBe(false)
    await rerender({ modelValue: 'trop long' })
    expect(textarea.validity.customError).toBe(true)
  })

  it('compteur : sous le champ dans la ligne meta, data-over au-delà', async () => {
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

  it('disabled et readonly : data-attributes sur la racine, attributs natifs sur le contrôle', () => {
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

  it('compact : data-compact posé sur la racine', () => {
    const { container } = render(VTextarea, {
      props: { modelValue: '', compact: true },
    })
    expect(container.querySelector('.v-textarea')?.hasAttribute('data-compact')).toBe(true)
  })
})
