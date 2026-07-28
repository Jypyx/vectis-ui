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

describe('TimePicker', () => {
  it('affiche la valeur formatée dans un champ en lecture seule', () => {
    const { container } = render(TimePicker, {
      props: { modelValue: '19:05', locale: 'fr-FR', label: 'Heure' },
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(true)
    expect(input.value).toBe('19:05')
    expect(input.getAttribute('aria-haspopup')).toBe('dialog')
    expect(input.getAttribute('aria-expanded')).toBe('false')
  })

  it('ouvre le panneau au clic et rend le cadran (slider)', async () => {
    const { container, getByRole } = render(TimePicker, {
      props: { modelValue: '09:15', label: 'Heure' },
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
      props: { modelValue: '09:15', format: '24h' },
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
      props: { modelValue: '09:15', format: '24h' },
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
      props: { modelValue: '09:15', format: '24h' },
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
      props: { modelValue: '09:15', format: '24h' },
    })
    await openPanel(container)
    const slider = getByRole('slider')
    await fireEvent.keyDown(slider, { key: 'Enter' }) // heure → minutes
    await fireEvent.keyDown(getByRole('slider'), { key: 'ArrowUp' })
    await fireEvent.keyDown(getByRole('slider'), { key: 'Enter' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['09:16'])
    expect(panelOpen(container)).toBe(false)
  })

  it('bascule cadran ↔ saisie ; lockMode masque la bascule', async () => {
    const { container, getByRole, queryByRole, getByLabelText, rerender } = render(TimePicker, {
      props: { modelValue: '09:15', format: '24h' },
    })
    await openPanel(container)
    await fireEvent.click(getByLabelText('Passer en saisie clavier'))
    await nextTick()
    expect(queryByRole('slider')).toBeNull()
    expect(getByLabelText('Heure', { selector: 'input.ds-timepicker-field' })).toBeTruthy()
    await fireEvent.click(getByLabelText('Passer au cadran'))
    await nextTick()
    expect(getByRole('slider')).toBeTruthy()

    await rerender({ lockMode: true })
    expect(container.querySelector('.ds-timepicker-mode')).toBeNull()
  })

  it('mode saisie : clamp au change, wrap aux flèches, Entrée commite', async () => {
    const { container, emitted, getByLabelText } = render(TimePicker, {
      props: { modelValue: '09:15', format: '24h', mode: 'input' },
    })
    await openPanel(container)
    const hourField = getByLabelText('Heure', {
      selector: 'input.ds-timepicker-field',
    }) as HTMLInputElement
    const minuteField = getByLabelText('Minute', {
      selector: 'input.ds-timepicker-field',
    }) as HTMLInputElement

    // '99' clampé à 23 au change
    await fireEvent.input(hourField, { target: { value: '99' } })
    await fireEvent.change(hourField)
    expect(hourField.value).toBe('23')

    // '7' → reformaté '07'
    await fireEvent.input(hourField, { target: { value: '7' } })
    await fireEvent.change(hourField)
    expect(hourField.value).toBe('07')

    // wrap aux flèches : 59 + 1 → 00
    await fireEvent.input(minuteField, { target: { value: '59' } })
    await fireEvent.change(minuteField)
    await fireEvent.keyDown(minuteField, { key: 'ArrowUp' })
    expect(minuteField.value).toBe('00')

    // Entrée commite la valeur du brouillon et ferme
    await fireEvent.keyDown(minuteField, { key: 'Enter' })
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['07:00'])
    expect(panelOpen(container)).toBe(false)
  })

  it('format 12h : Toggle AM/PM, conversion 24 h canonique au commit', async () => {
    const { container, emitted, getByText, getAllByRole } = render(TimePicker, {
      props: { modelValue: '07:00', format: '12h' },
    })
    await openPanel(container)
    const pm = getAllByRole('button').find((b) => b.textContent?.trim() === 'PM') as HTMLElement
    expect(pm.getAttribute('aria-pressed')).toBe('false')
    await fireEvent.click(pm)
    await nextTick()
    expect(pm.getAttribute('aria-pressed')).toBe('true')
    await fireEvent.click(getByText('OK'))
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['19:00'])
  })

  it('dérive le format de la locale (en-US → 12h)', async () => {
    const { container, getByRole } = render(TimePicker, {
      props: { modelValue: '19:00', locale: 'en-US' },
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toMatch(/PM/)
    await openPanel(container)
    expect(container.querySelector('.ds-timepicker-meridiem')).toBeTruthy()
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
      const { container } = render(TimePicker, { props: { modelValue: null, format: '24h' } })
      await openPanel(container)
      expect(hourCell(container).textContent?.trim()).toBe('14')
    })
  })

  it('efface la valeur via la croix', async () => {
    const { container, emitted } = render(TimePicker, {
      props: { modelValue: '09:15', clearable: true },
    })
    const clearBtn = container.querySelector('button[aria-label="Effacer l\'heure"]') as HTMLElement
    expect(clearBtn).toBeTruthy()
    await fireEvent.click(clearBtn)
    expect(emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('expose un slider ARIA complet (valuetext localisé)', async () => {
    const { container, getByRole } = render(TimePicker, {
      props: { modelValue: '07:35', format: '24h' },
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
