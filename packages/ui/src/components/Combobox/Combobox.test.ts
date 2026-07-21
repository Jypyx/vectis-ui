import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import Combobox from './Combobox.vue'

const OPTIONS = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgique' },
  { value: 'sn', label: 'Sénégal' },
  { value: 'mc', label: 'Monaco', disabled: true },
]

function renderCombobox(props: Record<string, unknown> = {}) {
  return render(Combobox, {
    props: { options: OPTIONS, modelValue: '', ...props },
    attrs: { 'aria-label': 'Pays' },
  })
}

describe('Combobox', () => {
  it('contrat ARIA : combobox lié au listbox, activedescendant en navigation', async () => {
    const { getByRole, container } = renderCombobox()
    const input = getByRole('combobox')
    const listbox = container.querySelector('[role="listbox"]') as HTMLElement
    expect(input.getAttribute('aria-controls')).toBe(listbox.id)
    expect(input.getAttribute('aria-expanded')).toBe('false')

    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(input.getAttribute('aria-activedescendant')).toBe(
      container.querySelector('[role="option"][data-active]')?.id,
    )
  })

  it('filtre sans tenir compte des accents', async () => {
    const { getByRole, container } = renderCombobox()
    const input = getByRole('combobox') as HTMLInputElement
    await fireEvent.update(input, 'sene')
    const options = [...container.querySelectorAll('[role="option"]')]
    expect(options.map((o) => o.textContent?.trim())).toEqual(['Sénégal'])
  })

  it('sélection simple : Enter choisit l’option active et ferme', async () => {
    const { getByRole, emitted } = renderCombobox()
    const input = getByRole('combobox') as HTMLInputElement
    await fireEvent.update(input, 'bel')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted('update:modelValue')).toEqual([['be']])
    expect(input.getAttribute('aria-expanded')).toBe('false')
    // hors édition, l'input affiche le libellé
    expect(input.value).toBe('Belgique')
  })

  it('la navigation saute les options désactivées', async () => {
    const { getByRole, container } = renderCombobox()
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    // remonte d'un cran depuis la première : boucle en sautant Monaco (disabled)
    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(container.querySelector('[data-active]')?.textContent).toContain('Sénégal')
  })

  it('multiple : toggle des valeurs, tags avec retrait, Backspace retire le dernier', async () => {
    const { getByRole, getAllByRole, emitted, rerender } = renderCombobox({
      multiple: true,
      modelValue: ['fr', 'be'],
    })
    expect(getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
      'Retirer France',
      'Retirer Belgique',
    ])

    await fireEvent.click(getAllByRole('button', { name: 'Retirer France' })[0]!)
    expect(emitted('update:modelValue').at(-1)).toEqual([['be']])

    await rerender({ modelValue: ['be'] })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'Backspace' })
    expect(emitted('update:modelValue').at(-1)).toEqual([[]])
  })
})
