import { fireEvent, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import VCalendar from './VCalendar.vue'
import { EDGE_STEP_DELAY } from './edgeStep'
import { daySpan, packAllDay, packDayColumn } from './layout'
import type { CalendarEvent, CalendarEventSlotProps } from './types'

/*
 * The two packers are wrapped, never replaced: every test in this file runs the real layout,
 * and `what a drag recomputes` reads the call counts to pin which half of it a gesture wakes.
 */
vi.mock('./layout', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./layout')>()
  return {
    ...actual,
    packAllDay: vi.fn(actual.packAllDay),
    packDayColumn: vi.fn(actual.packDayColumn),
  }
})

/*
 * Reference week: June 2026. The 8th is a Monday, so the 10th is a Wednesday and the 13th
 * and 14th are the weekend — the grid VDatePicker's tests use too.
 *
 * VCalendar is a GENERIC single-file component, so `typeof VCalendar` is a function rather
 * than a class and the usual component typings do not apply: everything below casts, the
 * way VDataTable's tests do for the same reason.
 */
const WEDNESDAY = '2026-06-10'
const MONDAY = '2026-06-08'

const Calendar = VCalendar as unknown as Record<string, unknown>

function event(partial: Partial<CalendarEvent> & Pick<CalendarEvent, 'id'>): CalendarEvent {
  return {
    title: `Event ${partial.id}`,
    start: WEDNESDAY,
    end: WEDNESDAY,
    startTime: '09:00',
    endTime: '10:00',
    ...partial,
  }
}

const mount = (props: Record<string, unknown> = {}) =>
  render(Calendar, {
    props: { label: 'Schedule', date: WEDNESDAY, view: 'week', ...props },
  })

const cells = (container: Element) => [...container.querySelectorAll('.v-calendar-cell')]
const columnsOf = (container: Element) =>
  new Set(cells(container).map((cell) => (cell as HTMLElement).dataset.iso))

describe('the days on show', () => {
  it('shows a column for every day of the week', () => {
    const { container } = mount()
    expect(columnsOf(container).size).toBe(7)
  })

  it('shows one column in the day view', () => {
    const { container } = mount({ view: 'day' })
    expect([...columnsOf(container)]).toEqual([WEDNESDAY])
  })

  it('shows four in the four-day view', () => {
    const { container } = mount({ view: '4days' })
    expect([...columnsOf(container)]).toEqual([WEDNESDAY, '2026-06-11', '2026-06-12', '2026-06-13'])
  })

  it('takes its length from customDays in the custom view', () => {
    const { container } = mount({ view: 'custom', customDays: 3 })
    expect(columnsOf(container).size).toBe(3)
  })

  it('leaves out the weekdays it was told to hide', () => {
    const { container } = mount({ weekdays: [1, 2, 3, 4, 5] })
    const shown = columnsOf(container)
    expect(shown.size).toBe(5)
    expect(shown.has('2026-06-13')).toBe(false)
  })

  it('starts the week on the first weekday given', () => {
    const { container } = mount({ weekdays: [1, 2, 3, 4, 5, 6, 0] })
    expect(cells(container)[0]).toHaveProperty('dataset.iso', MONDAY)
  })

  // `en-US` starts the week on a Sunday; the shorthand overrides the locale, never `weekdays`.
  it('starts the week on firstDayOfWeek when no weekdays are given', () => {
    const { container } = mount({ firstDayOfWeek: 1 })
    expect(cells(container)[0]).toHaveProperty('dataset.iso', MONDAY)
    expect(columnsOf(container).size).toBe(7)
  })

  it('lets weekdays win over firstDayOfWeek', () => {
    const { container } = mount({ firstDayOfWeek: 1, weekdays: [3, 4, 5] })
    expect(cells(container)[0]).toHaveProperty('dataset.iso', WEDNESDAY)
  })

  it('hands the day header its number as text', () => {
    const { getByText } = render(Calendar, {
      props: { label: 'Schedule', date: WEDNESDAY, view: 'day' },
      slots: {
        'day-header': ({ weekday, dayText }: { weekday: string; dayText: string }) =>
          `${weekday} / ${dayText}`,
      },
    })
    expect(getByText('Wed / 10')).toBeTruthy()
  })
})

describe('an hour row per hour of the window', () => {
  it('covers the whole day by default', () => {
    const { container } = mount({ view: 'day' })
    expect(cells(container)).toHaveLength(24)
  })

  it('is cropped by dayStart and dayEnd', () => {
    const { container } = mount({ view: 'day', dayStart: 9, dayEnd: 17 })
    const rows = cells(container) as HTMLElement[]
    expect(rows).toHaveLength(8)
    expect(rows[0]!.dataset.minutes).toBe('540')
    expect(rows.at(-1)!.dataset.minutes).toBe('960')
  })
})

