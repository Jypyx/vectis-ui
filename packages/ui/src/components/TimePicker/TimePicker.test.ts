import { fireEvent, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import TimePicker from './TimePicker.vue'

/** Ouvre le panneau par clic sur le contrôle. */
async function openPanel(container: Element) {
  await fireEvent.click(container.querySelector('.ds-timepicker-control') as HTMLElement)
  await nextTick()
}

const panelOpen = (container: Element) =>
  container.querySelector('.ds-timepicker-panel')?.hasAttribute('data-popover-open') === true

const hourCell = (container: Element) =>
  container.querySelector('button[aria-label="Sélectionner l’heure"]') as HTMLButtonElement

describe('TimePicker — défaut', () => {
  it('est un champ de saisie masqué, sans cadran ni ARIA de popup', async () => {
    const { container } = render(TimePicker, { props: { modelValue: '09:30', format: '24h' } })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(false)
    expect(input.value).toBe('09:30')
    expect(input.getAttribute('inputmode')).toBe('numeric')
    expect(container.querySelector('button[aria-label="Ouvrir le sélecteur d’heure"]')).toBeNull()
    expect(input.getAttribute('aria-haspopup')).toBeNull()
    expect(input.getAttribute('aria-controls')).toBeNull()

    await fireEvent.focus(input)
    await fireEvent.keyDown(input, { key: 'ArrowDown', bubbles: true })
    await nextTick()
    expect(container.querySelector('.ds-timepicker-panel')).toBeNull()
  })

  it('n’avertit pas dans sa configuration par défaut', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(TimePicker, { props: { modelValue: '09:15' } })
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('TimePicker — lecture seule', () => {
  it('affiche la valeur formatée dans un champ en lecture seule', () => {
    const { container } = render(TimePicker, {
      props: { mode: 'readonly', modelValue: '19:05', locale: 'fr-FR', label: 'Heure' },
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(true)
    expect(input.value).toBe('19:05')
    expect(input.getAttribute('aria-haspopup')).toBe('dialog')
    expect(input.getAttribute('aria-expanded')).toBe('false')
  })

  it('ouvre le panneau au clic et rend le cadran (slider)', async () => {
    const { container, getByRole } = render(TimePicker, {
      props: { mode: 'readonly', modelValue: '09:15', label: 'Heure' },
    })
    await openPanel(container)
    expect(getByRole('dialog')).toBeTruthy()
    const slider = getByRole('slider')
    expect(slider.getAttribute('aria-label')).toBe('Heure')
    expect(slider.getAttribute('aria-valuenow')).toBe('9')
    expect(container.querySelector('input')?.getAttribute('aria-expanded')).toBe('true')
  })

  it('travaille sur un brouillon : rien n’est émis avant OK', async () => {
    const { container, emitted, getByRole, getByText } = render(TimePicker, {
      props: { mode: 'readonly', modelValue: '09:15', format: '24h' },
    })
    await openPanel(container)
    // flèche haut sur le cadran : le brouillon avance, le v-model non
    await fireEvent.keyDown(getByRole('slider'), { key: 'ArrowUp' })
    await nextTick()
    expect(hourCell(container).textContent?.trim()).toBe('10')
    expect(emitted('update:modelValue')).toBeUndefined()
    await fireEvent.click(getByText('OK'))
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['10:15'])
    expect(panelOpen(container)).toBe(false)
  })

  it('annule sans émettre (bouton, Échap, sortie de focus)', async () => {
    const { container, emitted, getByRole, getByText } = render(TimePicker, {
      props: { mode: 'readonly', modelValue: '09:15', format: '24h' },
    })
    await openPanel(container)
    await fireEvent.keyDown(getByRole('slider'), { key: 'ArrowUp' })
    await fireEvent.click(getByText('Annuler'))
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(panelOpen(container)).toBe(false)

    await openPanel(container)
    await fireEvent.keyDown(getByRole('slider'), { key: 'Escape' })
    await nextTick()
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(panelOpen(container)).toBe(false)

    await openPanel(container)
    const root = container.querySelector('.ds-timepicker') as HTMLElement
    root.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null, bubbles: true }))
    await nextTick()
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(panelOpen(container)).toBe(false)
  })

  it('passe des heures aux minutes (Entrée au cadran, cellules d’en-tête)', async () => {
    const { container, getByRole } = render(TimePicker, {
      props: { mode: 'readonly', modelValue: '09:15', format: '24h' },
    })
    await openPanel(container)
    await fireEvent.keyDown(getByRole('slider'), { key: 'Enter' })
    await nextTick()
    expect(getByRole('slider').getAttribute('aria-label')).toBe('Minutes')
    expect(getByRole('slider').getAttribute('aria-valuemax')).toBe('59')
    // retour à l'étape heure par la cellule d'en-tête
    await fireEvent.click(hourCell(container))
    await nextTick()
    expect(getByRole('slider').getAttribute('aria-label')).toBe('Heure')
  })

  it('Entrée à l’étape minutes commite et ferme', async () => {
    const { container, emitted, getByRole } = render(TimePicker, {
      props: { mode: 'readonly', modelValue: '09:15', format: '24h' },
    })
    await openPanel(container)
    const slider = getByRole('slider')
    await fireEvent.keyDown(slider, { key: 'Enter' }) // heure → minutes
    await fireEvent.keyDown(getByRole('slider'), { key: 'ArrowUp' })
    await fireEvent.keyDown(getByRole('slider'), { key: 'Enter' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['09:16'])
    expect(panelOpen(container)).toBe(false)
  })

  it('ignore showDial en lecture seule (et l’annonce)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container, getByRole } = render(TimePicker, {
      props: { mode: 'readonly', modelValue: '09:15', format: '24h', showDial: false },
    })
    await openPanel(container)
    expect(getByRole('slider')).toBeTruthy()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('showDial'))
    warn.mockRestore()
  })

  it('n’a plus de bascule de mode dans le pied du panneau', () => {
    const { container } = render(TimePicker, { props: { mode: 'readonly', modelValue: '09:15' } })
    expect(container.querySelector('.ds-timepicker-mode')).toBeNull()
  })

  it('dérive le format de la locale (en-US → 12h)', async () => {
    const { container, getByRole } = render(TimePicker, {
      props: { mode: 'readonly', modelValue: '19:00', locale: 'en-US' },
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toMatch(/PM/)
    // le Toggle vit hors du panneau : présent sans même l'ouvrir
    expect(container.querySelector('.ds-timepicker-meridiem')).toBeTruthy()
    await openPanel(container)
    // cadran 12h : valeur affichée 7, max 12
    expect(getByRole('slider').getAttribute('aria-valuenow')).toBe('7')
    expect(getByRole('slider').getAttribute('aria-valuemax')).toBe('12')
  })

  describe('heure courante', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 6, 27, 14, 42))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('initialise le brouillon à l’heure courante sans valeur', async () => {
      const { container } = render(TimePicker, {
        props: { mode: 'readonly', modelValue: null, format: '24h' },
      })
      await openPanel(container)
      expect(hourCell(container).textContent?.trim()).toBe('14')
    })
  })

  it('efface la valeur via la croix', async () => {
    const { container, emitted } = render(TimePicker, {
      props: { mode: 'readonly', modelValue: '09:15', clearable: true },
    })
    const clearBtn = container.querySelector('button[aria-label="Effacer l\'heure"]') as HTMLElement
    expect(clearBtn).toBeTruthy()
    await fireEvent.click(clearBtn)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('expose un slider ARIA complet (valuetext localisé)', async () => {
    const { container, getByRole } = render(TimePicker, {
      props: { mode: 'readonly', modelValue: '07:35', format: '24h' },
    })
    await openPanel(container)
    const slider = getByRole('slider')
    expect(slider.getAttribute('aria-valuemin')).toBe('0')
    expect(slider.getAttribute('aria-valuemax')).toBe('23')
    expect(slider.getAttribute('aria-valuetext')).toBe('7 heures')
    await fireEvent.keyDown(slider, { key: 'Enter' })
    await nextTick()
    expect(getByRole('slider').getAttribute('aria-valuetext')).toBe('35 minutes')
  })
})

