import { fireEvent, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import DatePicker from './DatePicker.vue'

const JUNE = '2026-06-10'

/**
 * Frappe simulée : jsdom ne pose pas de caret, on le place explicitement en fin
 * de texte comme le ferait une saisie séquentielle.
 */
async function type(input: HTMLInputElement, value: string) {
  input.value = value
  input.setSelectionRange(value.length, value.length)
  await fireEvent.input(input)
}

describe('DatePicker', () => {
  it('affiche la valeur formatée dans un champ en lecture seule', () => {
    const { container } = render(DatePicker, {
      props: { modelValue: JUNE, locale: 'fr-FR', label: 'Date' },
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(true)
    expect(input.value).toContain('10')
    expect(input.value.toLowerCase()).toContain('juin')
    expect(input.getAttribute('aria-haspopup')).toBe('dialog')
    expect(input.getAttribute('aria-expanded')).toBe('false')
  })

  it('ouvre le panneau au clic et rend la grille', async () => {
    const { container, getByRole } = render(DatePicker, {
      props: { modelValue: JUNE, label: 'Date' },
    })
    const control = container.querySelector('.ds-datepicker-control') as HTMLElement
    await fireEvent.click(control)
    await nextTick()
    expect(getByRole('dialog')).toBeTruthy()
    expect(getByRole('grid')).toBeTruthy()
    expect(container.querySelector('input')?.getAttribute('aria-expanded')).toBe('true')
  })

  it('sélectionne une date, met à jour le modèle et ferme (single)', async () => {
    const { container, emitted, getByRole } = render(DatePicker, {
      props: { modelValue: JUNE },
    })
    await fireEvent.click(container.querySelector('.ds-datepicker-control') as HTMLElement)
    await nextTick()
    const day15 = [...getByRole('grid').querySelectorAll('.ds-calendar-day')].find(
      (b) => b.textContent?.trim() === '15' && !b.hasAttribute('data-outside'),
    ) as HTMLElement
    await fireEvent.click(day15)
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['2026-06-15'])
    // fermé : le panneau n'est plus marqué ouvert
    expect(container.querySelector('.ds-datepicker-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('l’Entrée qui sélectionne dans la grille ne rouvre pas le panneau', async () => {
    // L'Entrée du Calendar fait preventDefault puis ferme (mode simple) ; elle
    // remonte ensuite à la racine, où ArrowDown/Entrée ouvrent. Sans la garde
    // `defaultPrevented` du composable, le panneau se rouvrait aussitôt.
    const { container, getByRole } = render(DatePicker, { props: { modelValue: JUNE } })
    await fireEvent.click(container.querySelector('.ds-datepicker-control') as HTMLElement)
    await nextTick()
    const grid = getByRole('grid')
    await fireEvent.keyDown(grid, { key: 'Enter', bubbles: true })
    await nextTick()
    expect(container.querySelector('.ds-datepicker-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('efface la valeur via la croix', async () => {
    const { container, emitted } = render(DatePicker, {
      props: { modelValue: JUNE, clearable: true },
    })
    // avec une valeur, l'icône de fin devient une croix « Effacer la date »
    const clearBtn = container.querySelector('button[aria-label="Effacer la date"]') as HTMLElement
    expect(clearBtn).toBeTruthy()
    await fireEvent.click(clearBtn)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('ferme quand le focus sort du composant', async () => {
    const { container } = render(DatePicker, { props: { modelValue: JUNE } })
    const root = container.querySelector('.ds-datepicker') as HTMLElement
    await fireEvent.click(container.querySelector('.ds-datepicker-control') as HTMLElement)
    await nextTick()
    expect(container.querySelector('.ds-datepicker-panel')?.hasAttribute('data-popover-open')).toBe(
      true,
    )
    root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null, bubbles: true }))
    await nextTick()
    expect(container.querySelector('.ds-datepicker-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('affiche une plage formatée (mode range)', () => {
    const { container } = render(DatePicker, {
      props: {
        mode: 'range',
        modelValue: { start: '2026-06-19', end: '2026-06-26' },
        locale: 'fr-FR',
      },
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toContain('19')
    expect(input.value).toContain('26')
  })
})

describe('DatePicker — mode saisie', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mount = (props: Record<string, unknown> = {}) =>
    render(DatePicker, {
      props: { entry: 'input', locale: 'fr-FR', label: 'Date', ...props },
    })

  it('rend un champ éditable au masque numérique de la locale', () => {
    const { container } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(false)
    expect(input.value).toBe('10/06/2026')
    expect(input.getAttribute('inputmode')).toBe('numeric')
    expect(input.getAttribute('autocomplete')).toBe('off')
    expect(input.getAttribute('placeholder')).toBe('jj/mm/aaaa')
  })

  it('pose les séparateurs au fil de la frappe et ne commite qu’une date complète', async () => {
    const { container, emitted } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '1')
    expect(input.value).toBe('1')
    await type(input, '10')
    expect(input.value).toBe('10/')
    await type(input, '10/06')
    expect(input.value).toBe('10/06/')
    expect(emitted('update:modelValue')).toBeUndefined()
    await type(input, '10/06/2026')
    expect(input.value).toBe('10/06/2026')
    expect(emitted('update:modelValue')?.at(-1)).toEqual([JUNE])
  })

  it('ignore les caractères refusés sans que le texte brut ne reparaisse', async () => {
    // Le masque ne change pas → Vue ne repatche rien. Sans le `v-model` sur
    // l'Input (dont l'état interne recopierait le texte brut) le 9e chiffre et
    // la lettre réapparaîtraient dans le DOM au patch suivant.
    const { container } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '10/06/20261')
    await nextTick()
    expect(input.value).toBe('10/06/2026')
    await type(input, '10/06/2026a')
    await nextTick()
    expect(input.value).toBe('10/06/2026')
  })

  it('revert silencieusement une date impossible à la sortie du champ', async () => {
    const { container, emitted } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '31/02/2026')
    await fireEvent.change(input)
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(input.value).toBe('10/06/2026')
  })

  it('revert une saisie incomplète, hors bornes ou désactivée', async () => {
    const { container, emitted } = mount({
      modelValue: JUNE,
      min: '2026-06-01',
      max: '2026-06-30',
      disabledDates: ['2026-06-15'],
    })
    const input = container.querySelector('input') as HTMLInputElement

    await type(input, '10/06/20') // incomplet
    await fireEvent.change(input)
    expect(input.value).toBe('10/06/2026')

    await type(input, '10/07/2026') // hors max
    await fireEvent.change(input)
    expect(input.value).toBe('10/06/2026')

    await type(input, '15/06/2026') // date désactivée
    await fireEvent.change(input)
    expect(input.value).toBe('10/06/2026')

    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('vide la valeur quand le champ est vidé', async () => {
    const { container, emitted } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '')
    await fireEvent.change(input)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('étend une année à 2 chiffres à la sortie du champ, jamais à la frappe', async () => {
    const { container, emitted } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '10/06/26')
    expect(emitted('update:modelValue')).toBeUndefined()
    await fireEvent.change(input)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([JUNE])
    expect(input.value).toBe('10/06/2026')
  })

  it('le Retour arrière sur un séparateur efface le chiffre qui le précède', async () => {
    const { container } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '10')
    expect(input.value).toBe('10/')
    // caret après le séparateur posé par le masque
    input.setSelectionRange(3, 3)
    await fireEvent.keyDown(input, { key: 'Backspace' })
    expect(input.value).toBe('1')
  })

  it('un séparateur tapé complète le champ courant par un zéro de tête', async () => {
    const { container } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '5')
    await fireEvent.keyDown(input, { key: '/' })
    expect(input.value).toBe('05/')
  })

  it('la flèche bas déplace le focus dans la grille sans l’avoir volé à l’ouverture', async () => {
    const { container, getByRole } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    await fireEvent.focus(input)
    await nextTick()
    // le panneau s'ouvre mais le curseur reste dans le champ
    expect(container.querySelector('.ds-datepicker-panel')?.hasAttribute('data-popover-open')).toBe(
      true,
    )
    await fireEvent.keyDown(input, { key: 'ArrowDown', bubbles: true })
    await nextTick()
    expect(getByRole('grid').contains(document.activeElement)).toBe(true)
  })

  it('Échap ferme sans que le focus rendu au champ ne rouvre le panneau', async () => {
    const { container } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    await fireEvent.focus(input)
    await nextTick()
    await fireEvent.keyDown(input, { key: 'Escape', bubbles: true })
    await nextTick()
    expect(container.querySelector('.ds-datepicker-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('sélectionner un jour ferme définitivement le panneau', async () => {
    const { container, emitted, getByRole } = mount({ modelValue: JUNE })
    const input = container.querySelector('input') as HTMLInputElement
    await fireEvent.focus(input)
    await nextTick()
    const day15 = [...getByRole('grid').querySelectorAll('.ds-calendar-day')].find(
      (b) => b.textContent?.trim() === '15' && !b.hasAttribute('data-outside'),
    ) as HTMLElement
    await fireEvent.click(day15)
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['2026-06-15'])
    expect(container.querySelector('.ds-datepicker-panel')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('retombe en lecture seule (et avertit) en mode range ou multiple', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = mount({ mode: 'range', modelValue: { start: null, end: null } })
    expect((container.querySelector('input') as HTMLInputElement).readOnly).toBe(true)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[DatePicker]'))
  })

  it('ignore displayFormat en saisie (et l’annonce)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = mount({
      modelValue: JUNE,
      displayFormat: { day: 'numeric', month: 'long', year: 'numeric' },
    })
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('10/06/2026')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('displayFormat'))
  })
})