describe('navigating', () => {
  it('steps a week back and forward', async () => {
    const { emitted, getByRole } = mount()
    await fireEvent.click(getByRole('button', { name: 'Next week' }))
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-06-17'])

    await fireEvent.click(getByRole('button', { name: 'Previous week' }))
    expect(emitted('update:date')?.at(-1)).toEqual([WEDNESDAY])
  })

  it('names the step after the view it is in', () => {
    const { getByRole } = mount({ view: 'day' })
    expect(getByRole('button', { name: 'Next day' })).toBeTruthy()
  })

  /*
   * The sharpest bug the layout can carry: a step of one CALENDAR day from a Friday in a
   * Monday-to-Friday calendar lands on an invisible Saturday, and the grid appears frozen.
   */
  it('steps over a hidden weekday rather than landing on it', async () => {
    const { emitted, getByRole } = mount({
      view: 'day',
      date: '2026-06-12',
      weekdays: [1, 2, 3, 4, 5],
    })
    await fireEvent.click(getByRole('button', { name: 'Next day' }))
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-06-15'])
  })

  it('comes back to the current day', async () => {
    const { emitted, getByRole } = mount({ date: '2020-01-01' })
    await fireEvent.click(getByRole('button', { name: 'Today' }))
    const written = emitted('update:date')?.at(-1) as string[]
    expect(written[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

/*
 * The menu panel is a closed `popover`, so its rows are hidden from the accessibility tree
 * and a plain role query cannot see them. `hidden: true` is what looks inside it — the
 * alternative, opening the panel, needs the top layer, which jsdom does not have.
 */
describe('the view menu', () => {
  it('offers the views it was given, marking the one in effect', () => {
    const { getAllByRole } = mount({ views: ['day', 'week', 'month'] })
    const items = getAllByRole('menuitem', { hidden: true })
    expect(items.map((item) => item.textContent?.trim())).toEqual(['Day', 'Week', 'Month'])
    expect(items[1]!.getAttribute('aria-current')).toBe('true')
  })

  it('changes the view when one is chosen', async () => {
    const { emitted, getAllByRole } = mount({ views: ['day', 'week'] })
    await fireEvent.click(getAllByRole('menuitem', { hidden: true })[0]!)
    expect(emitted('update:view')?.at(-1)).toEqual(['day'])
  })

  it('is left out entirely when only one view is offered', () => {
    const { queryAllByRole } = mount({ views: ['week'] })
    expect(queryAllByRole('menuitem', { hidden: true })).toHaveLength(0)
  })

  it('names the custom view by its own length', () => {
    const { getAllByRole } = mount({
      views: ['week', 'custom'],
      view: 'custom',
      customDays: 3,
    })
    const items = getAllByRole('menuitem', { hidden: true })
    expect(items.map((item) => item.textContent?.trim())).toEqual(['Week', '3 days'])
  })
})

describe('the events', () => {
  /*
   * The default locale is `en-US`, whose clock is a twelve-hour one — so the times a card
   * announces are "9:00 AM", not the canonical "09:00" the model holds. That difference is
   * the point of the assertion: what a reader hears is written for them, and what the
   * v-model carries is not.
   */
  it('draws a card for a timed event, named by its title and its times', () => {
    const { getByRole } = mount({ events: [event({ id: 'a', title: 'Standup' })] })
    expect(getByRole('button', { name: 'Standup, 9:00 AM – 10:00 AM' })).toBeTruthy()
  })

  it('writes those times on the clock the locale uses', () => {
    const { getByRole } = mount({
      format: '24h',
      events: [event({ id: 'a', title: 'Standup' })],
    })
    expect(getByRole('button', { name: 'Standup, 09:00 – 10:00' })).toBeTruthy()
  })

  /*
   * The card texts are memoized. A cache that outlived the clock format it was filled under
   * would keep announcing "9:00 AM" after the calendar had switched to a 24-hour clock, since
   * a cache hit reads no prop and so tracks none.
   */
  it.each(['week', 'month'])(
    'rewrites the times of a %s view when the clock format changes',
    async (view) => {
      const { getByRole, rerender } = mount({
        view,
        views: [view],
        events: [event({ id: 'a', title: 'Standup' })],
      })
      expect(getByRole('button', { name: /^Standup, 9:00 AM/ })).toBeTruthy()
      await rerender({ format: '24h' })
      expect(getByRole('button', { name: /^Standup, 09:00/ })).toBeTruthy()
    },
  )

  it('says what an event IS, rather than letting it be announced as a button', () => {
    const { getByRole } = mount({ events: [event({ id: 'a', title: 'Standup' })] })
    const card = getByRole('button', { name: /Standup/ })
    expect(card.getAttribute('aria-roledescription')).toBe('event')
  })

  it('appends a time zone as an annotation, and only as one', () => {
    const { getByRole, container } = mount({
      format: '24h',
      events: [event({ id: 'a', title: 'Sync', timezone: 'Europe/Paris' })],
    })
    expect(getByRole('button', { name: 'Sync, 09:00 – 10:00 (Europe/Paris)' })).toBeTruthy()
    // The card still sits in the column of the day it names: the zone moved nothing.
    const card = container.querySelector('.v-calendar-event')!
    expect(card.closest('.v-calendar-cell')).toHaveProperty('dataset.iso', WEDNESDAY)
  })

  it('puts an all-day event in the band and not in a day column', () => {
    const { container } = mount({ events: [event({ id: 'a', allDay: true })] })
    const card = container.querySelector('.v-calendar-event')!
    expect(card.closest('.v-calendar-allday')).not.toBeNull()
    expect(card.closest('.v-calendar-cell')).toBeNull()
  })

  it('leaves an event out when its day is not on show', () => {
    const { container } = mount({
      weekdays: [1, 2, 3, 4, 5],
      events: [event({ id: 'a', start: '2026-06-13', end: '2026-06-13' })],
    })
    expect(container.querySelector('.v-calendar-event')).toBeNull()
  })

  it('takes a colour from the consumer without painting the title on it', () => {
    const { container } = mount({ events: [event({ id: 'a', color: '#c0ffee' })] })
    const card = container.querySelector('.v-calendar-event') as HTMLElement
    expect(card.dataset.custom).toBe('')
    expect(card.style.getPropertyValue('--calendar-event-color')).toBe('#c0ffee')
  })

  it('derives a hue when no colour is given', () => {
    const { container } = mount({ events: [event({ id: 'a' })] })
    const card = container.querySelector('.v-calendar-event') as HTMLElement
    expect(card.dataset.custom).toBeUndefined()
    expect(card.style.getPropertyValue('--vectis-calendar-event-hue')).toMatch(/^\d+$/)
  })

  /*
   * A card is placed absolutely, but it is a CHILD of the cell its start falls in. In an
   * overlay layer it would sit outside the `role="grid"` altogether, which breaks the
   * reading order and fails axe's `aria-required-children` as soon as anything moves it
   * back. Nothing about that is observable in a stylesheet, so it is pinned here.
   */
  it('puts a card inside the cell of the hour it starts in', () => {
    const { container } = mount({
      events: [event({ id: 'a', startTime: '14:30', endTime: '15:30' })],
    })
    const cell = container.querySelector('.v-calendar-event')!.closest('.v-calendar-cell')
    expect(cell).toHaveProperty('dataset.minutes', '840')
  })

  /*
   * The card is a container query's container, and an element cannot be styled by its own
   * query — so the layout that has to change when a card gets short lives on this wrapper.
   * Flattening it would leave a quarter-hour event showing nothing at all, with no error
   * anywhere: the query would still match and have nothing to act on.
   */
  it('wraps a card content in the box its own stylesheet measures', () => {
    const { container } = mount({ events: [event({ id: 'a', title: 'Standup' })] })
    const body = container.querySelector('.v-calendar-event > .v-calendar-event-body')
    expect(body).not.toBeNull()
    expect(body!.querySelector('.v-calendar-event-title')!.textContent).toBe('Standup')
  })

  it('keeps the resize strip a sibling of that box, not a child of it', () => {
    const { container } = mount({ view: 'day', events: [event({ id: 'a' })] })
    // The strip is placed against the CARD, so moving it inside the body would put it
    // against a box whose padding it is meant to ignore.
    expect(container.querySelector('.v-calendar-event > [data-calendar-handle]')).not.toBeNull()
  })

  it('reports a card being activated', async () => {
    const { emitted, getByRole } = mount({ events: [event({ id: 'a', title: 'Standup' })] })
    await fireEvent.click(getByRole('button', { name: /Standup/ }))
    expect((emitted('event-activate')?.at(-1) as CalendarEvent[])[0]!.id).toBe('a')
  })
})

describe('the keyboard', () => {
  it('leaves a key held with Alt, Ctrl or Meta to the browser', async () => {
    for (const view of ['week', 'month']) {
      const { container, unmount } = mount({ view, views: ['week', 'month', 'day'] })
      const cell = container.querySelector('.v-calendar-cell[tabindex="0"]')!
      for (const init of [{ altKey: true }, { ctrlKey: true }, { metaKey: true }]) {
        const key = new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          bubbles: true,
          cancelable: true,
          ...init,
        })
        cell.dispatchEvent(key)
        expect(key.defaultPrevented).toBe(false)
      }
      unmount()
    }
  })

  /*
   * A scrolling region has to hold something reachable by Tab — `tabindex="-1"` does not
   * count for axe's `scrollable-region-focusable`. So exactly one cell must always be
   * tabbable, including on an empty calendar and straight after a view change.
   */
  it('always keeps exactly one cell in the tab order', () => {
    const { container } = mount()
    expect(container.querySelectorAll('.v-calendar-cell[tabindex="0"]')).toHaveLength(1)
  })

  it('keeps one even when the focused day falls outside the view', async () => {
    const { container, rerender } = mount({ view: 'day' })
    await rerender({ date: '2026-09-01' })
    expect(container.querySelectorAll('.v-calendar-cell[tabindex="0"]')).toHaveLength(1)
  })

  it('moves the tab stop sideways and down', async () => {
    const { container } = mount()
    const first = container.querySelector('.v-calendar-cell[tabindex="0"]') as HTMLElement
    await fireEvent.keyDown(first, { key: 'ArrowRight' })
    const next = container.querySelector('.v-calendar-cell[tabindex="0"]') as HTMLElement
    expect(next.dataset.iso).not.toBe(first.dataset.iso)

    await fireEvent.keyDown(next, { key: 'ArrowDown' })
    const below = container.querySelector('.v-calendar-cell[tabindex="0"]') as HTMLElement
    expect(Number(below.dataset.minutes)).toBe(Number(next.dataset.minutes) + 60)
  })

  it('holds the tab stop at the edges rather than wrapping round', async () => {
    const { container } = mount({ view: 'day' })
    const first = container.querySelector('.v-calendar-cell[tabindex="0"]') as HTMLElement
    await fireEvent.keyDown(first, { key: 'ArrowUp' })
    expect(container.querySelector('.v-calendar-cell[tabindex="0"]')).toHaveProperty(
      'dataset.minutes',
      '0',
    )
  })

  it('jumps to the ends of the row', async () => {
    const { container } = mount()
    const first = container.querySelector('.v-calendar-cell[tabindex="0"]') as HTMLElement
    await fireEvent.keyDown(first, { key: 'End' })
    const last = container.querySelector('.v-calendar-cell[tabindex="0"]') as HTMLElement
    expect(last.dataset.iso).toBe('2026-06-13')
  })

  it('turns the page with PageUp and PageDown', async () => {
    const { container, emitted } = mount()
    const first = container.querySelector('.v-calendar-cell[tabindex="0"]') as HTMLElement
    await fireEvent.keyDown(first, { key: 'PageDown' })
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-06-17'])
  })

  it('reports an empty slot being activated, at the hour it names', async () => {
    const { container, emitted } = mount({ view: 'day', dayStart: 9, dayEnd: 17 })
    const first = container.querySelector('.v-calendar-cell[tabindex="0"]') as HTMLElement
    await fireEvent.keyDown(first, { key: 'Enter' })
    expect(emitted('cell-activate')?.at(-1)).toEqual([{ date: WEDNESDAY, time: '09:00' }])
  })

  /*
   * A card is a button with a keyboard of its own. If the grid answered keys aimed at one,
   * arriving at an event would be the same keystroke as acting on it.
   */
  it('reports no slot when the calendar is disabled', async () => {
    const { container, emitted } = mount({ view: 'day', disabled: true })
    const first = container.querySelector('.v-calendar-cell[tabindex="0"]') as HTMLElement
    await fireEvent.keyDown(first, { key: 'Enter' })
    await fireEvent.click(first)
    expect(emitted('cell-activate')).toBeUndefined()
    expect(emitted('event-create')).toBeUndefined()
  })

  it('leaves keys aimed at a card entirely alone', async () => {
    const { container, emitted } = mount({ events: [event({ id: 'a' })] })
    const card = container.querySelector('.v-calendar-event') as HTMLElement
    await fireEvent.keyDown(card, { key: 'ArrowRight' })
    expect(emitted('update:date')).toBeUndefined()
  })
})

describe('the all-day band', () => {
  it('is left out entirely when nothing needs it', () => {
    const { container } = mount({ events: [event({ id: 'a' })] })
    expect(container.querySelector('.v-calendar-allday')).toBeNull()
  })

  // The default week here starts on a SUNDAY — `en-US` is the default locale — so the
  // Tuesday the bar begins on is the third column, not the second.
  it('stretches a bar over the days an event covers', () => {
    const { container } = mount({
      events: [event({ id: 'a', start: '2026-06-09', end: '2026-06-11' })],
    })
    const bar = container.querySelector('.v-calendar-bar') as HTMLElement
    expect(bar.style.getPropertyValue('--calendar-day-index')).toBe('2')
    expect(bar.style.getPropertyValue('--calendar-bar-span')).toBe('3')
  })

  it('stacks two overlapping bars onto separate rows', () => {
    const { container } = mount({
      events: [
        event({ id: 'a', start: MONDAY, end: '2026-06-10' }),
        event({ id: 'b', start: '2026-06-09', end: '2026-06-12' }),
      ],
    })
    const lanes = [...container.querySelectorAll('.v-calendar-bar')].map((bar) =>
      (bar as HTMLElement).style.getPropertyValue('--calendar-bar-lane'),
    )
    expect(new Set(lanes).size).toBe(2)
  })

  it('is a named group, so the bars are not loose in the header', () => {
    const { getByRole } = mount({ events: [event({ id: 'a', allDay: true })] })
    expect(getByRole('group', { name: 'All day' })).toBeTruthy()
  })
})

/*
 * Today and the clock are read in `onMounted` only, so on the server both are null and every
 * rule that draws them has to expect it. That is why the line is absent here: jsdom mounts,
 * but the reference date is 2026 and the clock says otherwise.
 */
describe('the current-time line', () => {
  it('stays away from a week that does not contain today', () => {
    const { container } = mount()
    expect(container.querySelector('.v-calendar-now')).toBeNull()
  })

  it('is drawn on today, inside a cell rather than loose in the grid', async () => {
    const iso = new Date()
    const todayISO = `${iso.getFullYear()}-${String(iso.getMonth() + 1).padStart(2, '0')}-${String(iso.getDate()).padStart(2, '0')}`
    const { container } = mount({ view: 'day', date: todayISO })
    await nextTick()
    const line = container.querySelector('.v-calendar-now')
    expect(line).not.toBeNull()
    // A `grid` owns only rows and a row only cells: an extra box at either level would fail
    // axe's `aria-required-children`.
    expect(line!.closest('.v-calendar-cell')).not.toBeNull()
  })

  it('is not drawn at all when it was turned off', async () => {
    const iso = new Date()
    const todayISO = `${iso.getFullYear()}-${String(iso.getMonth() + 1).padStart(2, '0')}-${String(iso.getDate()).padStart(2, '0')}`
    const { container } = mount({ view: 'day', date: todayISO, hideCurrentTime: true })
    await nextTick()
    expect(container.querySelector('.v-calendar-now')).toBeNull()
  })

  // A settings switch may turn it on after mount; the clock read at mount alone never started.
  it('appears when it is turned on after the calendar mounted', async () => {
    const iso = new Date()
    const todayISO = `${iso.getFullYear()}-${String(iso.getMonth() + 1).padStart(2, '0')}-${String(iso.getDate()).padStart(2, '0')}`
    const { container, rerender } = mount({ view: 'day', date: todayISO, hideCurrentTime: true })
    await nextTick()
    await rerender({ hideCurrentTime: false })
    await nextTick()
    expect(container.querySelector('.v-calendar-now')).not.toBeNull()
  })

  /*
   * `scrollTime` was applied once, in `onMounted`: a calendar opened on its month and switched
   * to a week then opened at midnight, the working day off screen.
   */
  it('scrolls a time grid that appears later to the scroll time', async () => {
    const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(2400)
    try {
      const { container, rerender } = mount({
        view: 'month',
        views: ['month', 'week'],
        scrollTime: '08:00',
      })
      await nextTick()
      await rerender({ view: 'week' })
      await nextTick()
      const grid = container.querySelector('.v-calendar-time-grid') as HTMLElement
      expect(grid.scrollTop).toBeGreaterThan(0)
    } finally {
      height.mockRestore()
    }
  })
})

describe('the month view', () => {
  const month = (props: Record<string, unknown> = {}) =>
    mount({ view: 'month', views: ['month', 'day'], ...props })

  it('keeps six rows so the grid never changes height', () => {
    const { container } = month()
    expect(container.querySelectorAll('.v-calendar-month-week')).toHaveLength(6)
  })

  it('narrows every row to the visible weekdays', () => {
    const { container } = month({ weekdays: [1, 2, 3, 4, 5] })
    const rows = [...container.querySelectorAll('.v-calendar-month-week')]
    expect(rows.every((row) => row.children.length === 5)).toBe(true)
  })

  it('marks the days belonging to the neighbouring months', () => {
    const { container } = month()
    expect(
      container.querySelectorAll('.v-calendar-month-cell[data-adjacent]').length,
    ).toBeGreaterThan(0)
  })

  it('shows a day events, then counts whatever is left over', () => {
    const { container, getByText } = month({
      events: [1, 2, 3, 4, 5].map((n) =>
        event({ id: `e${n}`, startTime: `0${n + 4}:00`, endTime: `0${n + 5}:00` }),
      ),
      monthEventLimit: 3,
    })
    const cell = container.querySelector(`.v-calendar-month-cell[data-iso="${WEDNESDAY}"]`)!
    expect(cell.querySelectorAll('.v-calendar-event')).toHaveLength(3)
    expect(getByText('+2 more')).toBeTruthy()
  })

  // A limit below zero shows no chip rather than inventing hidden ones on every empty square.
  it('reads a negative event limit as zero', () => {
    const { container } = month({ events: [event({ id: 'one' })], monthEventLimit: -1 })
    expect(container.querySelectorAll('.v-calendar-month-more')).toHaveLength(1)
    expect(container.querySelector('.v-calendar-month-more')?.textContent?.trim()).toBe('+1 more')
  })

  /*
   * A day OTHER than the anchor, deliberately: writing the value a model already holds
   * emits nothing, so choosing the 10th here would prove only that Vue deduplicates.
   */
  it('opens a day when its number is chosen, and switches to the day view', async () => {
    const { container, emitted } = month()
    const cell = container.querySelector('.v-calendar-month-cell[data-iso="2026-06-15"]')!
    await fireEvent.click(cell.querySelector('.v-calendar-month-day')!)
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-06-15'])
    expect(emitted('update:view')?.at(-1)).toEqual(['day'])
  })

  /*
   * The number and the "+N more" line take no tab stop, so the keyboard needs a key of its own
   * to open the focused day: Enter already reports the cell, the way to a new event.
   */
  it('opens the focused day on Shift and Enter', async () => {
    const { container, emitted } = month()
    const cell = container.querySelector('.v-calendar-month-cell[data-iso="2026-06-15"]')!
    expect(cell.getAttribute('aria-keyshortcuts')).toBe('Shift+Enter')
    await fireEvent.keyDown(cell, { key: 'Enter', shiftKey: true })
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-06-15'])
    expect(emitted('update:view')?.at(-1)).toEqual(['day'])
    expect(emitted('cell-activate')).toBeUndefined()
  })

  /*
   * A consumer who narrowed `views` has said what their calendar is for. Jumping it into a
   * view they deliberately left out would be the component overruling them.
   */
  it('moves the date but keeps the view when the day view was not offered', async () => {
    const { container, emitted } = mount({ view: 'month', views: ['month', 'week'] })
    const cell = container.querySelector('.v-calendar-month-cell[data-iso="2026-06-15"]')!
    await fireEvent.click(cell.querySelector('.v-calendar-month-day')!)
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-06-15'])
    expect(emitted('update:view')).toBeUndefined()
  })

  it('steps a month at a time', async () => {
    const { emitted, getByRole } = month()
    await fireEvent.click(getByRole('button', { name: 'Next month' }))
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-07-10'])
  })

  it('travels a week at a time with the vertical arrows', async () => {
    const { container } = month()
    const first = container.querySelector('.v-calendar-month-cell[tabindex="0"]') as HTMLElement
    const before = first.dataset.iso!
    await fireEvent.keyDown(first, { key: 'ArrowDown' })
    const after = container.querySelector('.v-calendar-month-cell[tabindex="0"]') as HTMLElement
    // Seven calendar days later, whatever the columns: a row IS a week.
    expect(Date.parse(after.dataset.iso!) - Date.parse(before)).toBe(7 * 24 * 3600 * 1000)
  })

  it('always keeps exactly one cell in the tab order', () => {
    const { container } = month()
    expect(container.querySelectorAll('.v-calendar-month-cell[tabindex="0"]')).toHaveLength(1)
  })

  // A click on the empty part of a square reports it as Enter does, and a click on what the
  // square holds stays that element's own.
  it('reports a click on the empty part of a day, as Enter does', async () => {
    const { container, emitted } = month({ events: [event({ id: 'a' })] })
    const cell = container.querySelector<HTMLElement>(
      `.v-calendar-month-cell[data-iso="${WEDNESDAY}"]`,
    )!
    await fireEvent.click(cell)
    expect(emitted('cell-activate')).toEqual([[{ date: WEDNESDAY, time: '00:00' }]])

    await fireEvent.keyDown(cell, { key: 'Enter' })
    expect(emitted('cell-activate')?.at(-1)).toEqual([{ date: WEDNESDAY, time: '00:00' }])

    await fireEvent.click(cell.querySelector('.v-calendar-event')!)
    await fireEvent.click(cell.querySelector('.v-calendar-month-day')!)
    expect(emitted('cell-activate')).toHaveLength(2)
  })

  /*
   * A frozen calendar keeps its tab stop so the agenda stays readable, and a click is stopped
   * only by the stylesheet, which jsdom does not apply — so both routes reach the handler here
   * exactly as Enter does in a browser, and the calendar has to refuse them itself.
   */
  it('reports nothing about a day when the calendar is disabled', async () => {
    const { container, emitted } = month({ disabled: true })
    const cell = container.querySelector<HTMLElement>(
      `.v-calendar-month-cell[data-iso="${WEDNESDAY}"]`,
    )!
    await fireEvent.click(cell)
    await fireEvent.keyDown(cell, { key: 'Enter' })
    expect(emitted('cell-activate')).toBeUndefined()
  })
})

/*
 * jsdom measures every square as zero, so the geometry that turns a point into a day is
 * `layout.test.ts`'s business. What these pin is the WIRING, and the two rules that would
 * otherwise be silently wrong: a move must not squash a multi-day event, and letting go must
 * not also open what was just dragged.
 */
describe('dragging in the month view', () => {
  const month = (props: Record<string, unknown> = {}) =>
    mount({ view: 'month', views: ['month', 'day'], ...props })

  it('writes nothing until the pointer is let go', async () => {
    const { container, emitted } = month({ events: [event({ id: 'a' })] })
    const chip = container.querySelector('.v-calendar-event')!
    pointer(chip, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(chip, 'pointermove', { clientX: 300, clientY: 200 })
    await nextTick()
    expect(emitted('update:events')).toBeUndefined()
  })

  it('reports a move once, on release', async () => {
    const { container, emitted } = month({ events: [event({ id: 'a' })] })
    layOut(container, '.v-calendar-month-grid')
    const chip = container.querySelector('.v-calendar-event')!
    pointer(chip, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(chip, 'pointermove', { clientX: 300, clientY: 200 })
    pointer(chip, 'pointerup', { clientX: 300, clientY: 200 })
    await nextTick()
    expect(emitted('event-move')).toHaveLength(1)
    expect(emitted('update:events')).toHaveLength(1)
  })

  it('keeps a multi-day event as long as it was', async () => {
    const { container, emitted } = month({
      events: [event({ id: 'a', start: '2026-06-09', end: '2026-06-11' })],
    })
    layOut(container, '.v-calendar-month-grid')
    const chip = container.querySelector('.v-calendar-event')!
    pointer(chip, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(chip, 'pointermove', { clientX: 300, clientY: 200 })
    pointer(chip, 'pointerup', { clientX: 300, clientY: 200 })
    await nextTick()
    const [moved] = emitted('event-move')!.at(-1) as CalendarEvent[]
    expect(daySpan(moved!)).toBe(2)
  })

  it('treats a press that never travelled as a click', async () => {
    const { container, emitted } = month({ events: [event({ id: 'a' })] })
    const chip = container.querySelector('.v-calendar-event')!
    pointer(chip, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(chip, 'pointerup', { clientX: 100, clientY: 100 })
    await fireEvent.click(container.querySelector('.v-calendar-event')!)
    expect(emitted('event-move')).toBeUndefined()
    expect(emitted('event-activate')).toHaveLength(1)
  })

  it('does not open the event that has just been dropped', async () => {
    const { container, emitted } = month({ events: [event({ id: 'a' })] })
    const chip = container.querySelector('.v-calendar-event')!
    pointer(chip, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(chip, 'pointermove', { clientX: 300, clientY: 200 })
    pointer(chip, 'pointerup', { clientX: 300, clientY: 200 })
    await fireEvent.click(container.querySelector('.v-calendar-event')!)
    expect(emitted('event-activate')).toBeUndefined()
  })

  it('writes nothing when the gesture is taken away', async () => {
    const { container, emitted } = month({ events: [event({ id: 'a' })] })
    const chip = container.querySelector('.v-calendar-event')!
    pointer(chip, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(chip, 'pointermove', { clientX: 300, clientY: 200 })
    pointer(chip, 'pointercancel')
    await nextTick()
    expect(emitted('update:events')).toBeUndefined()
  })

  it('does nothing at all when the calendar is read-only', async () => {
    const { container, emitted } = month({ readonly: true, events: [event({ id: 'a' })] })
    const chip = container.querySelector('.v-calendar-event')!
    pointer(chip, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(chip, 'pointermove', { clientX: 300, clientY: 200 })
    pointer(chip, 'pointerup', { clientX: 300, clientY: 200 })
    await nextTick()
    expect(emitted('event-move')).toBeUndefined()
  })
})

/*
 * Every gesture the pointer offers has to be reachable without one (WCAG 2.1.1). The month
 * had no drag at all before, so this is the half that would most easily have been forgotten.
 */
describe('moving an event with the keyboard, in the month view', () => {
  const held = async (props: Record<string, unknown> = {}) => {
    const utils = mount({
      view: 'month',
      views: ['month', 'day'],
      events: [event({ id: 'a', title: 'Standup' })],
      ...props,
    })
    const chip = utils.container.querySelector('.v-calendar-event') as HTMLElement
    await fireEvent.keyDown(chip, { key: ' ' })
    return utils
  }

  it('takes hold on Space without also opening the event', async () => {
    const { container, emitted } = await held()
    expect(container.querySelector('[data-grabbed]')).not.toBeNull()
    expect(emitted('event-activate')).toBeUndefined()
    await nextTick()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('Event held')
  })

  it('moves a day sideways and a whole week vertically', async () => {
    const { container } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    // A row IS a week here, which is the month's own reading of the same key table: one press
    // of Down moves the 10th to the 17th, not to the 11th.
    await nextTick()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('June 17')
  })

  it('writes the model on Enter, once', async () => {
    const { container, emitted } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowRight' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Enter' })
    expect(emitted('event-move')).toHaveLength(1)
    expect(container.querySelector('[data-grabbed]')).toBeNull()
  })

  // A move that comes back to its own day moved nothing, and an undo stack must not gain it.
  it('writes nothing when the chip is put back on its own day', async () => {
    const { container, emitted } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowRight' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowLeft' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Enter' })
    expect(emitted('event-move')).toBeUndefined()
    expect(emitted('update:events')).toBeUndefined()
  })

  it('puts the event back on Escape, writing nothing', async () => {
    const { container, emitted } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowRight' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Escape' })
    expect(emitted('event-move')).toBeUndefined()
    await nextTick()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('cancelled')
  })

  /** The chip is moved between two days, so it too has to take the focus along. */
  it('carries the focus with the chip it moves', async () => {
    const { container } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowRight' })
    await nextTick()
    expect(document.activeElement).toBe(container.querySelector('[data-event-id="a"]'))
  })
})

describe('the year view', () => {
  const year = (props: Record<string, unknown> = {}) =>
    mount({ view: 'year', views: ['year', 'month'], ...props })

  it('lays out the twelve months', () => {
    const { container } = year()
    expect(container.querySelectorAll('.v-calendar-year-month')).toHaveLength(12)
  })

  it('names the year alone in the toolbar', () => {
    const { getByText } = year()
    expect(getByText('2026')).toBeTruthy()
  })

  /*
   * The days here are text, not controls: three hundred and sixty-five tab stops for a view
   * meant to be glanced at would be worse than useless. The month is what you can reach, and
   * its name carries the count so the marks below stay safe to hide.
   */
  it('carries how many days of a month have something on them, in its name', () => {
    const { getByRole } = year({
      events: [event({ id: 'a' }), event({ id: 'b', start: MONDAY, end: MONDAY })],
    })
    expect(getByRole('button', { name: /June\s*2/ })).toBeTruthy()
  })

  // The sheet reads the column count from this variable: a literal 7 wrapped every five-day
  // row onto the next line. The `Year` play function checks the sheet consumes it.
  // Only the year on show is walked: a trip from last December marks its January days alone.
  it('marks only the days of the year on show', () => {
    const { getByRole } = year({
      events: [
        event({ id: 'old', start: '2025-03-02', end: '2025-03-04', allDay: true }),
        event({ id: 'trip', start: '2025-12-30', end: '2026-01-02', allDay: true }),
      ],
    })
    expect(getByRole('button', { name: /^January\s*2$/ })).toBeTruthy()
    expect(getByRole('button', { name: /^March$/ })).toBeTruthy()
  })

  it('gives each mini-month as many columns as weekdays on show', () => {
    const { container } = year({ weekdays: [1, 2, 3, 4, 5] })
    const grid = container.querySelector<HTMLElement>('.v-calendar-year-grid')!
    expect(grid.style.getPropertyValue('--calendar-columns')).toBe('5')
  })

  it('opens a month when its name is chosen', async () => {
    const { emitted, getByRole } = year()
    await fireEvent.click(getByRole('button', { name: /^March/ }))
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-03-01'])
    expect(emitted('update:view')?.at(-1)).toEqual(['month'])
  })

  it('steps a year at a time', async () => {
    const { emitted, getByRole } = year()
    await fireEvent.click(getByRole('button', { name: 'Next year' }))
    expect(emitted('update:date')?.at(-1)).toEqual(['2027-06-10'])
  })
})

/*
 * The pointer gestures, driven by synthetic PointerEvents.
 *
 * jsdom lays NOTHING out, so `getBoundingClientRect` answers zero for everything and the
 * geometry cannot be exercised here at all — that is what `layout.test.ts` is for, over
 * plain numbers. What these tests pin is the WIRING: which press starts which gesture,
 * whether the model is written once and only on release, and that a cancel writes nothing.
 * The gestures as a reader experiences them are covered by the play functions.
 */
function pointer(el: Element, type: string, init: PointerEventInit = {}) {
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 1, button: 0, ...init }))
}

describe('dragging an event', () => {
  /*
   * Laid out, so a drag really lands somewhere else: a release where the event began writes
   * nothing, and jsdom measures every box at zero, where every drag ends where it began.
   */
  const drag = (props: Record<string, unknown> = {}) => {
    const utils = mount({
      view: 'day',
      dayStart: 8,
      dayEnd: 18,
      events: [event({ id: 'a' })],
      ...props,
    })
    layOut(utils.container, '.v-calendar-columns')
    layOut(utils.container, '.v-calendar-time-grid')
    return utils
  }

  it('writes nothing until the pointer is let go', async () => {
    const { container, emitted } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 200 })
    await nextTick()
    expect(emitted('update:events')).toBeUndefined()
    expect(emitted('event-move')).toBeUndefined()
  })

  it('marks the card as being dragged, so the grid can lift it', async () => {
    const { container } = drag()
    const card = container.querySelector('.v-calendar-event') as HTMLElement
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 200 })
    await nextTick()
    // The event itself, not the echo it leaves at its old place.
    const moved = container.querySelector('.v-calendar-event:not([data-ghost])')!
    expect(moved.getAttribute('data-dragging')).toBe('')
  })

  /*
   * After a captured release the browser sends its click to the CAPTURE element, never to the
   * card, so the flag that swallows that click stays up. The next click a card receives may be
   * the keyboard's, with no press before it to clear the flag: pressing Enter on an event after
   * dragging one opened nothing.
   */
  it('still opens an event from the keyboard after a drag', async () => {
    const { container, emitted } = drag()
    const card = container.querySelector('.v-calendar-event') as HTMLElement
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    const moved = container.querySelector('.v-calendar-event') as HTMLElement
    await fireEvent.keyDown(moved, { key: 'Enter' })
    await fireEvent.click(moved)
    expect(emitted('event-activate')).toHaveLength(1)
  })

  // A second finger panning must not take the first one's drag away.
  it('ignores the cancel of another pointer', async () => {
    const { container, emitted } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointercancel', { pointerId: 2 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(emitted('event-move')).toHaveLength(1)
  })

  it('writes the model exactly once, on release', async () => {
    const { container, emitted } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 200 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(emitted('update:events')).toHaveLength(1)
    expect(emitted('event-move')).toHaveLength(1)
  })

  it('carries where the event came from, so a move can be undone', async () => {
    const { container, emitted } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    const [, previous] = emitted('event-move')!.at(-1) as [CalendarEvent, CalendarEvent]
    expect(previous).toEqual({
      start: WEDNESDAY,
      end: WEDNESDAY,
      startTime: '09:00',
      endTime: '10:00',
    })
  })

  /*
   * The gesture was taken away — a system gesture, a context menu, the page starting to
   * scroll. Nothing may be written: the card goes back to where the model still says it is.
   */
  it('writes nothing when the gesture is taken away', async () => {
    const { container, emitted } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointercancel')
    await nextTick()
    expect(emitted('update:events')).toBeUndefined()
    expect(container.querySelector('[data-dragging]')).toBeNull()
  })

  /*
   * Without the threshold the hand's tremor during a click would register as a drag, and
   * every click would silently move its event.
   */
  it('treats a press that never travelled as a click, not a drag', async () => {
    const { container, emitted } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 101, clientY: 101 })
    pointer(card, 'pointerup', { clientX: 101, clientY: 101 })
    await nextTick()
    expect(emitted('event-move')).toBeUndefined()
  })

  /*
   * pointerup fires before click. Without the guard, letting go at the end of a drag would
   * ALSO open the event — the consumer's editor over every card the reader had just moved.
   */
  it('does not open the event that has just been dropped', async () => {
    const { container, emitted } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 300 })
    await fireEvent.click(container.querySelector('.v-calendar-event')!)
    expect(emitted('event-activate')).toBeUndefined()
  })

  it('still opens an event that was only clicked', async () => {
    const { container, emitted } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 100 })
    await fireEvent.click(container.querySelector('.v-calendar-event')!)
    expect(emitted('event-activate')).toHaveLength(1)
  })

  /*
   * A browser sends the click after a captured release to the CAPTURE element, so a press
   * captured at once would never reach the card it landed on. Nothing short of real input
   * retargets it, jsdom and a synthetic event alike, which is why this asks about the capture.
   */
  it('takes hold of the pointer only once the press travels', async () => {
    const { container } = drag()
    const root = container.querySelector('.v-calendar-time-grid') as HTMLElement
    const setPointerCapture = vi.fn()
    root.setPointerCapture = setPointerCapture
    const card = container.querySelector('.v-calendar-event')!

    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 101, clientY: 101 })
    expect(setPointerCapture).not.toHaveBeenCalled()

    pointer(card, 'pointermove', { clientX: 100, clientY: 200 })
    expect(setPointerCapture).toHaveBeenCalledOnce()
  })

  /*
   * A dragged card takes no pointer events, so marking one at the press would let the release
   * land on the cell beneath it, and the click that follows would report that cell.
   */
  it('does not mark a card that is only pressed as dragged', async () => {
    const { container } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    await nextTick()
    expect(container.querySelector('[data-dragging]')).toBeNull()
  })

  it('forgets a press that leaves the calendar before it travels', async () => {
    const { container, emitted } = drag()
    const root = container.querySelector('.v-calendar-time-grid')!
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(root, 'pointerleave', { clientX: 100, clientY: 100 })
    // The button is up by now, somewhere outside; the pointer coming back must carry nothing.
    pointer(root, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(root, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(container.querySelector('[data-dragging]')).toBeNull()
    expect(emitted('event-move')).toBeUndefined()
  })

  it('ignores anything but the left button', async () => {
    const { container, emitted } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100, button: 2 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(emitted('event-move')).toBeUndefined()
  })

  it('does nothing at all when it was told to be read-only', async () => {
    const { container, emitted } = drag({ readonly: true })
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(emitted('event-move')).toBeUndefined()
  })

  it('offers no resize strip when it is read-only', () => {
    const { container } = drag({ readonly: true })
    expect(container.querySelector('[data-calendar-handle]')).toBeNull()
  })

  /*
   * A button inside a button is invalid HTML and a blocking accessibility failure at once,
   * so the strip must never become one. Its keyboard equivalent lives on the card.
   */
  it('keeps the resize strip out of the accessibility tree entirely', () => {
    const { container } = drag()
    const handle = container.querySelector('[data-calendar-handle]')!
    expect(handle.getAttribute('aria-hidden')).toBe('true')
    expect(handle.tagName).toBe('SPAN')
    expect(handle.hasAttribute('tabindex')).toBe(false)
  })

  it('reports a stretch as a resize rather than a move', async () => {
    const { container, emitted } = drag()
    const handle = container.querySelector('[data-calendar-handle]')!
    pointer(handle, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(handle, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(handle, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(emitted('event-resize')).toHaveLength(1)
    expect(emitted('event-move')).toBeUndefined()
  })

  /*
   * The dragged card takes no pointer events, so the strip's own `ns-resize` is lost the instant
   * the press begins. The scroller names the gesture from the press to the release, which is what
   * the stylesheet holds the cursor on.
   */
  it('names a stretch on the scroller for as long as it lasts', async () => {
    const { container } = drag()
    const grid = container.querySelector('.v-calendar-time-grid')!
    const handle = container.querySelector('[data-calendar-handle]')!
    pointer(handle, 'pointerdown', { clientX: 100, clientY: 100 })
    await nextTick()
    expect(grid.getAttribute('data-gesture')).toBe('resize')
    pointer(grid, 'pointermove', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(grid.getAttribute('data-gesture')).toBe('resize')
    pointer(grid, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(grid.hasAttribute('data-gesture')).toBe(false)
  })

  it('names no gesture for a plain move, which keeps the cursor it had', async () => {
    const { container } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(container.querySelector('.v-calendar-time-grid')!.hasAttribute('data-gesture')).toBe(
      false,
    )
  })

  /*
   * A bar has no hours, so dragging it up and down means nothing — but it does move by whole
   * days along the band. jsdom measures every column as zero width, so what this pins is the
   * WIRING: that the band's press starts a gesture and that the release reports a move.
   */
  it('moves an all-day bar by whole days', async () => {
    const { container, emitted } = mount({
      view: 'week',
      events: [event({ id: 'a', allDay: true })],
    })
    layOut(container, '.v-calendar-columns')
    layOut(container, '.v-calendar-time-grid')
    const bar = container.querySelector('.v-calendar-bar')!
    pointer(bar, 'pointerdown', { clientX: 100, clientY: 20 })
    pointer(bar, 'pointermove', { clientX: 300, clientY: 20 })
    pointer(bar, 'pointerup', { clientX: 300, clientY: 20 })
    await nextTick()
    expect(emitted('event-move')).toHaveLength(1)
  })

  /*
   * The whole reason `moveEventToDay` exists beside `moveEvent`: the latter collapses `end`
   * onto `start`, so a three-day trip put through it would come back as one day.
   */
  it('keeps a multi-day bar as long as it was', async () => {
    const { container, emitted } = mount({
      view: 'week',
      events: [event({ id: 'a', start: '2026-06-09', end: '2026-06-11' })],
    })
    layOut(container, '.v-calendar-columns')
    layOut(container, '.v-calendar-time-grid')
    const bar = container.querySelector('.v-calendar-bar')!
    pointer(bar, 'pointerdown', { clientX: 100, clientY: 20 })
    pointer(bar, 'pointermove', { clientX: 300, clientY: 20 })
    pointer(bar, 'pointerup', { clientX: 300, clientY: 20 })
    await nextTick()
    const [moved] = emitted('event-move')!.at(-1) as CalendarEvent[]
    expect(daySpan(moved!)).toBe(2)
  })

  it('leaves a bar alone when the calendar is read-only', async () => {
    const { container, emitted } = mount({
      view: 'week',
      readonly: true,
      events: [event({ id: 'a', allDay: true })],
    })
    layOut(container, '.v-calendar-columns')
    layOut(container, '.v-calendar-time-grid')
    const bar = container.querySelector('.v-calendar-bar')!
    pointer(bar, 'pointerdown', { clientX: 100, clientY: 20 })
    pointer(bar, 'pointermove', { clientX: 300, clientY: 20 })
    pointer(bar, 'pointerup', { clientX: 300, clientY: 20 })
    await nextTick()
    expect(emitted('event-move')).toBeUndefined()
  })
})

/*
 * The faded copy left where a dragged event started, so the reader can see what they are
 * moving it from.
 */
describe('the echo left behind while dragging', () => {
  const start = (props: Record<string, unknown> = {}) => {
    const utils = mount({ view: 'day', dayStart: 8, dayEnd: 18, ...props })
    const card = utils.container.querySelector('.v-calendar-event') as HTMLElement
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    return { ...utils, card }
  }

  it('shows nothing until the drag has actually travelled', async () => {
    const { container } = start({ events: [event({ id: 'a' })] })
    await nextTick()
    expect(container.querySelector('[data-ghost]')).toBeNull()
  })

  it('leaves one copy behind once it has', async () => {
    const { container, card } = start({ events: [event({ id: 'a' })] })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(container.querySelectorAll('.v-calendar-event')).toHaveLength(2)
    expect(container.querySelectorAll('[data-ghost]')).toHaveLength(1)
  })

  /*
   * A colour is derived from an id, and the echo has to carry a DIFFERENT one so the layout
   * can tell the two apart — so without passing the original back the copy would come out a
   * different colour from the card it belongs to.
   */
  it('is the same colour as the card it belongs to', async () => {
    const { container, card } = start({ events: [event({ id: 'a' })] })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    await nextTick()
    const hues = [...container.querySelectorAll('.v-calendar-event')].map((el) =>
      (el as HTMLElement).style.getPropertyValue('--vectis-calendar-event-hue'),
    )
    expect(hues[0]).toBe(hues[1])
    expect(hues[0]).not.toBe('')
  })

  /*
   * It is a duplicate of an event already announced, and a focusable copy inside a hidden
   * subtree is an accessibility failure of its own. `inert` settles the tree, the focus and
   * the pointer in one attribute.
   */
  it('is out of reach of the pointer, the keyboard and a screen reader', async () => {
    const { container, card } = start({ events: [event({ id: 'a' })] })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    await nextTick()
    const ghost = container.querySelector('[data-ghost]')!
    expect(ghost.hasAttribute('inert')).toBe(true)
    expect(ghost.getAttribute('aria-describedby')).toBeNull()
  })

  it('is gone once the event is dropped', async () => {
    const { container, card } = start({ events: [event({ id: 'a' })] })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(container.querySelector('[data-ghost]')).toBeNull()
  })

  it('is gone when the gesture is taken away', async () => {
    const { container, card } = start({ events: [event({ id: 'a' })] })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointercancel')
    await nextTick()
    expect(container.querySelector('[data-ghost]')).toBeNull()
  })

  it('leaves one behind in the month view too', async () => {
    const { container } = mount({ view: 'month', views: ['month'], events: [event({ id: 'a' })] })
    const chip = container.querySelector('.v-calendar-event')!
    pointer(chip, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(chip, 'pointermove', { clientX: 300, clientY: 300 })
    await nextTick()
    expect(container.querySelectorAll('[data-ghost]')).toHaveLength(1)
  })

  it('leaves one behind for an all-day bar as well', async () => {
    const { container } = mount({ view: 'week', events: [event({ id: 'a', allDay: true })] })
    layOut(container, '.v-calendar-columns')
    layOut(container, '.v-calendar-time-grid')
    const bar = container.querySelector('.v-calendar-bar')!
    pointer(bar, 'pointerdown', { clientX: 100, clientY: 20 })
    pointer(bar, 'pointermove', { clientX: 300, clientY: 20 })
    await nextTick()
    expect(container.querySelectorAll('[data-ghost]')).toHaveLength(1)
  })

  it('shows one while a card is held by the keyboard and moved', async () => {
    const { container } = mount({ view: 'day', events: [event({ id: 'a' })] })
    const card = container.querySelector('.v-calendar-event') as HTMLElement
    await fireEvent.keyDown(card, { key: ' ' })
    // Taking hold is not yet moving: nothing has been given up, so nothing to echo.
    expect(container.querySelector('[data-ghost]')).toBeNull()

    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    expect(container.querySelectorAll('[data-ghost]')).toHaveLength(1)
  })
})

describe('creating an event by taking up an empty slot', () => {
  // `creatable` is opt-in, so the whole block asks for it; the one test about its absence
  // spreads over it.
  const empty = (props: Record<string, unknown> = {}) =>
    mount({ view: 'day', dayStart: 9, dayEnd: 17, creatable: true, ...props })

  /*
   * The flag that stops a drag from also OPENING what it just moved is lowered by the click that
   * reads it — and that click only reaches a card's handler when it lands on one. Drawing a new
   * event starts on a CELL, so it does not: the flag stays raised.
   *
   * Usually the next press heals it, since its own `pointerup` overwrites the flag with its own
   * `moved`. That is what makes this narrow rather than constant — and it is exactly what stops
   * working when the press starts NO gesture, which is the case here: a calendar that lets events
   * be drawn but not moved. The reader then clicks an event to open it, nothing happens, they
   * click again and it works, with nothing on screen to connect it to the event they drew before.
   */
  it('does not swallow a later, deliberate click on a card', async () => {
    const { container, emitted } = mount({
      view: 'day',
      dayStart: 9,
      dayEnd: 17,
      readonly: true,
      events: [event({ id: 'a' })],
    })
    const cell = container.querySelector('.v-calendar-cell')!
    pointer(cell, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(cell, 'pointermove', { clientX: 100, clientY: 200 })
    pointer(cell, 'pointerup', { clientX: 100, clientY: 200 })
    await nextTick()
    // Where the browser really sends the click after that drag: the cell, never a card.
    await fireEvent.click(cell)
    await nextTick()

    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 100 })
    await fireEvent.click(card)
    expect(emitted('event-activate')).toHaveLength(1)
  })

  /*
   * The window is 9 to 17 over the 600 pixels `layOut` gives the columns, so an hour is 75
   * pixels: y = 75 is 10:00 and y = 160 is 11:08.
   */
  const drawn = (props: Record<string, unknown> = {}) => {
    const utils = empty(props)
    layOut(utils.container, '.v-calendar-columns')
    layOut(utils.container, '.v-calendar-time-grid')
    return { ...utils, cell: utils.container.querySelector('.v-calendar-cell')! }
  }

  it('reports the slot drawn out, and adds nothing to the model', async () => {
    const { container, cell, emitted } = drawn()
    pointer(cell, 'pointerdown', { clientX: 100, clientY: 75 })
    pointer(cell, 'pointermove', { clientX: 100, clientY: 160 })
    pointer(cell, 'pointerup', { clientX: 100, clientY: 160 })
    await fireEvent.click(cell)
    expect(emitted('event-create')).toEqual([
      [{ start: WEDNESDAY, end: WEDNESDAY, startTime: '10:00', endTime: '11:15' }],
    ])
    expect(emitted('update:events')).toBeUndefined()
    // The click the browser sends after the release ends the drag, and names no cell.
    expect(emitted('cell-activate')).toBeUndefined()
    expect(container.querySelector('[data-event-id="__vectis-calendar-draft__"]')).toBeNull()
  })

  it('draws upwards as well, keeping the slot pressed', async () => {
    const { cell, emitted } = drawn()
    pointer(cell, 'pointerdown', { clientX: 100, clientY: 150 })
    pointer(cell, 'pointermove', { clientX: 100, clientY: 80 })
    pointer(cell, 'pointerup', { clientX: 100, clientY: 80 })
    await nextTick()
    expect(emitted('event-create')).toEqual([
      [{ start: WEDNESDAY, end: WEDNESDAY, startTime: '10:00', endTime: '11:15' }],
    ])
  })

  // A default length is the consumer's decision, so a click makes nothing and reports its cell.
  it('makes nothing from a click, and reports the cell instead', async () => {
    const { cell, container, emitted } = drawn()
    pointer(cell, 'pointerdown', { clientX: 100, clientY: 10 })
    await nextTick()
    expect(container.querySelector('[data-event-id="__vectis-calendar-draft__"]')).toBeNull()
    pointer(cell, 'pointerup', { clientX: 100, clientY: 10 })
    await fireEvent.click(cell)
    expect(emitted('event-create')).toBeUndefined()
    expect(emitted('cell-activate')).toEqual([[{ date: WEDNESDAY, time: '09:00' }]])
  })

  it('shows the slot being drawn as an untitled card with its times', async () => {
    const { cell, container } = drawn()
    pointer(cell, 'pointerdown', { clientX: 100, clientY: 75 })
    pointer(cell, 'pointermove', { clientX: 100, clientY: 160 })
    await nextTick()
    const draft = container.querySelector('[data-event-id="__vectis-calendar-draft__"]')!
    expect(draft.textContent).toContain('(No title)')
    expect(draft.textContent).toContain('10:00 AM')
    pointer(cell, 'pointerup', { clientX: 100, clientY: 160 })
  })

  it('holds the move cursor on the scroller once the drawing travels', async () => {
    const { cell, container } = drawn()
    const grid = container.querySelector('.v-calendar-time-grid')!
    pointer(cell, 'pointerdown', { clientX: 100, clientY: 75 })
    await nextTick()
    expect(grid.hasAttribute('data-gesture')).toBe(false)
    pointer(grid, 'pointermove', { clientX: 100, clientY: 160 })
    await nextTick()
    expect(grid.getAttribute('data-gesture')).toBe('create')
    pointer(grid, 'pointerup', { clientX: 100, clientY: 160 })
    await nextTick()
    expect(grid.hasAttribute('data-gesture')).toBe(false)
  })

  /*
   * WCAG 2.1.1: the keyboard's route to a new event is the cell it reports, whose day and hour
   * open the consumer's form. Enter makes nothing on its own, as a click does not.
   */
  it('reports the cell on Enter and makes nothing', async () => {
    const { container, emitted } = empty({ slotDuration: 30 })
    const cell = container.querySelector('.v-calendar-cell[tabindex="0"]') as HTMLElement
    await fireEvent.keyDown(cell, { key: 'Enter' })
    expect(emitted('cell-activate')).toEqual([[{ date: WEDNESDAY, time: '09:00' }]])
    expect(emitted('event-create')).toBeUndefined()
    expect(emitted('update:events')).toBeUndefined()
    expect(container.querySelector('[role="status"]')!.textContent).toBe('')
  })

  it('still reports the cell when it was not told to create', async () => {
    const { container, emitted } = empty({ creatable: false })
    await fireEvent.click(container.querySelector('.v-calendar-cell')!)
    expect(emitted('event-create')).toBeUndefined()
    expect(emitted('update:events')).toBeUndefined()
    expect(emitted('cell-activate')).toEqual([[{ date: WEDNESDAY, time: '09:00' }]])
  })
})

describe('an event running past midnight', () => {
  // Tuesday 22:00 to Wednesday 02:00: four hours, so a card in each column rather than a bar.
  const overnight = event({
    id: 'late',
    start: '2026-06-09',
    end: WEDNESDAY,
    startTime: '22:00',
    endTime: '02:00',
  })

  /** The card drawn in a day's column, found by the day rather than by document order. */
  const cardOn = (container: Element, iso: string) =>
    container.querySelector(`.v-calendar-cell[data-iso="${iso}"] .v-calendar-block`)

  it('is drawn in both of its days, and not in the band', () => {
    const { container } = mount({ events: [overnight] })
    expect(container.querySelectorAll('.v-calendar-block')).toHaveLength(2)
    expect(
      cardOn(container, '2026-06-09')!.closest<HTMLElement>('.v-calendar-cell')!.dataset.minutes,
    ).toBe(String(22 * 60))
    expect(
      cardOn(container, WEDNESDAY)!.closest<HTMLElement>('.v-calendar-cell')!.dataset.minutes,
    ).toBe('0')
    expect(container.querySelector('.v-calendar-allday')).toBeNull()
  })

  // The strip drags the event's real end, which is on its second day.
  it('offers the resize strip on its morning card alone', () => {
    const { container } = mount({ events: [overnight] })
    expect(cardOn(container, '2026-06-09')!.querySelector('[data-calendar-handle]')).toBeNull()
    expect(cardOn(container, WEDNESDAY)!.querySelector('[data-calendar-handle]')).not.toBeNull()
  })

  it('goes to the band once it lasts a whole day', () => {
    const { container } = mount({ events: [{ ...overnight, endTime: '22:00' }] })
    expect(container.querySelector('.v-calendar-block')).toBeNull()
    expect(container.querySelector('.v-calendar-allday .v-calendar-event')).not.toBeNull()
  })

  /*
   * Taken by its morning card, the event is held from its start the evening before, so an hour
   * down moves it an hour whole: 22:00–02:00 to 23:00–03:00, the start staying on Tuesday.
   * Laid out at 700 by 600, a column is 100 pixels (Wednesday is the fourth of an en-US week)
   * and an hour 25.
   */
  it('moves as one when it is dragged by its morning card', async () => {
    const { container, emitted } = mount({ events: [overnight] })
    layOut(container, '.v-calendar-columns')
    layOut(container, '.v-calendar-time-grid')
    const morning = cardOn(container, WEDNESDAY)!
    pointer(morning, 'pointerdown', { clientX: 350, clientY: 25 })
    pointer(morning, 'pointermove', { clientX: 350, clientY: 50 })
    pointer(morning, 'pointerup', { clientX: 350, clientY: 50 })
    await nextTick()
    const [moved] = emitted('event-move')!.at(-1) as [CalendarEvent]
    expect(moved).toMatchObject({
      start: '2026-06-09',
      end: WEDNESDAY,
      startTime: '23:00',
      endTime: '03:00',
    })
  })

  it('keeps crossing midnight when it is nudged with the keyboard', async () => {
    const { container, emitted } = mount({ events: [overnight] })
    await fireEvent.keyDown(cardOn(container, '2026-06-09')!, { key: ' ' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Enter' })
    const [moved] = emitted('event-move')!.at(-1) as [CalendarEvent]
    expect(moved).toMatchObject({
      start: '2026-06-09',
      end: WEDNESDAY,
      startTime: '22:15',
      endTime: '02:15',
    })
  })
})

/*
 * Holding a drag against the side of the calendar to turn the page.
 *
 * The dwell is driven by real timers, so these use fake ones. What they pin is that the wait
 * exists at all — paging the instant the pointer touched the edge would make the last day of
 * a week unaimable — and that a gesture SURVIVES the view changing under it, which is the one
 * thing that would otherwise leave the card stranded on a day nobody can see.
 */
/*
 * jsdom lays nothing out, so every rect is zero — and a box with no width has no edges and no
 * inside, which is what `inlineEdgeAt` and `pointWithin` both correctly answer. Giving a box a
 * size is therefore not a convenience but the only way either behaviour can be exercised at all,
 * and it makes the tests stronger: they pin WHICH edge, and which side of the box.
 *
 * 700 by 600 at the origin, so a point at x = 900 is off the calendar and x = 690 is inside its
 * 48-wide end band.
 */
const layOut = (container: Element, selector: string) => {
  const el = container.querySelector(selector) as HTMLElement | null
  if (!el) return
  el.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: 700,
      bottom: 600,
      width: 700,
      height: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect
}

describe('paging by holding at an edge', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const dragging = (props: Record<string, unknown> = {}) => {
    const utils = mount({ view: 'week', events: [event({ id: 'a' })], ...props })
    layOut(utils.container, '.v-calendar-columns')
    layOut(utils.container, '.v-calendar-time-grid')
    const card = utils.container.querySelector('.v-calendar-event') as HTMLElement
    pointer(card, 'pointerdown', { clientX: 350, clientY: 300 })
    // 690 of 700 is inside the end band, which is 48 wide.
    pointer(card, 'pointermove', { clientX: 690, clientY: 300 })
    return utils
  }

  it('does not page the moment the drag reaches the edge', async () => {
    const { emitted } = dragging()
    vi.advanceTimersByTime(EDGE_STEP_DELAY - 100)
    await nextTick()
    expect(emitted('update:date')).toBeUndefined()
  })

  it('pages once the drag has rested there long enough, and the right way', async () => {
    const { emitted } = dragging()
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()
    // The end edge, so the week after the one it started on.
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-06-17'])
  })

  // Zero turns paging off, and a consumer may bind it to zero while the drag is held there.
  it('stops paging once the delay is turned off during the hold', async () => {
    const { emitted, rerender } = dragging()
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()
    await rerender({ edgeStepDelay: 0 })
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 4)
    await nextTick()
    expect(emitted('update:date')).toHaveLength(1)
  })

  it('pages backwards from the other edge', async () => {
    const { container, emitted } = mount({ view: 'week', events: [event({ id: 'a' })] })
    layOut(container, '.v-calendar-columns')
    layOut(container, '.v-calendar-time-grid')
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 350, clientY: 300 })
    pointer(card, 'pointermove', { clientX: 10, clientY: 300 })
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-06-03'])
  })

  it('leaves the middle of the grid alone', async () => {
    const { container, emitted } = mount({ view: 'week', events: [event({ id: 'a' })] })
    layOut(container, '.v-calendar-columns')
    layOut(container, '.v-calendar-time-grid')
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 350, clientY: 300 })
    pointer(card, 'pointermove', { clientX: 350, clientY: 300 })
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 6)
    await nextTick()
    expect(emitted('update:date')).toBeUndefined()
  })

  it('keeps paging while the drag stays against the edge', async () => {
    const { emitted } = dragging()
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 3)
    await nextTick()
    expect(emitted('update:date')).toHaveLength(3)
  })

  /*
   * Pushing PAST the side is how one asks the calendar to keep going, and a drag held out there
   * is also a drag that would be abandoned if it were let go. The two must not be confused: a
   * later tidy-up that stopped paging once the pointer had left would take away the very gesture
   * that crosses from one week into the next.
   */
  it('keeps paging while the drag is held right off the calendar', async () => {
    const { container, emitted } = mount({ view: 'week', events: [event({ id: 'a' })] })
    layOut(container, '.v-calendar-columns')
    layOut(container, '.v-calendar-time-grid')
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 350, clientY: 300 })
    pointer(card, 'pointermove', { clientX: 900, clientY: 300 })
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-06-17'])
  })

  it('stops paging the moment the drag is let go', async () => {
    const { container, emitted } = dragging()
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    pointer(container.querySelector('.v-calendar-event')!, 'pointerup', {
      clientX: 690,
      clientY: 300,
    })
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 6)
    await nextTick()
    expect(emitted('update:date')).toHaveLength(1)
  })

  it('stops paging when the gesture is taken away', async () => {
    const { container } = dragging()
    pointer(container.querySelector('.v-calendar-event')!, 'pointercancel')
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 6)
    await nextTick()
    expect(container.querySelector('[data-edge]')).toBeNull()
  })

  it('never pages at all when the delay is zero', async () => {
    const { emitted } = dragging({ edgeStepDelay: 0 })
    vi.advanceTimersByTime(EDGE_STEP_DELAY * 6)
    await nextTick()
    expect(emitted('update:date')).toBeUndefined()
  })

  it('shows which edge is counting down, so the paging is not a surprise', async () => {
    const { container } = dragging()
    await nextTick()
    expect(container.querySelector('.v-calendar-columns')!.getAttribute('data-edge')).toBe('end')
  })

  /*
   * The whole reason the gesture keeps the last pointer position. Paging swaps the days out
   * from under a hand that is holding still, so without re-applying that position the card
   * would stay on a day that is no longer on screen — and simply vanish.
   */
  it('keeps the card on screen after the view has turned under it', async () => {
    const { container, rerender } = dragging()
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()
    // The parent is controlled here, so the new week is applied by hand — which is exactly
    // what a real consumer's v-model does a tick later.
    await rerender({ date: '2026-06-03' })
    expect(container.querySelector('.v-calendar-event')).not.toBeNull()
  })

  /*
   * The other half, and the fragile one. The echo belongs to a DATE, but the boxes it is
   * drawn from are described by INDEX into the days on show, so once the view has turned that
   * index names a different day. Frozen, the echo reappears on the same COLUMN of the new
   * week — a card dragged out of Wednesday the 10th leaving its echo on Wednesday the 17th,
   * as though it had come from there. Recomputing it against the current days is what makes
   * it leave with its own week.
   */
  it('takes the echo away with the day it belonged to', async () => {
    const { container } = dragging()
    await nextTick()
    // Its day is still on show, so it is drawn.
    expect(container.querySelector('[data-ghost]')).not.toBeNull()

    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()
    expect(container.querySelector('[data-ghost]')).toBeNull()
  })

  /* The positive half, said plainly: what is left is the card under the pointer, and nothing
     squatting the column the echo came from. */
  it('leaves only the card being dragged once its own day is off show', async () => {
    const { container } = dragging()
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()
    const cards = container.querySelectorAll('.v-calendar-event')
    expect(cards).toHaveLength(1)
    expect(cards[0]!.hasAttribute('data-ghost')).toBe(false)
  })

  /*
   * What pins the echo as DERIVED rather than merely thrown away on the first page: overshoot
   * the week, come back, and it is drawn again — because it is worked out afresh from the day
   * it belongs to every time. Dropping it on the way out would pass the test above and fail
   * this one.
   */
  it('brings the echo back when the view turns back to its day', async () => {
    const { container } = dragging()
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()
    expect(container.querySelector('[data-ghost]')).toBeNull()

    // Back against the other edge, which pages the other way and puts the week back.
    pointer(container.querySelector('.v-calendar-event')!, 'pointermove', {
      clientX: 10,
      clientY: 300,
    })
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()
    expect(container.querySelector('[data-ghost]')).not.toBeNull()
  })

  /*
   * A bar is not all-or-nothing: one running past the end of the week still covers the start
   * of the next, so its echo stays — but it now begins BEFORE the range, which is column zero
   * and not the column it was grabbed on. Frozen it would keep the captured index; derived,
   * `packAllDay` answers that question the same way it does for every other bar.
   */
  it('re-places the echo of a bar that still reaches into the new range', async () => {
    const { container } = mount({
      view: 'week',
      events: [event({ id: 'a', allDay: true, start: WEDNESDAY, end: '2026-06-20' })],
    })
    layOut(container, '.v-calendar-columns')
    layOut(container, '.v-calendar-time-grid')
    const bar = container.querySelector('.v-calendar-bar')!
    pointer(bar, 'pointerdown', { clientX: 350, clientY: 20 })
    pointer(bar, 'pointermove', { clientX: 690, clientY: 20 })
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()

    const ghost = container.querySelector('[data-ghost]') as HTMLElement | null
    expect(ghost).not.toBeNull()
    expect(ghost!.style.getPropertyValue('--calendar-day-index')).toBe('0')
  })

  it('turns the month view a month at a time', async () => {
    const { container, emitted } = mount({
      view: 'month',
      views: ['month'],
      events: [event({ id: 'a' })],
    })
    layOut(container, '.v-calendar-month-grid')
    const chip = container.querySelector('.v-calendar-event')!
    pointer(chip, 'pointerdown', { clientX: 350, clientY: 300 })
    pointer(chip, 'pointermove', { clientX: 690, clientY: 300 })
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()
    expect(emitted('update:date')?.at(-1)).toEqual(['2026-07-10'])
  })
})

