import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import Calendar from './Calendar.vue'

// Grille de référence : juin 2026 (le 10 est un mercredi).
const JUNE = '2026-06-10'

function keydown(el: Element, key: string, opts: KeyboardEventInit = {}) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...opts }))
}

describe('Calendar', () => {
  it('rend 42 cellules et des en-têtes de jours localisés', () => {
    const { container } = render(Calendar, {
      props: { modelValue: JUNE, locale: 'fr-FR' },
    })
    // 6 lignes × 7 = 42 cellules
    expect(container.querySelectorAll('[role="gridcell"]')).toHaveLength(42)
    const headers = container.querySelectorAll('[role="columnheader"]')
    expect(headers).toHaveLength(7)
    // fr-FR → première colonne = lundi
    expect(headers[0]?.getAttribute('aria-label')?.toLowerCase()).toContain('lundi')
  })

  it('sélectionne une date (mode single) et émet un ISO', async () => {
    const { container, emitted } = render(Calendar, {
      props: { modelValue: JUNE },
    })
    const btn = container.querySelector('.ds-calendar-day[data-selected]') as HTMLElement
    expect(btn.textContent).toContain('10')
    // clique le 15
    const cell15 = [...container.querySelectorAll('.ds-calendar-day')].find(
      (b) => b.textContent?.trim() === '15' && !b.hasAttribute('data-outside'),
    ) as HTMLElement
    await fireEvent.click(cell15)
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['2026-06-15'])
    expect(emitted('select')?.at(-1)).toEqual(['2026-06-15'])
  })

  it('construit une plage réordonnée (mode range)', async () => {
    const { container, emitted } = render(Calendar, {
      props: { mode: 'range', modelValue: { start: null, end: null } },
    })
    // navigue vers juin 2026 via un modelValue de départ n'est pas donné → mois courant.
    // On force plutôt le mois via clic sur des jours du mois affiché.
    const days = [
      ...container.querySelectorAll('.ds-calendar-day:not([data-outside])'),
    ] as HTMLElement[]
    const d20 = days.find((d) => d.textContent?.trim() === '20')!
    const d10 = days.find((d) => d.textContent?.trim() === '10')!
    await fireEvent.click(d20) // start
    await fireEvent.click(d10) // end < start → réordonné
    const last = (emitted('update:modelValue')?.at(-1) as unknown[])?.[0] as {
      start: string
      end: string
    }
    expect(last.start.endsWith('-10')).toBe(true)
    expect(last.end.endsWith('-20')).toBe(true)
    expect(last.start < last.end).toBe(true)
  })

  it('bascule une date dans le tableau (mode multiple)', async () => {
    const { container, emitted, rerender } = render(Calendar, {
      props: { mode: 'multiple', modelValue: [] as string[] },
    })
    const days = [
      ...container.querySelectorAll('.ds-calendar-day:not([data-outside])'),
    ] as HTMLElement[]
    const d5 = days.find((d) => d.textContent?.trim() === '5')!
    await fireEvent.click(d5)
    const added = (emitted('update:modelValue')?.at(-1) as unknown[])?.[0] as string[]
    expect(added).toHaveLength(1)
    // re-clic retire
    await rerender({ modelValue: added })
    await fireEvent.click(d5)
    const removed = (emitted('update:modelValue')?.at(-1) as unknown[])?.[0] as string[]
    expect(removed).toHaveLength(0)
  })

  it('désactive les dates hors [min,max] et bloque leur sélection', async () => {
    const { container, emitted } = render(Calendar, {
      props: { modelValue: JUNE, min: '2026-06-05', max: '2026-06-20' },
    })
    const days = [...container.querySelectorAll('.ds-calendar-day')] as HTMLElement[]
    const d1 = days.find((d) => d.textContent?.trim() === '1' && !d.hasAttribute('data-outside'))!
    expect(d1.getAttribute('aria-disabled')).toBe('true')
    await fireEvent.click(d1)
    // aucun changement de modèle
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('barre les dates du prédicat disabledDates', () => {
    const { container } = render(Calendar, {
      props: {
        modelValue: JUNE,
        disabledDates: (iso: string) => iso === '2026-06-12',
      },
    })
    const days = [...container.querySelectorAll('.ds-calendar-day')] as HTMLElement[]
    const d12 = days.find((d) => d.textContent?.trim() === '12' && !d.hasAttribute('data-outside'))!
    expect(d12.getAttribute('aria-disabled')).toBe('true')
  })

  it('masque les jours adjacents quand showAdjacentDays est faux', () => {
    // par défaut selectAdjacentDays=false → jours adjacents rendus en spans statiques
    const withAdjacent = render(Calendar, { props: { modelValue: JUNE, showAdjacentDays: true } })
    const withoutAdjacent = render(Calendar, {
      props: { modelValue: JUNE, showAdjacentDays: false },
    })
    const adjacent = (c: HTMLElement) =>
      c.querySelectorAll('.ds-calendar-day--static, .ds-calendar-day[data-outside]').length
    expect(adjacent(withAdjacent.container as HTMLElement)).toBeGreaterThan(0)
    expect(adjacent(withoutAdjacent.container as HTMLElement)).toBe(0)
  })

  it('n’affiche pas les jours adjacents par défaut', () => {
    const { container } = render(Calendar, { props: { modelValue: JUNE } })
    const adjacent = container.querySelectorAll(
      '.ds-calendar-day--static, .ds-calendar-day[data-outside]',
    )
    expect(adjacent).toHaveLength(0)
  })

  it('barre les jours adjacents hors [min,max]', () => {
    // juin 2026 (débute lundi) → jours de juillet en fin de grille, tous > max
    const { container } = render(Calendar, {
      props: { modelValue: JUNE, max: '2026-06-24', showAdjacentDays: true },
    })
    const struck = container.querySelectorAll('.ds-calendar-day--static[data-disabled]')
    expect(struck.length).toBeGreaterThan(0)
  })

  it('applique le slot #day aux jours adjacents statiques', () => {
    // sinon un contenu multi-lignes ne s'appliquerait qu'aux jours du mois et
    // décalerait verticalement les numéros des jours adjacents
    const { container } = render(Calendar, {
      props: { modelValue: JUNE, showAdjacentDays: true },
      slots: { day: '<span class="marqueur">{{ params.day }}</span>' },
    })
    const statics = [...container.querySelectorAll('.ds-calendar-day--static')]
    expect(statics.length).toBeGreaterThan(0)
    expect(statics.every((s) => s.querySelector('.marqueur') !== null)).toBe(true)
  })

  it('rend les jours adjacents cliquables quand selectAdjacentDays est vrai', () => {
    const { container } = render(Calendar, {
      props: { modelValue: JUNE, showAdjacentDays: true, selectAdjacentDays: true },
    })
    // ils deviennent des boutons marqués data-outside
    expect(
      container.querySelectorAll('button.ds-calendar-day[data-outside]').length,
    ).toBeGreaterThan(0)
  })

  it('rend des pastilles pour les événements', () => {
    const { container } = render(Calendar, {
      props: {
        modelValue: JUNE,
        events: [
          { date: '2026-06-10', color: 'red' },
          { date: '2026-06-10', color: 'green' },
        ],
      },
    })
    const selected = container.querySelector('.ds-calendar-day[data-selected]') as HTMLElement
    expect(selected.querySelectorAll('.ds-calendar-dot')).toHaveLength(2)
  })

  it('change de mois via les chevrons', async () => {
    const { container, getByRole } = render(Calendar, {
      props: { modelValue: JUNE, locale: 'fr-FR' },
    })
    const grid = getByRole('grid')
    expect(grid.getAttribute('aria-label')?.toLowerCase()).toContain('juin')
    await fireEvent.click(getByRole('button', { name: 'Mois suivant' }))
    expect(getByRole('grid').getAttribute('aria-label')?.toLowerCase()).toContain('juillet')
    expect(container).toBeTruthy()
  })

  it('ouvre la vue mois puis sélectionne un mois', async () => {
    const { getByRole, getAllByRole } = render(Calendar, {
      props: { modelValue: JUNE, locale: 'fr-FR' },
    })
    // le libellé de mois est un bouton
    await fireEvent.click(getByRole('button', { expanded: false, name: /juin/i }))
    // grille des mois visible
    const monthsGrid = getByRole('grid', { name: /mois/i })
    expect(monthsGrid).toBeTruthy()
    const cells = getAllByRole('gridcell')
    expect(cells.length).toBe(12)
  })

  it('navigue au clavier (flèches) et sélectionne avec Entrée', async () => {
    const { container, emitted } = render(Calendar, { props: { modelValue: JUNE } })
    const grid = container.querySelector('[role="grid"]') as HTMLElement
    const focused = container.querySelector('.ds-calendar-day[tabindex="0"]') as HTMLElement
    focused.focus()
    keydown(grid, 'ArrowRight') // 10 → 11
    await nextTick()
    keydown(grid, 'Enter')
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['2026-06-11'])
  })
})
