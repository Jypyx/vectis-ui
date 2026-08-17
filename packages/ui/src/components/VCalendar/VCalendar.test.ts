import { fireEvent, render } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import VCalendar from './VCalendar.vue'
import { EDGE_STEP_DELAY } from './edgeStep'
import { daySpan } from './layout'
import type { CalendarEvent } from './types'

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
      hourFormat: '24h',
      events: [event({ id: 'a', title: 'Standup' })],
    })
    expect(getByRole('button', { name: 'Standup, 09:00 – 10:00' })).toBeTruthy()
  })

  it('says what an event IS, rather than letting it be announced as a button', () => {
    const { getByRole } = mount({ events: [event({ id: 'a', title: 'Standup' })] })
    const card = getByRole('button', { name: /Standup/ })
    expect(card.getAttribute('aria-roledescription')).toBe('event')
  })

  it('appends a time zone as an annotation, and only as one', () => {
    const { getByRole, container } = mount({
      hourFormat: '24h',
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
    expect(emitted('slot-activate')?.at(-1)).toEqual([{ date: WEDNESDAY, time: '09:00' }])
  })

  /*
   * A card is a button with a keyboard of its own. If the grid answered keys aimed at one,
   * arriving at an event would be the same keystroke as acting on it.
   */
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
    expect(bar.style.getPropertyValue('--event-day')).toBe('2')
    expect(bar.style.getPropertyValue('--event-span')).toBe('3')
  })

  it('stacks two overlapping bars onto separate rows', () => {
    const { container } = mount({
      events: [
        event({ id: 'a', start: MONDAY, end: '2026-06-10' }),
        event({ id: 'b', start: '2026-06-09', end: '2026-06-12' }),
      ],
    })
    const lanes = [...container.querySelectorAll('.v-calendar-bar')].map((bar) =>
      (bar as HTMLElement).style.getPropertyValue('--event-lane'),
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
    const { container } = mount({ view: 'day', date: todayISO, showCurrentTime: false })
    await nextTick()
    expect(container.querySelector('.v-calendar-now')).toBeNull()
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

  it('does nothing at all when the calendar is not editable', async () => {
    const { container, emitted } = month({ editable: false, events: [event({ id: 'a' })] })
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
    await fireEvent.keyDown(chip, { key: 'Enter' })
    return utils
  }

  it('takes hold on Enter without also opening the event', async () => {
    const { container, emitted } = await held()
    expect(container.querySelector('[data-grabbed]')).not.toBeNull()
    expect(emitted('event-activate')).toBeUndefined()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('Event held')
  })

  it('moves a day sideways and a whole week vertically', async () => {
    const { container } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    // A row IS a week here, which is the month's own reading of the same key table: one press
    // of Down moves the 10th to the 17th, not to the 11th.
    expect(container.querySelector('[role="status"]')!.textContent).toContain('June 17')
  })

  it('writes the model on Enter, once', async () => {
    const { container, emitted } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowRight' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Enter' })
    expect(emitted('event-move')).toHaveLength(1)
    expect(container.querySelector('[data-grabbed]')).toBeNull()
  })

  it('puts the event back on Escape, writing nothing', async () => {
    const { container, emitted } = await held()
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowRight' })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'Escape' })
    expect(emitted('event-move')).toBeUndefined()
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
  const drag = (props: Record<string, unknown> = {}) =>
    mount({ view: 'day', dayStart: 8, dayEnd: 18, events: [event({ id: 'a' })], ...props })

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
    expect(container.querySelector('.v-calendar-event')!.getAttribute('data-dragging')).toBe('')
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

  it('ignores anything but the left button', async () => {
    const { container, emitted } = drag()
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100, button: 2 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(emitted('event-move')).toBeUndefined()
  })

  it('does nothing at all when it was told not to be editable', async () => {
    const { container, emitted } = drag({ editable: false })
    const card = container.querySelector('.v-calendar-event')!
    pointer(card, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(card, 'pointermove', { clientX: 100, clientY: 300 })
    pointer(card, 'pointerup', { clientX: 100, clientY: 300 })
    await nextTick()
    expect(emitted('event-move')).toBeUndefined()
  })

  it('offers no resize strip when it is not editable', () => {
    const { container } = drag({ editable: false })
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
   * A bar has no hours, so dragging it up and down means nothing — but it does move by whole
   * days along the band. jsdom measures every column as zero width, so what this pins is the
   * WIRING: that the band's press starts a gesture and that the release reports a move.
   */
  it('moves an all-day bar by whole days', async () => {
    const { container, emitted } = mount({
      view: 'week',
      events: [event({ id: 'a', allDay: true })],
    })
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
    const bar = container.querySelector('.v-calendar-bar')!
    pointer(bar, 'pointerdown', { clientX: 100, clientY: 20 })
    pointer(bar, 'pointermove', { clientX: 300, clientY: 20 })
    pointer(bar, 'pointerup', { clientX: 300, clientY: 20 })
    await nextTick()
    const [moved] = emitted('event-move')!.at(-1) as CalendarEvent[]
    expect(daySpan(moved!)).toBe(2)
  })

  it('leaves a bar alone when the calendar is not editable', async () => {
    const { container, emitted } = mount({
      view: 'week',
      editable: false,
      events: [event({ id: 'a', allDay: true })],
    })
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
    const bar = container.querySelector('.v-calendar-bar')!
    pointer(bar, 'pointerdown', { clientX: 100, clientY: 20 })
    pointer(bar, 'pointermove', { clientX: 300, clientY: 20 })
    await nextTick()
    expect(container.querySelectorAll('[data-ghost]')).toHaveLength(1)
  })

  it('shows one while a card is held by the keyboard and moved', async () => {
    const { container } = mount({ view: 'day', events: [event({ id: 'a' })] })
    const card = container.querySelector('.v-calendar-event') as HTMLElement
    await fireEvent.keyDown(card, { key: 'Enter' })
    // Taking hold is not yet moving: nothing has been given up, so nothing to echo.
    expect(container.querySelector('[data-ghost]')).toBeNull()

    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
    expect(container.querySelectorAll('[data-ghost]')).toHaveLength(1)
  })
})

describe('creating an event by taking up an empty slot', () => {
  const empty = (props: Record<string, unknown> = {}) =>
    mount({ view: 'day', dayStart: 9, dayEnd: 17, ...props })

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
      editable: false,
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

  it('adds one to the model and says so', async () => {
    const { container, emitted } = empty()
    const cell = container.querySelector('.v-calendar-cell')!
    pointer(cell, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(cell, 'pointerup', { clientX: 100, clientY: 100 })
    await nextTick()
    const created = (emitted('event-create')!.at(-1) as CalendarEvent[])[0]!
    expect(created.title).toBe('Event #1')
    expect(emitted('update:events')).toHaveLength(1)
  })

  it('makes it one slot long, starting where the press landed', async () => {
    const { container, emitted } = empty({ slotDuration: 15 })
    const cell = container.querySelector('.v-calendar-cell')!
    pointer(cell, 'pointerdown', { clientX: 0, clientY: 0 })
    pointer(cell, 'pointerup', { clientX: 0, clientY: 0 })
    await nextTick()
    const created = (emitted('event-create')!.at(-1) as CalendarEvent[])[0]!
    expect(created.startTime).toBe('09:00')
    expect(created.endTime).toBe('09:15')
  })

  it('honours a different slot length', async () => {
    const { container, emitted } = empty({ slotDuration: 30 })
    const cell = container.querySelector('.v-calendar-cell')!
    pointer(cell, 'pointerdown', { clientX: 0, clientY: 0 })
    pointer(cell, 'pointerup', { clientX: 0, clientY: 0 })
    await nextTick()
    expect((emitted('event-create')!.at(-1) as CalendarEvent[])[0]!.endTime).toBe('09:30')
  })

  it('numbers each new event in turn', async () => {
    const { container, emitted } = empty()
    const cell = container.querySelector('.v-calendar-cell')!
    for (let i = 0; i < 2; i++) {
      pointer(cell, 'pointerdown', { clientX: 0, clientY: 0 })
      pointer(cell, 'pointerup', { clientX: 0, clientY: 0 })
      await nextTick()
    }
    const titles = (emitted('event-create') as CalendarEvent[][]).map(([e]) => e!.title)
    expect(titles).toEqual(['Event #1', 'Event #2'])
  })

  /*
   * The signal survives even when the making does not: a consumer with their own form turns
   * `creatable` off and keeps `slot-activate`.
   */
  it('still reports the slot when it was told not to create', async () => {
    const { container, emitted } = empty({ creatable: false })
    await fireEvent.click(container.querySelector('.v-calendar-cell')!)
    expect(emitted('event-create')).toBeUndefined()
    expect(emitted('update:events')).toBeUndefined()
    expect(emitted('slot-activate')).toEqual([[{ date: WEDNESDAY, time: '09:00' }]])
  })

  /*
   * With creation on, the press has already become a gesture and reported itself on release.
   * Reporting the click too would say the same thing twice.
   */
  it('reports a created slot once, not twice', async () => {
    const { container, emitted } = empty()
    const cell = container.querySelector('.v-calendar-cell')!
    pointer(cell, 'pointerdown', { clientX: 0, clientY: 0 })
    pointer(cell, 'pointerup', { clientX: 0, clientY: 0 })
    await fireEvent.click(cell)
    expect(emitted('slot-activate')).toHaveLength(1)
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
    layOut(utils.container, '.v-calendar-grid')
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

  it('pages backwards from the other edge', async () => {
    const { container, emitted } = mount({ view: 'week', events: [event({ id: 'a' })] })
    layOut(container, '.v-calendar-columns')
    layOut(container, '.v-calendar-grid')
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
    layOut(container, '.v-calendar-grid')
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
    layOut(container, '.v-calendar-grid')
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
   * The other half of that, and the one the grid used to get wrong. The echo belongs to a
   * DATE, and the boxes it is drawn from are described by INDEX into the days on show — so
   * once the view has turned, the index it was captured with names a different day. It used
   * to be kept as it was and reappear on the same COLUMN of the new week: a card dragged out
   * of Wednesday the 10th left its echo on Wednesday the 17th, as though it had come from
   * there. Recomputing it against the current days is what makes it leave with its own week.
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
     squatting the column the echo used to occupy. */
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
   * and not the column it was grabbed on. Frozen, it kept the old index; derived, `packAllDay`
   * answers that question the same way it does for every other bar.
   */
  it('re-places the echo of a bar that still reaches into the new range', async () => {
    const { container } = mount({
      view: 'week',
      events: [event({ id: 'a', allDay: true, start: WEDNESDAY, end: '2026-06-20' })],
    })
    layOut(container, '.v-calendar-columns')
    layOut(container, '.v-calendar-grid')
    const bar = container.querySelector('.v-calendar-bar')!
    pointer(bar, 'pointerdown', { clientX: 350, clientY: 20 })
    pointer(bar, 'pointermove', { clientX: 690, clientY: 20 })
    vi.advanceTimersByTime(EDGE_STEP_DELAY)
    await nextTick()

    const ghost = container.querySelector('[data-ghost]') as HTMLElement | null
    expect(ghost).not.toBeNull()
    expect(ghost!.style.getPropertyValue('--event-day')).toBe('0')
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
    layOut(utils.container, '.v-calendar-grid')
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
    const { container, emitted } = outside({ events: [] })
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
    expect(container.querySelector('.v-calendar-grid')!.hasAttribute('data-outside')).toBe(true)
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
   * `pointerup` fires before `click`. Without `justDragged` being set on this path too, an
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
    await fireEvent.keyDown(card, { key: 'Enter' })
    return { ...utils, card }
  }

  it('takes hold on Enter and says so', async () => {
    const { container, emitted } = await held()
    expect(container.querySelector('[data-grabbed]')).not.toBeNull()
    expect(emitted('event-activate')).toBeUndefined()
    expect(container.querySelector('[role="status"]')!.textContent).toContain('Event held')
  })

  it('moves by a slot on the vertical arrows, and announces where it is', async () => {
    const { container } = await held({ slotDuration: 15 })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, { key: 'ArrowDown' })
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
    expect(container.querySelector('[role="status"]')!.textContent).toContain('9:45 AM')
  })

  it('changes how long it lasts when Shift is held', async () => {
    const { container } = await held({ slotDuration: 15 })
    await fireEvent.keyDown(container.querySelector('[data-grabbed]')!, {
      key: 'ArrowDown',
      shiftKey: true,
    })
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
    expect(container.querySelector('[role="status"]')!.textContent).toContain('cancelled')
  })

  it('leaves a card alone when the calendar is not editable', async () => {
    const { container } = await held({ editable: false })
    expect(container.querySelector('[data-grabbed]')).toBeNull()
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