/*
 * What a drag costs between two slots. None of it is visible — the picture is the same either
 * way — so these count the work instead: how often the cards are rendered, read through the
 * `#event` slot every card calls, and how often each half of the layout is packed.
 *
 * A pointer fires many times per slot, and the gesture state is a deep ref: an equal preview
 * written as a NEW object re-packs every column and re-renders every cell. On a busy week that
 * is the difference between a drag that follows the hand and one that stutters behind it.
 */
describe('what a drag recomputes', () => {
  /*
   * The moves are dispatched on the element that LISTENS, never on the card: a card carried
   * into another hour is a new element in another cell, so the one first pressed is detached
   * after the first slot and nothing dispatched on it would reach the grid. A real pointer is
   * captured by the grid and never has the question.
   */
  const counted = (props: Record<string, unknown>, surface: string) => {
    let renders = 0
    const utils = render(Calendar, {
      props: { label: 'Schedule', date: WEDNESDAY, ...props },
      slots: {
        event: ({ event: item }: { event: CalendarEvent }) => {
          renders++
          return item.title
        },
      },
    })
    layOut(utils.container, surface)
    layOut(utils.container, '.v-calendar-columns')
    const target = utils.container.querySelector(surface)!
    const moveTo = async (clientX: number, clientY: number) => {
      pointer(target, 'pointermove', { clientX, clientY })
      await nextTick()
    }
    return { ...utils, moveTo, renders: () => renders }
  }

  /* One column, 08:00 to 18:00 over the stubbed 600 pixels: a pixel is a minute, so a quarter
     of an hour is fifteen of them. */
  it('renders nothing when the pointer moves inside the slot already shown', async () => {
    const { container, moveTo, renders } = counted(
      { view: 'day', dayStart: 8, dayEnd: 18, events: [event({ id: 'a' })] },
      '.v-calendar-time-grid',
    )
    pointer(container.querySelector('.v-calendar-event')!, 'pointerdown', {
      clientX: 350,
      clientY: 60,
    })
    await moveTo(350, 120)
    const before = renders()

    // A pointer three minutes further down snaps back to the slot already on show.
    await moveTo(350, 123)
    expect(renders()).toBe(before)

    // And the counter is live: the next slot does render.
    await moveTo(350, 160)
    expect(renders()).toBeGreaterThan(before)
  })

  it('renders nothing when a chip moves inside the square already shown', async () => {
    const { container, moveTo, renders } = counted(
      { view: 'month', views: ['month'], events: [event({ id: 'a' })] },
      '.v-calendar-month-grid',
    )
    // Six weeks over 600 pixels and seven days over 700: Wednesday the 10th is row 1, column 3.
    pointer(container.querySelector('.v-calendar-event')!, 'pointerdown', {
      clientX: 350,
      clientY: 150,
    })
    await moveTo(450, 150)
    const before = renders()

    await moveTo(460, 160)
    expect(renders()).toBe(before)

    await moveTo(550, 150)
    expect(renders()).toBeGreaterThan(before)
  })

  it('does not re-pack the all-day band while a timed card is dragged', async () => {
    const { container, moveTo } = counted(
      {
        view: 'day',
        dayStart: 8,
        dayEnd: 18,
        events: [event({ id: 'a' }), event({ id: 'b', allDay: true })],
      },
      '.v-calendar-time-grid',
    )
    pointer(container.querySelector('.v-calendar-block')!, 'pointerdown', {
      clientX: 350,
      clientY: 60,
    })
    vi.mocked(packAllDay).mockClear()
    vi.mocked(packDayColumn).mockClear()

    await moveTo(350, 120)
    await moveTo(350, 160)

    expect(vi.mocked(packDayColumn)).toHaveBeenCalled()
    expect(vi.mocked(packAllDay)).not.toHaveBeenCalled()
  })

  it('does not re-pack the columns while an all-day bar is dragged', async () => {
    const { container, moveTo } = counted(
      { view: 'week', events: [event({ id: 'a' }), event({ id: 'b', allDay: true })] },
      '.v-calendar-time-grid',
    )
    pointer(container.querySelector('.v-calendar-bar')!, 'pointerdown', {
      clientX: 350,
      clientY: 20,
    })
    vi.mocked(packAllDay).mockClear()
    vi.mocked(packDayColumn).mockClear()

    await moveTo(450, 20)
    await moveTo(550, 20)

    expect(vi.mocked(packAllDay)).toHaveBeenCalled()
    expect(vi.mocked(packDayColumn)).not.toHaveBeenCalled()
  })
})

