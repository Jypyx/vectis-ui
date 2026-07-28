import { fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'

import Combobox from './Combobox.vue'
import type { ComboboxOption } from './Combobox.vue'

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
      [...container.querySelectorAll('[role="option"] .ds-listbox-option-label')].map((o) =>
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

  it('en multiple, la croix est visible dès qu’il y a des Chips et vide toute la sélection', async () => {
    const { getByRole, emitted } = renderCombobox({ multiple: true, modelValue: ['fr', 'be'] })
    // visible sans même taper (il y a une sélection)
    await fireEvent.click(getByRole('button', { name: 'Effacer la sélection' }))
    expect(emitted('update:modelValue').at(-1)).toEqual([[]])
  })

  it('pas de croix sans sélection ni recherche, ni quand clearable=false', () => {
    const vide = renderCombobox()
    expect(vide.queryByRole('button', { name: 'Effacer la sélection' })).toBeNull()
    const videMulti = renderCombobox({ multiple: true, modelValue: [] })
    expect(videMulti.queryByRole('button', { name: 'Effacer la sélection' })).toBeNull()
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
    expect(optionByText('France')?.querySelector('.ds-listbox-option-check')).toBeTruthy()
    expect(optionByText('Belgique')?.querySelector('.ds-listbox-option-check')).toBeFalsy()
  })
})

// ── Source asynchrone (recherche serveur, chargement, pagination) ────────────