/**
 * Frappe simulée : jsdom ne pose pas de caret, on le place explicitement en fin
 * de texte comme le ferait une saisie séquentielle.
 */
async function type(input: HTMLInputElement, value: string) {
  input.value = value
  input.setSelectionRange(value.length, value.length)
  await fireEvent.input(input)
}

describe('TimePicker — mode saisie', () => {
  const mount = (props: Record<string, unknown> = {}) =>
    render(TimePicker, {
      props: { mode: 'input', format: '24h', locale: 'fr-FR', label: 'Heure', ...props },
    })

  it('rend un champ éditable au masque HH:MM', () => {
    const { container } = mount({ modelValue: '09:30' })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(false)
    expect(input.value).toBe('09:30')
    expect(input.getAttribute('inputmode')).toBe('numeric')
    expect(input.getAttribute('autocomplete')).toBe('off')
    expect(input.getAttribute('placeholder')).toBe('hh:mm')
  })

  it('pose le deux-points au fil de la frappe et ne commite qu’une heure complète', async () => {
    const { container, emitted } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '0')
    expect(input.value).toBe('0')
    await type(input, '09')
    expect(input.value).toBe('09:')
    expect(emitted('update:modelValue')).toBeUndefined()
    await type(input, '09:30')
    expect(input.value).toBe('09:30')
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['09:30'])
  })

  it('ignore les caractères refusés sans que le texte brut ne reparaisse', async () => {
    // Le masque ne change pas → Vue ne repatche rien. Sans le `v-model` sur
    // l'Input (dont l'état interne recopierait le texte brut) le 5e chiffre
    // réapparaîtrait dans le DOM au patch suivant.
    const { container } = mount({ modelValue: '09:30' })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '09:301')
    await nextTick()
    expect(input.value).toBe('09:30')
  })

  it('le Retour arrière sur le deux-points efface le chiffre qui le précède', async () => {
    const { container } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '09')
    expect(input.value).toBe('09:')
    input.setSelectionRange(3, 3)
    await fireEvent.keyDown(input, { key: 'Backspace' })
    expect(input.value).toBe('0')
  })

  it('un deux-points tapé complète l’heure par un zéro de tête', async () => {
    const { container } = mount()
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '9')
    await fireEvent.keyDown(input, { key: ':' })
    expect(input.value).toBe('09:')
  })

  it('revert silencieusement une heure impossible à la sortie du champ', async () => {
    const { container, emitted } = mount({ modelValue: '09:30' })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '25:00')
    await fireEvent.change(input)
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(input.value).toBe('09:30')
  })

  it('vide la valeur quand le champ est vidé', async () => {
    const { container, emitted } = mount({ modelValue: '09:30' })
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '')
    await fireEvent.change(input)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  // « aucun cadran sans showDial » est désormais le comportement PAR DÉFAUT du
  // composant : le test vit dans le describe « défaut ».

  it('showDial rétablit l’icône et l’ouverture au focus, sans voler le curseur', async () => {
    // sans valeur : l'icône de fin est bien le cadran, pas la croix d'effacement
    const { container, getByRole } = mount({ modelValue: null, showDial: true })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.getAttribute('aria-haspopup')).toBe('dialog')
    expect(container.querySelector('button[aria-label="Ouvrir le sélecteur d’heure"]')).toBeTruthy()
    await fireEvent.focus(input)
    await nextTick()
    expect(panelOpen(container)).toBe(true)
    // la flèche bas est le chemin explicite du champ vers le cadran
    await fireEvent.keyDown(input, { key: 'ArrowDown', bubbles: true })
    await nextTick()
    expect(document.activeElement).toBe(getByRole('slider'))
  })
})

