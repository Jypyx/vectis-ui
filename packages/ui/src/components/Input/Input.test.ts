import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import Input from './Input.vue'

describe('Input', () => {
  it('synchronise v-model (update:modelValue)', async () => {
    const { getByRole, emitted } = render(Input, {
      props: { modelValue: '' },
    })
    const input = getByRole('textbox') as HTMLInputElement
    await fireEvent.update(input, 'bonjour')
    expect(emitted('update:modelValue')).toEqual([['bonjour']])
  })

  it('affiche la valeur du modèle', () => {
    const { getByRole } = render(Input, {
      props: { modelValue: 'initial' },
    })
    expect((getByRole('textbox') as HTMLInputElement).value).toBe('initial')
  })

  it('invalid pose aria-invalid, sinon rien', async () => {
    const { getByRole, rerender } = render(Input, {
      props: { modelValue: '', invalid: true },
    })
    expect(getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
    await rerender({ invalid: false })
    expect(getByRole('textbox').hasAttribute('aria-invalid')).toBe(false)
  })

  it('laisse passer les attributs natifs sur le contrôle (type, required, name)', () => {
    const { getByRole } = render(Input, {
      props: { modelValue: '' },
      attrs: { type: 'email', required: true, name: 'email', placeholder: 'votre@email.fr' },
    })
    const input = getByRole('textbox')
    expect(input.getAttribute('type')).toBe('email')
    expect(input.hasAttribute('required')).toBe(true)
    expect(input.getAttribute('name')).toBe('email')
    expect(input.getAttribute('placeholder')).toBe('votre@email.fr')
  })

  it('class et style atterrissent sur la racine, pas sur le contrôle', () => {
    const { container, getByRole } = render(Input, {
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

  it('label est associé au contrôle via for/id', () => {
    const { getByLabelText } = render(Input, {
      props: { modelValue: '', label: 'Email' },
    })
    const input = getByLabelText('Email')
    expect(input.classList.contains('v-input-control')).toBe(true)
  })

  it('hint est rendu et lié via aria-describedby (fusion avec celui du consommateur)', () => {
    const { getByRole, getByText } = render(Input, {
      props: { modelValue: '', hint: 'Format attendu : a@b.fr' },
      attrs: { 'aria-describedby': 'externe' },
    })
    const hint = getByText('Format attendu : a@b.fr')
    const describedBy = getByRole('textbox').getAttribute('aria-describedby')
    expect(describedBy).toContain('externe')
    expect(describedBy).toContain(hint.id)
  })

  it('icônes décoratives : aucun bouton rendu', () => {
    const { queryByRole } = render(Input, {
      props: { modelValue: '', iconStart: 'search', iconEnd: 'visibility' },
    })
    expect(queryByRole('button')).toBeNull()
  })

  it("icône cliquable : bouton accessible, émission de l'événement, pas de fuite sur l'input", async () => {
    const onClick = vi.fn()
    const { getByRole, emitted } = render(Input, {
      props: { modelValue: '', iconEnd: 'visibility', iconEndLabel: 'Afficher le mot de passe' },
      attrs: { 'onClick:iconEnd': onClick },
    })
    const button = getByRole('button', { name: 'Afficher le mot de passe' })
    await fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
    expect(emitted('click:icon-end')).toHaveLength(1)
    expect(getByRole('textbox').hasAttribute('onclick:iconend')).toBe(false)
  })

  it('clear : visible seulement si non-vide, vide le champ et refocus le contrôle', async () => {
    const { getByRole, queryByRole, rerender, emitted } = render(Input, {
      props: { modelValue: '', clearable: true },
    })
    expect(queryByRole('button', { name: 'Effacer' })).toBeNull()
    await rerender({ modelValue: 'texte' })
    const clear = getByRole('button', { name: 'Effacer' })
    await fireEvent.click(clear)
    expect(emitted('update:modelValue')).toEqual([['']])
    expect(emitted('clear')).toHaveLength(1)
    expect(document.activeElement).toBe(getByRole('textbox'))
  })

  it('clear : masqué en disabled et en readonly', () => {
    const { queryByRole, container } = render(Input, {
      props: { modelValue: 'texte', clearable: true, disabled: true },
    })
    expect(queryByRole('button', { name: 'Effacer' })).toBeNull()
    expect(container.querySelector('.v-input')?.hasAttribute('data-disabled')).toBe(true)

    const readonly = render(Input, {
      props: { modelValue: 'texte', clearable: true, readonly: true },
    })
    expect(readonly.queryByRole('button', { name: 'Effacer' })).toBeNull()
    expect(readonly.container.querySelector('.v-input')?.hasAttribute('data-readonly')).toBe(true)
  })

  it("loading : spinner présent, l'icône end absente", () => {
    const { getByRole, container } = render(Input, {
      props: { modelValue: '', loading: true, iconEnd: 'visibility' },
    })
    expect(getByRole('status')).toBeTruthy()
    expect(container.querySelectorAll('.v-icon')).toHaveLength(0)
  })

  it('maxlength bloquant : attribut natif posé', () => {
    const { getByRole } = render(Input, {
      props: { modelValue: '', maxlength: 10 },
    })
    expect(getByRole('textbox').getAttribute('maxlength')).toBe('10')
  })

  it('softLimit : pas de maxlength natif, customError au-delà de la limite', async () => {
    const { getByRole, rerender } = render(Input, {
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

  it('compteur : « n/max », data-over au-delà', async () => {
    const { container, rerender } = render(Input, {
      props: { modelValue: 'abc', maxlength: 10, softLimit: true, counter: true },
    })
    const counter = container.querySelector('.v-input-counter') as HTMLElement
    expect(counter.textContent?.trim()).toBe('3/10')
    expect(counter.hasAttribute('data-over')).toBe(false)
    await rerender({ modelValue: 'abcdefghijk' })
    expect(counter.textContent?.trim()).toBe('11/10')
    expect(counter.hasAttribute('data-over')).toBe(true)
  })

  it('modèle numérique : valeur rendue, compteur et croix mesurés sur le texte', () => {
    // Sur `type="number"`, Vue caste la valeur de v-model en nombre : le
    // modèle doit accepter un nombre sans casser les mesures de longueur.
    const { container, getByRole } = render(Input, {
      props: { modelValue: 150, type: 'number', maxlength: 2, counter: true, clearable: true },
    })
    expect((getByRole('spinbutton') as HTMLInputElement).value).toBe('150')
    const counter = container.querySelector('.v-input-counter') as HTMLElement
    expect(counter.textContent?.trim()).toBe('3/2')
    expect(counter.hasAttribute('data-over')).toBe(true)
    expect(container.querySelector('.v-input-clear')).toBeTruthy()
  })

  it('disabled : boutons internes désactivés', () => {
    const onClick = vi.fn()
    const { getByRole } = render(Input, {
      props: { modelValue: '', iconStart: 'search', iconStartLabel: 'Rechercher', disabled: true },
      attrs: { 'onClick:iconStart': onClick },
    })
    const button = getByRole('button', { name: 'Rechercher' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('readonly : attribut natif posé sur le contrôle', () => {
    const { getByRole } = render(Input, {
      props: { modelValue: '', readonly: true },
    })
    expect(getByRole('textbox').hasAttribute('readonly')).toBe(true)
  })

  it("type : 'text' par défaut, la prop est posée sur le contrôle", () => {
    const { getByRole, rerender } = render(Input, {
      props: { modelValue: '' },
    })
    expect(getByRole('textbox').getAttribute('type')).toBe('text')
    return rerender({ type: 'email' }).then(() => {
      expect(getByRole('textbox').getAttribute('type')).toBe('email')
    })
  })

  it('compact : data-compact posé sur la racine', () => {
    const { container } = render(Input, {
      props: { modelValue: '', compact: true },
    })
    expect(container.querySelector('.v-input')?.hasAttribute('data-compact')).toBe(true)
  })
})
