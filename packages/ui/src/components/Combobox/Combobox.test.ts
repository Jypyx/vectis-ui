import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

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

  it('sélection simple par clic : l’input affiche le libellé choisi (parent v-model)', async () => {
    // Régression : avec defineModel + v-model parent, relire model.value juste
    // après l'avoir écrit renvoie l'ancienne valeur — le libellé affiché doit
    // venir de l'option choisie, pas d'une re-dérivation depuis le modèle.
    const Harness = defineComponent({
      components: { Combobox },
      setup: () => ({ options: OPTIONS, value: ref('') }),
      template: `<Combobox :options="options" v-model="value" aria-label="Pays" />
                 <output>{{ value }}</output>`,
    })
    const { getByRole, container } = render(Harness)
    const input = getByRole('combobox') as HTMLInputElement
    const optionByText = (text: string) =>
      [...container.querySelectorAll<HTMLElement>('[role="option"]')].find((o) =>
        o.textContent?.includes(text),
      )!

    // 1er choix : Belgique
    await fireEvent.update(input, 'bel')
    await nextTick()
    await fireEvent.click(optionByText('Belgique'))
    await nextTick()
    expect(container.querySelector('output')?.textContent).toBe('be')
    expect(input.value).toBe('Belgique')

    // 2e choix : rouvre, cherche France, clique → l'input ne doit PAS rester sur « Belgique »
    await fireEvent.click(input)
    await fireEvent.update(input, 'France')
    await nextTick()
    await fireEvent.click(optionByText('France'))
    await nextTick()
    expect(container.querySelector('output')?.textContent).toBe('fr')
    expect(input.value).toBe('France')
  })

  it('rouvrir en simple ne filtre pas sur la valeur choisie (liste complète, filtre à la frappe)', async () => {
    const { getByRole, container } = renderCombobox({ modelValue: 'fr' })
    const input = getByRole('combobox') as HTMLInputElement
    expect(input.value).toBe('France') // le libellé reste affiché
    const labels = () =>
      [...container.querySelectorAll('[role="option"] .ds-dropdown-item-label')].map((o) =>
        o.textContent?.trim(),
      )

    // la valeur sélectionnée n'est PAS un filtre : toute la liste est proposée
    expect(labels()).toEqual(['France', 'Belgique', 'Sénégal', 'Monaco'])

    // le filtre ne s'active qu'à la frappe
    await fireEvent.update(input, 'séné')
    expect(labels()).toEqual(['Sénégal'])
  })

  it('Entrée sélectionne l’unique résultat (même après un filtre sans résultat)', async () => {
    const { getByRole, emitted } = renderCombobox()
    const input = getByRole('combobox') as HTMLInputElement
    // filtre vide puis affiné vers un seul résultat, sans flèche
    await fireEvent.update(input, 'zzz')
    await fireEvent.update(input, 'bel')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['be'])
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
    expect(
      getAllByRole('button', { name: /Retirer/ }).map((b) => b.getAttribute('aria-label')),
    ).toEqual(['Retirer France', 'Retirer Belgique'])

    await fireEvent.click(getAllByRole('button', { name: 'Retirer France' })[0]!)
    expect(emitted('update:modelValue').at(-1)).toEqual([['be']])

    await rerender({ modelValue: ['be'] })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'Backspace' })
    expect(emitted('update:modelValue').at(-1)).toEqual([[]])
  })

  it('la croix (clearable d’Input) vide la valeur en simple', async () => {
    const { getByRole, emitted } = renderCombobox({ modelValue: 'fr' })
    const input = getByRole('combobox') as HTMLInputElement
    expect(input.value).toBe('France')
    await fireEvent.click(getByRole('button', { name: 'Effacer la sélection' }))
    expect(emitted('update:modelValue').at(-1)).toEqual([''])
    expect(input.value).toBe('')
  })

  it('en multiple, la croix apparaît à la frappe et vide la recherche sans retirer les Chips', async () => {
    const { getByRole, queryByRole, emitted } = renderCombobox({
      multiple: true,
      modelValue: ['fr', 'be'],
    })
    // sans recherche : pas de croix (la clearable d'Input suit le contenu du champ)
    expect(queryByRole('button', { name: 'Effacer la sélection' })).toBeNull()

    // on tape → la croix apparaît ; clic → recherche vidée, sélection intacte
    await fireEvent.update(getByRole('combobox'), 'xyz')
    await fireEvent.click(getByRole('button', { name: 'Effacer la sélection' }))
    expect((getByRole('combobox') as HTMLInputElement).value).toBe('')
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('pas de croix sans contenu, ni quand clearable=false', () => {
    const vide = renderCombobox()
    expect(vide.queryByRole('button', { name: 'Effacer la sélection' })).toBeNull()
    const off = renderCombobox({ modelValue: 'fr', clearable: false })
    expect(off.queryByRole('button', { name: 'Effacer la sélection' })).toBeNull()
  })

  it('affiche une coche à droite sur l’option sélectionnée', () => {
    const { container } = renderCombobox({ multiple: true, modelValue: ['fr'] })
    const optionByText = (text: string) =>
      [...container.querySelectorAll<HTMLElement>('[role="option"]')].find((o) =>
        o.textContent?.includes(text),
      )
    // France est sélectionnée → coche ; Belgique non → pas de coche
    expect(optionByText('France')?.querySelector('.ds-dropdown-item-check')).toBeTruthy()
    expect(optionByText('Belgique')?.querySelector('.ds-dropdown-item-check')).toBeFalsy()
  })
})
