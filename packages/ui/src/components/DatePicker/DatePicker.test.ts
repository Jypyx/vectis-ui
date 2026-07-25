import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import DatePicker from './DatePicker.vue'

const JUNE = '2026-06-10'

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