describe('TimePicker — mode liste', () => {
  const mount = (props: Record<string, unknown> = {}) =>
    render(TimePicker, {
      props: {
        mode: 'list',
        minuteStep: 30,
        format: '24h',
        locale: 'fr-FR',
        label: 'Heure',
        ...props,
      },
    })

  const optionsOf = (container: Element) =>
    [...container.querySelectorAll('[role="option"]')] as HTMLElement[]

  it('rend une listbox des heures au pas demandé, champ en lecture seule', async () => {
    const { container, getByRole } = mount({ modelValue: '14:30' })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(true)
    expect(input.getAttribute('aria-haspopup')).toBe('listbox')
    await openPanel(container)
    expect(getByRole('listbox')).toBeTruthy()
    const options = optionsOf(container)
    expect(options).toHaveLength(48)
    expect(options[0]?.textContent?.trim()).toBe('0:00')
    const selected = options.find((o) => o.getAttribute('aria-selected') === 'true')
    expect(selected?.dataset.value).toBe('14:30')
  })

  it('commite directement au clic et ferme (ni brouillon ni OK)', async () => {
    const { container, emitted } = mount({ modelValue: '14:30' })
    await openPanel(container)
    expect(container.querySelector('.ds-timepicker-footer')).toBeNull()
    await fireEvent.click(optionsOf(container)[3] as HTMLElement) // 01:30
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['01:30'])
    expect(container.querySelector('.ds-timepicker-list')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('l’Entrée sur une rangée commite et ne rouvre pas le panneau', async () => {
    // Sans le preventDefault de onPanelKeydown, l'Entrée remonte à la racine
    // sans être marquée consommée et la garde `defaultPrevented` de
    // useFieldPanel ne joue pas : le panneau se rouvre aussitôt.
    const { container, emitted } = mount({ modelValue: '14:30' })
    await openPanel(container)
    const option = optionsOf(container)[5] as HTMLElement // 02:30
    option.focus()
    await fireEvent.keyDown(option, { key: 'Enter', bubbles: true })
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['02:30'])
    expect(container.querySelector('.ds-timepicker-list')?.hasAttribute('data-popover-open')).toBe(
      false,
    )
  })

  it('navigue au clavier dans la liste (flèches, Home, End)', async () => {
    const { container } = mount({ modelValue: '00:00' })
    await openPanel(container)
    const options = optionsOf(container)
    const panel = container.querySelector('.ds-timepicker-list') as HTMLElement
    options[0]?.focus()
    await fireEvent.keyDown(panel, { key: 'ArrowDown', bubbles: true })
    expect(document.activeElement).toBe(options[1])
    await fireEvent.keyDown(panel, { key: 'End', bubbles: true })
    expect(document.activeElement).toBe(options.at(-1))
    await fireEvent.keyDown(panel, { key: 'Home', bubbles: true })
    expect(document.activeElement).toBe(options[0])
  })

  it('avertit sur showDial et sur un pas trop fin', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount({ modelValue: null, showDial: true, minuteStep: 1 })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('showDial'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('rangées'))
    warn.mockRestore()
  })
})