describe('Combobox asynchrone', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  const labels = (container: Element) =>
    [...container.querySelectorAll('[role="option"] .ds-listbox-option-label')].map((o) =>
      o.textContent?.trim(),
    )

  it('filter=false : la frappe ne filtre plus (la source a déjà filtré)', async () => {
    const { getByRole, container } = renderCombobox({ filter: false, searchDebounce: 0 })
    await fireEvent.update(getByRole('combobox'), 'zzz')
    expect(labels(container)).toEqual(['France', 'Belgique', 'Sénégal', 'Monaco'])
  })

  it('filter=false : Entrée sélectionne l’option active de la liste non filtrée', async () => {
    const { getByRole, emitted } = renderCombobox({ filter: false, searchDebounce: 0 })
    const input = getByRole('combobox')
    await fireEvent.update(input, 'zzz')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted('update:modelValue').at(-1)).toEqual(['fr'])
  })

  it('filter fonction : reçoit la requête brute trimée, son résultat s’applique', async () => {
    const seen: string[] = []
    const { getByRole, container, emitted } = renderCombobox({
      searchDebounce: 0,
      filter: (option: ComboboxOption, query: string) => {
        seen.push(query)
        return option.value.startsWith(query)
      },
    })
    await fireEvent.update(getByRole('combobox'), '  fr  ')
    // brute et trimée : ni normalisée NFD, ni minusculée par le composant
    expect(seen).toContain('fr')
    expect(labels(container)).toEqual(['France'])
    expect(emitted('search').at(-1)).toEqual(['fr'])
  })

  it('search : émis à la frappe, avec le terme trimé', async () => {
    const { getByRole, emitted } = renderCombobox({ searchDebounce: 0 })
    await fireEvent.update(getByRole('combobox'), 'sene ')
    expect(emitted('search')).toEqual([['sene']])
  })

  it('search : émis immédiatement à l’ouverture (premier chargement)', async () => {
    const { getByRole, emitted } = renderCombobox()
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    // pas de debounce à l'ouverture, malgré searchDebounce par défaut (250 ms)
    expect(emitted('search')).toEqual([['']])
  })

  it('search : débouncé (une seule requête pour une rafale de frappes)', async () => {
    vi.useFakeTimers()
    const { getByRole, emitted } = renderCombobox({ searchDebounce: 250 })
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' }) // ouvre : search('')
    await fireEvent.update(input, 's')
    await fireEvent.update(input, 'se')
    await fireEvent.update(input, 'sen')
    expect(emitted('search')).toEqual([['']])

    vi.advanceTimersByTime(250)
    expect(emitted('search')).toEqual([[''], ['sen']])
  })

  it('search : aucune requête parasite après une sélection simple', async () => {
    vi.useFakeTimers()
    const { getByRole, emitted } = renderCombobox({ searchDebounce: 250 })
    const input = getByRole('combobox')
    await fireEvent.update(input, 'bel') // ouvre + émet 'bel' (immédiat)
    await fireEvent.keyDown(input, { key: 'Enter' })
    // le timer armé par la frappe ne doit pas partir après la fermeture
    vi.advanceTimersByTime(1000)
    expect(emitted('search')).toEqual([['bel']])
  })

  it('search : aucune requête parasite après Échap', async () => {
    vi.useFakeTimers()
    const { getByRole, emitted } = renderCombobox({ searchDebounce: 250 })
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.update(input, 'bel')
    await fireEvent.keyDown(input, { key: 'Escape' })
    vi.advanceTimersByTime(1000)
    expect(emitted('search')).toEqual([['']])
  })

  it('search : en multiple, la sélection réinitialise la liste (panneau ouvert)', async () => {
    const { getByRole, emitted } = renderCombobox({ multiple: true, searchDebounce: 0 })
    const input = getByRole('combobox')
    await fireEvent.update(input, 'bel')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted('search')).toEqual([['bel'], ['']])
  })

  it('search : un même terme n’est pas réémis (rouvrir ne relance pas)', async () => {
    const { getByRole, emitted } = renderCombobox({ searchDebounce: 0 })
    const input = getByRole('combobox')
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.keyDown(input, { key: 'Escape' })
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(emitted('search')).toEqual([['']])
  })

  it('search : rien quand le composant est disabled', async () => {
    const { getByRole, emitted } = renderCombobox({ disabled: true, searchDebounce: 0 })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    expect(emitted('search')).toBeUndefined()
  })

  it('le libellé d’une valeur choisie survit au renouvellement des options (simple)', async () => {
    const { getByRole, rerender } = renderCombobox({ modelValue: 'fr' })
    const input = getByRole('combobox') as HTMLInputElement
    expect(input.value).toBe('France')
    // page suivante de résultats : « fr » n'y est plus
    await rerender({ options: [{ value: 'be', label: 'Belgique' }] })
    expect(input.value).toBe('France')
  })

  it('le libellé d’une valeur choisie survit au renouvellement des options (multiple)', async () => {
    const { getAllByRole, container, rerender } = renderCombobox({
      multiple: true,
      modelValue: ['fr'],
    })
    await rerender({ options: [{ value: 'be', label: 'Belgique' }] })
    expect(
      getAllByRole('button', { name: /Retirer/ }).map((b) => b.getAttribute('aria-label')),
    ).toEqual(['Retirer France'])
    expect(container.querySelector('.ds-chip')?.textContent).toContain('France')
  })

  it('le champ affiche le libellé dès que les options arrivent (montage sans options)', async () => {
    const { getByRole, rerender } = renderCombobox({ options: [], modelValue: 'fr' })
    const input = getByRole('combobox') as HTMLInputElement
    // sans options, la valeur brute est le seul repli possible
    expect(input.value).toBe('fr')
    await rerender({ options: OPTIONS })
    expect(input.value).toBe('France')
  })

  it('loading sans option : état de chargement, jamais « aucun résultat »', () => {
    const { container } = renderCombobox({ options: [], loading: true })
    const state = container.querySelector('.ds-combobox-state')
    expect(state?.textContent).toContain('Chargement…')
    expect(state?.textContent).not.toContain('Aucun résultat')
  })

  it('loading avec options : les options restent affichées', () => {
    const { container } = renderCombobox({ loading: true })
    expect(container.querySelectorAll('[role="option"]').length).toBe(4)
    expect(container.querySelector('.ds-combobox-state')).toBeNull()
  })

  it('loading : le champ échange son chevron contre un spinner décoratif', () => {
    const { container } = renderCombobox({ loading: true })
    expect(container.querySelector('.ds-combobox-chevron')).toBeNull()
    const spinner = container.querySelector('.ds-input-field > .ds-spinner')
    // décoratif : son role="status" ne doit pas doubler l'annonce du panneau
    expect(spinner?.getAttribute('aria-hidden')).toBe('true')
  })

  it('tailles : les Chips restent un cran sous le champ, le panneau suit sa taille', async () => {
    // Mapping unique (script) que le CSS `--_chip-height` doit refléter :
    // xs jusqu'à md, sm en lg ; le cran du dessous passe par `compact`.
    const { container, rerender } = renderCombobox({ multiple: true, modelValue: ['fr'] })
    const chip = () => container.querySelector('.ds-chip') as HTMLElement
    const panel = () => container.querySelector('[role="listbox"]') as HTMLElement

    // défaut (md) : Chip xs plein
    expect(chip().getAttribute('data-size')).toBe('xs')
    expect(chip().hasAttribute('data-compact')).toBe(false)

    await rerender({ size: 'sm' })
    expect(chip().getAttribute('data-size')).toBe('xs')
    expect(chip().hasAttribute('data-compact')).toBe(true)

    await rerender({ size: 'lg', compact: false })
    expect(chip().getAttribute('data-size')).toBe('sm')
    expect(chip().hasAttribute('data-compact')).toBe(false)
    // le panneau suit la taille du champ (aucun clamp)
    expect(panel().getAttribute('data-size')).toBe('lg')

    await rerender({ size: 'lg', compact: true })
    expect(chip().getAttribute('data-size')).toBe('sm')
    expect(chip().hasAttribute('data-compact')).toBe(true)
    // data-compact sur la racine : c'est lui qui arme la règle CSS lg+compact
    expect(container.querySelector('.ds-combobox')?.hasAttribute('data-compact')).toBe(true)
  })

  it('hasMore : une sentinelle ferme la liste (support du scroll infini)', () => {
    const { container } = renderCombobox({ hasMore: true })
    const listbox = container.querySelector('[role="listbox"]') as HTMLElement
    expect(listbox.lastElementChild?.className).toContain('ds-combobox-more')
    expect(renderCombobox().container.querySelector('.ds-combobox-more')).toBeNull()
  })

  it('slot #option : contenu personnalisé, avec l’état de l’option', async () => {
    const { getByRole, container } = render(Combobox, {
      props: { options: OPTIONS, modelValue: '' },
      attrs: { 'aria-label': 'Pays' },
      slots: {
        option: (slotProps: { option: ComboboxOption; active: boolean; index: number }) =>
          h(
            'span',
            { class: 'ds-test-option' },
            `${slotProps.index}:${slotProps.option.label}${slotProps.active ? '*' : ''}`,
          ),
      },
    })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    expect([...container.querySelectorAll('.ds-test-option')].map((o) => o.textContent)).toEqual([
      '0:France*',
      '1:Belgique',
      '2:Sénégal',
      '3:Monaco',
    ])
  })

  it('slots #empty et #loading : remplacent les contenus par défaut', async () => {
    const { getByRole, container } = render(Combobox, {
      props: { options: OPTIONS, modelValue: '', searchDebounce: 0 },
      attrs: { 'aria-label': 'Pays' },
      slots: {
        empty: (slotProps: { query: string }) =>
          h('span', { class: 'ds-test-empty' }, `créer « ${slotProps.query} »`),
      },
    })
    await fireEvent.update(getByRole('combobox'), 'zzz')
    expect(container.querySelector('.ds-test-empty')?.textContent).toBe('créer « zzz »')

    const chargement = render(Combobox, {
      props: { options: [], modelValue: '', loading: true },
      attrs: { 'aria-label': 'Pays' },
      slots: { loading: () => h('span', { class: 'ds-test-loading' }, 'patientez') },
    })
    expect(chargement.container.querySelector('.ds-test-loading')?.textContent).toBe('patientez')
  })
})