/*
 * Letting go somewhere the drag cannot mean anything: the hand's version of the Escape the
 * keyboard grab already has.
 *
 * These are on REAL timers, and the point is out of the box on the INLINE axis only. A point
 * below the grid would send `blockEdgeAt` to full speed and leave the auto-scroll's animation
 * frames running for the rest of the file; x = 900 against the 700-wide stub only arms the edge
 * timer, which is torn down on unmount.
 */
describe('letting go outside the calendar', () => {
  const outside = (props: Record<string, unknown> = {}) => {
    const utils = mount({
      view: 'week',
      dayStart: 8,
      dayEnd: 18,
      events: [event({ id: 'a' })],
      ...props,
    })
    layOut(utils.container, '.v-calendar-time-grid')
    layOut(utils.container, '.v-calendar-columns')
    return utils
  }

  /** Press, travel off the calendar, and let go there. */
  const dragOut = (el: Element) => {
    pointer(el, 'pointerdown', { clientX: 350, clientY: 300 })
    pointer(el, 'pointermove', { clientX: 900, clientY: 300 })
    pointer(el, 'pointerup', { clientX: 900, clientY: 300 })
  }

  it('writes nothing when a card is let go outside', async () => {
    const { container, emitted } = outside()
    dragOut(container.querySelector('.v-calendar-event')!)
    await nextTick()
    expect(emitted('event-move')).toBeUndefined()
    expect(emitted('update:events')).toBeUndefined()
  })

  it('abandons a stretch let go outside', async () => {
    const { container, emitted } = outside()
    dragOut(container.querySelector('[data-calendar-handle]')!)
    await nextTick()
    expect(emitted('event-resize')).toBeUndefined()
    expect(emitted('update:events')).toBeUndefined()
  })

  it('abandons an all-day bar let go outside', async () => {
    const { container, emitted } = outside({ events: [event({ id: 'a', allDay: true })] })
    dragOut(container.querySelector('.v-calendar-bar')!)
    await nextTick()
    expect(emitted('event-move')).toBeUndefined()
  })

  /*
   * The create gesture goes the same way, and deliberately: one rule covers all four kinds, so
   * there is nothing to remember beyond "released outside, nothing happens".
   */
  it('creates nothing when a drawn slot is let go outside', async () => {
    const { container, emitted } = outside({ events: [], creatable: true })
    dragOut(container.querySelector('.v-calendar-cell')!)
    await nextTick()
    expect(emitted('event-create')).toBeUndefined()
    expect(emitted('update:events')).toBeUndefined()
  })

  /*
   * The flag is a reading of where the pointer IS, not a mark the drag keeps once it has been
   * out. Leaving and coming back must land the event exactly as if it had never left.
   */
  it('writes as usual when the pointer comes back inside first', async () => {
    const { container, emitted } = outside()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 350, clientY: 300 })
    pointer(card, 'pointermove', { clientX: 900, clientY: 300 })
    pointer(card, 'pointermove', { clientX: 350, clientY: 400 })
    pointer(card, 'pointerup', { clientX: 350, clientY: 400 })
    await nextTick()
    expect(emitted('event-move')).toHaveLength(1)
  })

  it('marks the card and the view while the pointer is out', async () => {
    const { container } = outside()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 350, clientY: 300 })
    pointer(card, 'pointermove', { clientX: 900, clientY: 300 })
    await nextTick()
    expect(container.querySelector('[data-rejected]')).not.toBeNull()
    expect(container.querySelector('.v-calendar-time-grid')!.hasAttribute('data-outside')).toBe(
      true,
    )
  })

  /* The echo is what says where the event is about to go back to, so it is needed MORE out
     here than in, not less. */
  it('keeps the echo showing where the event will return to', async () => {
    const { container } = outside()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 350, clientY: 300 })
    pointer(card, 'pointermove', { clientX: 900, clientY: 300 })
    await nextTick()
    expect(container.querySelector('[data-ghost]')).not.toBeNull()
  })

  /*
   * `pointerup` fires before `click`. Without the drag flag being set on this path too, an
   * abandoned drag would end by opening the very event it has just refused to move.
   */
  it('does not open the event it has just refused to move', async () => {
    const { container, emitted } = outside()
    const card = container.querySelector('.v-calendar-event')!
    dragOut(card)
    await fireEvent.click(card)
    expect(emitted('event-activate')).toBeUndefined()
  })

  /* The pointer says nothing on a successful drop either; announcing only the revert would be
     a rule nobody could infer. */
  it('says nothing to a reader who cannot see it', async () => {
    const { container } = outside()
    dragOut(container.querySelector('.v-calendar-event')!)
    await nextTick()
    expect(container.querySelector('[role="status"]')!.textContent).toBe('')
  })

  /*
   * The component's own guard on the degenerate rule: a box that measures nothing contains
   * everything. Note there is no `layOut` here — which is the state every other drag test in
   * this file runs in, and this is what fails loudly if that branch is ever flipped.
   */
  it('still writes on release when nothing has been laid out', async () => {
    const { container, emitted } = mount({ view: 'week', events: [event({ id: 'a' })] })
    dragOut(container.querySelector('.v-calendar-event')!)
    await nextTick()
    expect(emitted('event-move')).toHaveLength(1)
  })

  /* The month is measured against its ROOT, which includes the row of weekday names its grid
     leaves out. */
  it('writes nothing when a chip is let go outside the month', async () => {
    const { container, emitted } = mount({
      view: 'month',
      views: ['month'],
      events: [event({ id: 'a' })],
    })
    layOut(container, '.v-calendar-month')
    dragOut(container.querySelector('.v-calendar-event')!)
    await nextTick()
    expect(emitted('event-move')).toBeUndefined()
  })
})

