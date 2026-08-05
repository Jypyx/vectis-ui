import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import VCalendar from './VCalendar.vue'

// Reference grid: June 2026 (the 10th is a Wednesday).
// Several tests pass `locale: 'fr-FR'` on purpose: the `locale` prop is what they
// assert, so their expectations are French month and day names. The DS dictionary is a
// separate axis — the navigation buttons stay in the base locale (English).
const JUNE = '2026-06-10'

function keydown(el: Element, key: string, opts: KeyboardEventInit = {}) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...opts }))
}

describe('VCalendar', () => {
  it('renders 42 cells and localized day headers', () => {
    const { container } = render(VCalendar, {
      props: { modelValue: JUNE, locale: 'fr-FR' },
    })
    expect(container.querySelectorAll('[role="gridcell"]')).toHaveLength(42)
    const headers = container.querySelectorAll('[role="columnheader"]')
    expect(headers).toHaveLength(7)
    // fr-FR → the first column is Monday
    expect(headers[0]?.getAttribute('aria-label')?.toLowerCase()).toContain('lundi')
  })

  it('selects a date (single selection) and emits an ISO string', async () => {
    const { container, emitted } = render(VCalendar, {
      props: { modelValue: JUNE },
    })
    const btn = container.querySelector('.v-calendar-day[data-selected]') as HTMLElement
    expect(btn.textContent).toContain('10')
    const cell15 = [...container.querySelectorAll('.v-calendar-day')].find(
      (b) => b.textContent?.trim() === '15' && !b.hasAttribute('data-outside'),
    ) as HTMLElement
    await fireEvent.click(cell15)
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['2026-06-15'])
    expect(emitted('select')?.at(-1)).toEqual(['2026-06-15'])
  })

  it('builds a reordered range (range selection)', async () => {
    const { container, emitted } = render(VCalendar, {
      props: { selection: 'range', modelValue: { start: null, end: null } },
    })
    // No starting modelValue is given → the current month. The month is therefore driven
    // by clicking days of the displayed month rather than by navigating.
    const days = [
      ...container.querySelectorAll('.v-calendar-day:not([data-outside])'),
    ] as HTMLElement[]
    const d20 = days.find((d) => d.textContent?.trim() === '20')!
    const d10 = days.find((d) => d.textContent?.trim() === '10')!
    await fireEvent.click(d20) // start
    await fireEvent.click(d10) // end < start → reordered
    const last = (emitted('update:modelValue')?.at(-1) as unknown[])?.[0] as {
      start: string
      end: string
    }
    expect(last.start.endsWith('-10')).toBe(true)
    expect(last.end.endsWith('-20')).toBe(true)
    expect(last.start < last.end).toBe(true)
  })

  it('toggles a date in the array (multiple selection)', async () => {
    const { container, emitted, rerender } = render(VCalendar, {
      props: { selection: 'multiple', modelValue: [] as string[] },
    })
    const days = [
      ...container.querySelectorAll('.v-calendar-day:not([data-outside])'),
    ] as HTMLElement[]
    const d5 = days.find((d) => d.textContent?.trim() === '5')!
    await fireEvent.click(d5)
    const added = (emitted('update:modelValue')?.at(-1) as unknown[])?.[0] as string[]
    expect(added).toHaveLength(1)
    await rerender({ modelValue: added })
    await fireEvent.click(d5)
    const removed = (emitted('update:modelValue')?.at(-1) as unknown[])?.[0] as string[]
    expect(removed).toHaveLength(0)
  })

  it('disables the dates outside [min,max] and blocks their selection', async () => {
    const { container, emitted } = render(VCalendar, {
      props: { modelValue: JUNE, min: '2026-06-05', max: '2026-06-20' },
    })
    const days = [...container.querySelectorAll('.v-calendar-day')] as HTMLElement[]
    const d1 = days.find((d) => d.textContent?.trim() === '1' && !d.hasAttribute('data-outside'))!
    expect(d1.getAttribute('aria-disabled')).toBe('true')
    await fireEvent.click(d1)
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('strikes through the dates matched by the disabledDates predicate', () => {
    const { container } = render(VCalendar, {
      props: {
        modelValue: JUNE,
        disabledDates: (iso: string) => iso === '2026-06-12',
      },
    })
    const days = [...container.querySelectorAll('.v-calendar-day')] as HTMLElement[]
    const d12 = days.find((d) => d.textContent?.trim() === '12' && !d.hasAttribute('data-outside'))!
    expect(d12.getAttribute('aria-disabled')).toBe('true')
  })

  it('hides the adjacent days when showAdjacentDays is false', () => {
    // by default selectAdjacentDays=false → adjacent days are rendered as static spans
    const withAdjacent = render(VCalendar, { props: { modelValue: JUNE, showAdjacentDays: true } })
    const withoutAdjacent = render(VCalendar, {
      props: { modelValue: JUNE, showAdjacentDays: false },
    })
    const adjacent = (c: HTMLElement) =>
      c.querySelectorAll('.v-calendar-day--static, .v-calendar-day[data-outside]').length
    expect(adjacent(withAdjacent.container as HTMLElement)).toBeGreaterThan(0)
    expect(adjacent(withoutAdjacent.container as HTMLElement)).toBe(0)
  })

  it('does not display the adjacent days by default', () => {
    const { container } = render(VCalendar, { props: { modelValue: JUNE } })
    const adjacent = container.querySelectorAll(
      '.v-calendar-day--static, .v-calendar-day[data-outside]',
    )
    expect(adjacent).toHaveLength(0)
  })

  it('strikes through the adjacent days outside [min,max]', () => {
    // June 2026 (starting on a Monday) → July days at the end of the grid, all > max
    const { container } = render(VCalendar, {
      props: { modelValue: JUNE, max: '2026-06-24', showAdjacentDays: true },
    })
    const struck = container.querySelectorAll('.v-calendar-day--static[data-disabled]')
    expect(struck.length).toBeGreaterThan(0)
  })

  it('applies the #day slot to the static adjacent days', () => {
    // otherwise multi-line content would only apply to the days of the month and would
    // vertically shift the numbers of the adjacent days
    const { container } = render(VCalendar, {
      props: { modelValue: JUNE, showAdjacentDays: true },
      slots: { day: '<span class="marker">{{ params.day }}</span>' },
    })
    const statics = [...container.querySelectorAll('.v-calendar-day--static')]
    expect(statics.length).toBeGreaterThan(0)
    expect(statics.every((s) => s.querySelector('.marker') !== null)).toBe(true)
  })

  it('renders the adjacent days as clickable when selectAdjacentDays is true', () => {
    const { container } = render(VCalendar, {
      props: { modelValue: JUNE, showAdjacentDays: true, selectAdjacentDays: true },
    })
    // they become buttons marked data-outside
    expect(
      container.querySelectorAll('button.v-calendar-day[data-outside]').length,
    ).toBeGreaterThan(0)
  })

  it('renders dots for the events', () => {
    const { container } = render(VCalendar, {
      props: {
        modelValue: JUNE,
        events: [
          { date: '2026-06-10', color: 'red' },
          { date: '2026-06-10', color: 'green' },
        ],
      },
    })
    const selected = container.querySelector('.v-calendar-day[data-selected]') as HTMLElement
    expect(selected.querySelectorAll('.v-calendar-dot')).toHaveLength(2)
  })

  it('changes month through the chevrons', async () => {
    const { container, getByRole } = render(VCalendar, {
      props: { modelValue: JUNE, locale: 'fr-FR' },
    })
    const grid = getByRole('grid')
    expect(grid.getAttribute('aria-label')?.toLowerCase()).toContain('juin')
    await fireEvent.click(getByRole('button', { name: 'Next month' }))
    expect(getByRole('grid').getAttribute('aria-label')?.toLowerCase()).toContain('juillet')
    expect(container).toBeTruthy()
  })

  it('opens the months view then selects a month', async () => {
    const { getByRole, getAllByRole } = render(VCalendar, {
      props: { modelValue: JUNE, locale: 'fr-FR' },
    })
    await fireEvent.click(getByRole('button', { expanded: false, name: /juin/i }))
    const monthsGrid = getByRole('grid', { name: /month/i })
    expect(monthsGrid).toBeTruthy()
    const cells = getAllByRole('gridcell')
    expect(cells.length).toBe(12)
  })

  it('opens the years view with a malformed min/max instead of throwing', async () => {
    // `min`/`max` are raw consumer strings: the years view is the only place they are
    // parsed as a Date, so a non-ISO bound must degrade to the open range.
    const { container } = render(VCalendar, {
      props: { modelValue: JUNE, min: '01/01/2024', max: 'not-a-date' },
    })
    // Two toggles carry the class: [0] opens the months view, [1] the years view.
    const toggle = container.querySelectorAll('.v-calendar-picker-toggle')[1] as HTMLElement
    await fireEvent.click(toggle)
    // 2026 ± 100 → the fallback range, rendered rather than crashed.
    expect(
      container.querySelectorAll('.v-calendar-picker--years .v-calendar-picker-cell'),
    ).toHaveLength(201)
  })

  it('navigates with the keyboard (arrows) and selects with Enter', async () => {
    const { container, emitted } = render(VCalendar, { props: { modelValue: JUNE } })
    const grid = container.querySelector('[role="grid"]') as HTMLElement
    const focused = container.querySelector('.v-calendar-day[tabindex="0"]') as HTMLElement
    focused.focus()
    keydown(grid, 'ArrowRight') // 10 → 11
    await nextTick()
    keydown(grid, 'Enter')
    await nextTick()
    expect(emitted('update:modelValue')?.at(-1)).toEqual(['2026-06-11'])
  })
})