describe('TimePicker — méridien hors du panneau', () => {
  const pmOf = (container: Element) =>
    [...container.querySelectorAll('.ds-timepicker-meridiem button')].find(
      (b) => b.textContent?.trim() === 'PM',
    ) as HTMLElement

  it('pilote le v-model sans ouvrir ni valider', async () => {
    const { container, emitted } = render(TimePicker, {
      props: { modelValue: '07:00', format: '12h' },
    })
    const pm = pmOf(container)
    expect(pm.getAttribute('aria-pressed')).toBe('false')
    await fireEvent.click(pm)
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['19:00'])
    expect(panelOpen(container)).toBe(false)
  })

  it('sans valeur : le choix est mémorisé et s’applique à la première saisie', async () => {
    const { container, emitted } = render(TimePicker, {
      props: { modelValue: null, format: '12h', mode: 'input' },
    })
    await fireEvent.click(pmOf(container))
    expect(emitted('update:modelValue')).toBeUndefined() // rien à convertir
    const input = container.querySelector('input') as HTMLInputElement
    await type(input, '07:00')
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['19:00'])
  })

  it('cadran ouvert : le brouillon suit le méridien, OK commite la bonne valeur', async () => {
    const { container, emitted, getByText } = render(TimePicker, {
      props: { mode: 'readonly', modelValue: '07:00', format: '12h' },
    })
    await openPanel(container)
    await fireEvent.click(pmOf(container))
    await nextTick()
    await fireEvent.click(getByText('OK'))
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['19:00'])
  })
})