describe('moving an event with the keyboard', () => {
  const held = async (props: Record<string, unknown> = {}) => {
    const utils = mount({
      view: 'week',
      dayStart: 8,
      dayEnd: 18,
      events: [event({ id: 'a', title: 'Standup' })],
      ...props,
    })
    const card = utils.container.querySelector('.v-calendar-event') as HTMLElement
    await fireEvent.keyDown(card, { key: ' ' })
    return { ...utils, card }
  }

  it('tells the #event slot the card is held', async () => {
    const seen: boolean[] = []
    const { container } = render(Calendar, {
      props: {
        label: 'Schedule',
        date: WEDNESDAY,
        view: 'week',
        events: [event({ id: 'a', title: 'Standup' })],
      },
      slots: {
        event: ({ event: item, grabbed, dragging }: CalendarEventSlotProps) => {
          seen.push(grabbed && !dragging)
          return item.title
        },
      },
    })
    await fireEvent.keyDown(container.querySelector('.v-calendar-event')!, { key: ' ' })
    expect(seen.at(-1)).toBe(true)
  })

  it('takes hold on Space and says so', async () => {
    const { container, emitted } = await held()
    expect(container.querySelector('[data-grabbed]')).not.toBeNull()
    expect(emitted('event-activate')).toBeUndefined()
    await nextTick()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('Event held')
  })

  /*
   * Enter presses the card as the button it is, which is the keyboard's only way to open an
   * event that can also be moved. Cancelled here, the browser would never turn it into a click.
   */
  it('leaves Enter to the card, so a movable event can still be opened', async () => {
    const { container } = mount({ view: 'week', events: [event({ id: 'a', title: 'Standup' })] })
    const card = container.querySelector('.v-calendar-event') as HTMLElement
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    card.dispatchEvent(enter)
    await nextTick()
    expect(enter.defaultPrevented).toBe(false)
    expect(container.querySelector('[data-grabbed]')).toBeNull()
  })

  it('moves by a slot on the vertical arrows, and announces where it is', async () => {
    const { container } = await held({ slotDuration: 15 })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    await nextTick()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('9:15 AM')
  })

  /*
   * Each press is applied to the PREVIEW, so three presses move three slots. Applying them
   * to the origin instead would make every arrow undo the last one.
   */
  it('accumulates its steps rather than restarting from where it began', async () => {
    const { container } = await held({ slotDuration: 15 })
    for (let i = 0; i < 3; i++) {
      await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    }
    await nextTick()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('9:45 AM')
  })

  it('changes how long it lasts when Shift is held', async () => {
    const { container } = await held({ slotDuration: 15 })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, {
      key: 'ArrowDown',
      shiftKey: true,
    })
    await nextTick()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('10:15 AM')
  })

  it('writes the model on Enter, once', async () => {
    const { container, emitted } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Enter' })
    expect(emitted('update:events')).toHaveLength(1)
    expect(emitted('event-move')).toHaveLength(1)
    expect(container.querySelector('[data-grabbed]')).toBeNull()
  })

  /*
   * The card is redrawn somewhere else on every step, and a re-rendered element does not keep
   * the focus. Putting it back is what keeps the following arrow reaching the card at all —
   * without it, the first press drops the reader onto the body and the grab becomes
   * unusable while still being held. This went untested for as long as the lookup threw.
   */
  it('carries the focus with the card it moves', async () => {
    const { container } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    await nextTick()
    expect(document.activeElement).toBe(container.querySelector('[data-event-id="a"]'))
  })

  /** And it is still the card that holds the focus once the move has been taken. */
  it('leaves the focus on the card it has just placed', async () => {
    const { container } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Enter' })
    await nextTick()
    expect(document.activeElement).toBe(container.querySelector('[data-event-id="a"]'))
  })

  /*
   * The one thing a keypress has that a pointer drag does not: the chance to change your
   * mind. Escape must put the event back and write nothing at all.
   */
  it('puts the event back on Escape, writing nothing', async () => {
    const { container, emitted } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Escape' })
    expect(emitted('update:events')).toBeUndefined()
    expect(emitted('event-move')).toBeUndefined()
    await nextTick()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('cancelled')
  })

  it('writes nothing when the event is put back where it was taken from', async () => {
    const { container, emitted } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowUp' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Enter' })
    expect(emitted('event-move')).toBeUndefined()
    expect(emitted('update:events')).toBeUndefined()
  })

  /*
   * Held against the end of the day, a step is written 23:59 rather than 24:00. Taking the
   * next step from THAT would cost a minute a press, and the event would come back shorter and
   * off the slot grid. Every step is worked out from where the event was taken instead.
   */
  it('comes back from the end of the day whole and on the slot grid', async () => {
    const { container, emitted } = await held({
      dayStart: 0,
      dayEnd: 24,
      slotDuration: 15,
      events: [event({ id: 'a', title: 'Standup', startTime: '22:00', endTime: '23:00' })],
    })
    for (let i = 0; i < 8; i++) {
      await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    }
    for (let i = 0; i < 2; i++) {
      await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowUp' })
    }
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Enter' })
    const [next] = emitted('event-move')!.at(-1) as [CalendarEvent]
    expect(next).toMatchObject({ startTime: '22:30', endTime: '23:30' })
  })

  it('says nothing for a step that goes nowhere', async () => {
    const { container } = await held({
      events: [event({ id: 'a', title: 'Standup', startTime: '08:00', endTime: '09:00' })],
    })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowUp' })
    await nextTick()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('Event held')
  })

  /*
   * A grab is held until Enter, Space or Escape. Leaving it behind when the reader moves on
   * left every pointer gesture refusing to start, the card still lifted, with no way to tell.
   */
  it('lets go of the grab when the focus moves on to something else', async () => {
    const { container } = await held()
    const card = container.querySelector('[data-grabbed]')!
    const elsewhere = container.querySelector('.v-calendar-toolbar button')!
    card.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: elsewhere }))
    await nextTick()
    expect(container.querySelector('[data-grabbed]')).toBeNull()
    await nextTick()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('cancelled')
  })

  // A card redrawn in another column loses the focus to nothing, and is handed it back.
  it('keeps the grab when the focus goes nowhere', async () => {
    const { container } = await held()
    const card = container.querySelector('[data-grabbed]')!
    card.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
    await nextTick()
    expect(container.querySelector('[data-grabbed]')).not.toBeNull()
  })

  it('gives way to a pointer that takes hold of an event', async () => {
    const { container, emitted } = await held()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(emitted('event-move')).toHaveLength(1)
    expect(container.querySelector('[data-grabbed]')).toBeNull()
  })

  it('leaves a card alone when the calendar is read-only', async () => {
    const { container } = await held({ readonly: true })
    expect(container.querySelector('[data-grabbed]')).toBeNull()
  })

  /*
   * The pointer moves an all-day bar by whole days; the keyboard has to reach the same gesture,
   * and the hint every card points at says so.
   */
  it('moves an all-day bar by whole days, from the keyboard', async () => {
    const { container, emitted } = mount({
      view: 'week',
      events: [event({ id: 'a', title: 'Offsite', allDay: true })],
    })
    const bar = container.querySelector('.v-calendar-bar') as HTMLElement
    await fireEvent.keyDown(bar, { key: ' ' })
    expect(container.querySelector('.v-calendar-bar[data-grabbed]')).not.toBeNull()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowRight' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Enter' })
    const [moved] = emitted('event-move')!.at(-1) as [CalendarEvent]
    expect(moved).toMatchObject({ start: '2026-06-11', end: '2026-06-11' })
  })

  /*
   * Every gesture the pointer offers has a keyboard equivalent (WCAG 2.1.1), and a reader
   * has to be told how to reach it — from ONE shared node, not the same sentence repeated on
   * each of a hundred cards.
   */
  it('tells a reader how to move a card, from a node they all share', () => {
    const { container } = mount({ events: [event({ id: 'a' }), event({ id: 'b' })] })
    const cards = [...container.querySelectorAll('.v-calendar-event')]
    const ids = new Set(cards.map((card) => card.getAttribute('aria-describedby')))
    expect(ids.size).toBe(1)
    const hint = container.querySelector(`#${[...ids][0]}`)!
    expect(hint.textContent).toContain('arrow keys')
  })

  /*
   * A live region inserted at the same moment as its first message is not announced at all —
   * the trap VDataTable's selection count already documents.
   */
  it('has its live region on screen and empty from the very first paint', () => {
    const { container } = mount()
    const region = container.querySelector('[role="status"]')!
    expect(region.getAttribute('aria-live')).toBe('polite')
    expect(region.textContent).toBe('')
  })
})

describe('the region', () => {
  it('is named, and says what it is instead of being announced as a region', () => {
    const { getByRole } = mount()
    const region = getByRole('region', { name: 'Schedule' })
    expect(region.getAttribute('aria-roledescription')).toBe('calendar')
  })

  it("keeps a role description of the consumer's own", () => {
    const { getByRole } = mount({ 'aria-roledescription': 'planning board' })
    const region = getByRole('region', { name: 'Schedule' })
    expect(region.getAttribute('aria-roledescription')).toBe('planning board')
  })

  it('falls back to the dictionary when the consumer names nothing', () => {
    const { getByRole } = render(Calendar, { props: { date: WEDNESDAY } })
    expect(getByRole('region', { name: 'Calendar' })).toBeTruthy()
  })

  /*
   * The wrapper-root pattern: class and style belong to the outer box, everything else to
   * the element carrying the role — otherwise a consumer's `id` lands on a wrapper their
   * own `aria-labelledby` can never point at.
   */
  it('keeps class on the root and sends the rest to the region', () => {
    const { container } = mount({ class: 'mine', id: 'schedule' })
    const root = container.querySelector('.v-calendar')!
    expect(root.classList.contains('mine')).toBe(true)
    expect(root.getAttribute('id')).toBeNull()
    expect(root.querySelector('.v-calendar-region')!.getAttribute('id')).toBe('schedule')
  })
})

describe('a disabled year view', () => {
  // Pointer events are off on a disabled calendar, the keyboard is not: the months have to be
  // real disabled buttons, or twelve dead controls stay in the tab order.
  it('disables every month when the calendar is disabled', () => {
    const { container } = mount({ view: 'year', views: ['year', 'month'], disabled: true })
    const titles = [...container.querySelectorAll('.v-calendar-year-title')]
    expect(titles).toHaveLength(12)
    expect(titles.every((title) => (title as HTMLButtonElement).disabled)).toBe(true)
  })
})

describe('what it exposes', () => {
  const calendar = ref<{ el: HTMLElement | null; focus(options?: FocusOptions): void } | null>(null)
  const Host = defineComponent({
    components: { VCalendar: VCalendar as object },
    props: { view: { type: String, default: 'week' } },
    setup: () => ({ calendar, views: ['week', 'year'] }),
    template:
      '<VCalendar ref="calendar" label="Schedule" date="2026-06-10" :view="view" :views="views" />',
  })

  // The region is where the id and the ARIA attributes a consumer writes land.
  it('hands over the region as el', async () => {
    const { container } = render(Host)
    await nextTick()
    expect(calendar.value?.el).toBe(container.querySelector('.v-calendar-region'))
  })

  // The year view has no grid, and focus() used to do nothing there.
  it('focuses the first month in the year view', async () => {
    const { container } = render(Host, { props: { view: 'year' } })
    await nextTick()
    calendar.value?.focus({ preventScroll: true })
    expect(document.activeElement).toBe(container.querySelector('.v-calendar-year-title'))
  })
})
