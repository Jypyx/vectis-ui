import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import type { Component } from 'vue'
import { ref } from 'vue'

import { storyText } from '../../stories/storyText'
import VCalendarSfc from './VCalendar.vue'
import type { CalendarEvent } from './types'

// A generic SFC: its generic function signature is not assignable to Storybook's Component
// types — it is erased for the stories, exactly as VDataTable's is.
const VCalendar = VCalendarSfc as unknown as Component

/**
 * A consumer's own event type. Extending the interface is how extra fields are carried
 * through the v-model and reach the `#event` slot still typed — which is the whole reason
 * the component is generic rather than carrying an index signature.
 */
interface Booking extends CalendarEvent {
  room: string
}

const t = storyText({
  en: {
    standup: 'Standup',
    review: 'Design review',
    lunch: 'Lunch',
    oneToOne: 'One to one',
    workshop: 'Workshop',
    retro: 'Retrospective',
    interview: 'Interview',
    release: 'Release window',
    room: 'Room',
    withAnna: 'With Anna and Ravi',
    quarterly: 'Quarterly plan',
  },
  fr: {
    standup: 'Point quotidien',
    review: 'Revue de design',
    lunch: 'Déjeuner',
    oneToOne: 'Entretien individuel',
    workshop: 'Atelier',
    retro: 'Rétrospective',
    interview: 'Entretien de recrutement',
    release: 'Fenêtre de livraison',
    room: 'Salle',
    withAnna: 'Avec Anna et Ravi',
    quarterly: 'Plan trimestriel',
  },
})

/*
 * A fixed reference week — June 2026, whose 8th is a Monday — so that every story shows the
 * same thing on every run, and so Chromatic has nothing to diff but real changes. Demo
 * dates stay as they are: only prose goes through the dictionary.
 */
const ANCHOR = '2026-06-10'

const week = (): CalendarEvent[] => [
  {
    id: 'a',
    title: t.value.standup,
    start: '2026-06-08',
    end: '2026-06-08',
    startTime: '09:00',
    endTime: '09:15',
  },
  {
    id: 'b',
    title: t.value.review,
    start: '2026-06-09',
    end: '2026-06-09',
    startTime: '10:00',
    endTime: '11:30',
    description: t.value.withAnna,
  },
  {
    id: 'c',
    title: t.value.lunch,
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '12:30',
    endTime: '13:30',
  },
  {
    id: 'd',
    title: t.value.oneToOne,
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '15:00',
    endTime: '15:45',
  },
  {
    id: 'e',
    title: t.value.workshop,
    start: '2026-06-11',
    end: '2026-06-11',
    startTime: '09:30',
    endTime: '12:00',
  },
  {
    id: 'f',
    title: t.value.retro,
    start: '2026-06-12',
    end: '2026-06-12',
    startTime: '16:00',
    endTime: '17:00',
  },
]

const meta: Meta = {
  title: 'Components/Calendar',
  component: VCalendar as Meta['component'],
  /*
   * No `locale` arg: the calendar then follows the design system's global locale, so the
   * Locale toolbar drives its day names, month names and clock along with its words. The
   * Localization story pins explicit locales instead.
   *
   * Every story gives a DISTINCT `label`. The root is a region, which is a landmark, and
   * `landmark-unique` is one of the best-practice rules the accessibility addon does run.
   */
  args: { date: ANCHOR, view: 'week', label: 'Team schedule' },
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

/** The ordinary case: a week, with the working hours in view. */
export const Default: Story = {
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({ args, events: ref(week()) }),
    template: `
      <div style="height: 560px; padding: 16px">
        <VCalendar v-bind="args" v-model:events="events" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The grid opens on the working day rather than at midnight, so the events are in view.
    await waitFor(() => expect(canvas.getByRole('grid')).toBeVisible())
    expect(canvas.getAllByRole('button', { name: /Standup/ }).length).toBeGreaterThan(0)
  },
}

/** Every view the menu can offer, driven from the toolbar. */
export const Views: Story = {
  args: {
    views: ['day', '4days', 'week', 'month', 'year', 'custom'],
    customDays: 3,
    label: 'Views',
  },
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({ args, events: ref(week()), view: ref('week'), date: ref(ANCHOR) }),
    template: `
      <div style="height: 560px; padding: 16px">
        <VCalendar v-bind="args" v-model:view="view" v-model:date="date" v-model:events="events" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /^View:/ }))
    const menu = await canvas.findByRole('menu')
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Day' }))
    // The toolbar renames its own controls after the step they now take.
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Next day' })).toBeVisible())
  },
}

/**
 * The month view is a summary: each day shows as many events as it has room for, then says
 * how many are left. Choosing a day's number opens it on its own.
 */
export const Month: Story = {
  args: { view: 'month', views: ['month', 'day'], label: 'Month' },
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({
      args,
      events: ref([
        ...week(),
        {
          id: 'g',
          title: t.value.interview,
          start: '2026-06-10',
          end: '2026-06-10',
          startTime: '17:00',
          endTime: '18:00',
        },
        {
          id: 'h',
          title: t.value.quarterly,
          start: '2026-06-10',
          end: '2026-06-10',
          startTime: '08:00',
          endTime: '08:30',
        },
        {
          id: 'i',
          title: t.value.release,
          start: '2026-06-16',
          end: '2026-06-18',
          startTime: '00:00',
          endTime: '23:59',
        },
      ] as CalendarEvent[]),
      view: ref('month'),
      date: ref(ANCHOR),
    }),
    template: `
      <div style="height: 620px; padding: 16px">
        <VCalendar v-bind="args" v-model:view="view" v-model:date="date" v-model:events="events" />
      </div>
    `,
  }),
}

/**
 * The year view is for orientation: twelve months, each marking the days that have
 * something on them and saying how many. The days here are deliberately not controls —
 * three hundred and sixty-five tab stops would make the view unusable to anyone reaching it
 * by keyboard — so it is the month that can be chosen, which opens it.
 */
export const Year: Story = {
  args: { view: 'year', views: ['year', 'month'], label: 'Year' },
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({ args, events: ref(week()), view: ref('year'), date: ref(ANCHOR) }),
    template: `
      <div style="height: 620px; padding: 16px">
        <VCalendar v-bind="args" v-model:view="view" v-model:date="date" v-model:events="events" />
      </div>
    `,
  }),
}

/**
 * An event marked `allDay`, or one running from one day to the next, goes into the band
 * above the grid — a card spanning two days cannot be drawn inside one column. Bars that
 * overlap stack onto rows of their own.
 */
export const AllDay: Story = {
  args: { dayStart: 8, dayEnd: 18, label: 'All-day events' },
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({
      args,
      events: ref([
        {
          id: 'trip',
          title: t.value.workshop,
          start: '2026-06-09',
          end: '2026-06-11',
          startTime: '00:00',
          endTime: '23:59',
        },
        {
          id: 'release',
          title: t.value.release,
          start: '2026-06-10',
          end: '2026-06-12',
          startTime: '00:00',
          endTime: '23:59',
        },
        {
          id: 'holiday',
          title: t.value.quarterly,
          start: '2026-06-08',
          end: '2026-06-08',
          startTime: '00:00',
          endTime: '23:59',
          allDay: true,
        },
        ...week(),
      ] as CalendarEvent[]),
    }),
    template: `
      <div style="height: 560px; padding: 16px">
        <VCalendar v-bind="args" v-model:events="events" />
      </div>
    `,
  }),
}

/**
 * A line is drawn across today's column at the time it is now, with a dot on its leading
 * edge, and it ticks at the top of each minute; `hideCurrentTime` leaves it out. This story
 * anchors itself on the real current day, so it is the one place the line can be seen.
 */
export const CurrentTime: Story = {
  args: { view: 'day', label: 'Current time' },
  render: (args) => ({
    components: { VCalendar },
    setup: () => {
      const at = new Date()
      const iso = `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`
      return { args, date: ref(iso), events: ref([]) }
    },
    template: `
      <div style="height: 520px; padding: 16px">
        <VCalendar v-bind="args" v-model:date="date" v-model:events="events" />
      </div>
    `,
  }),
}

/**
 * `dayStart` and `dayEnd` crop the grid to the hours that matter, and `weekdays` decides
 * which days appear at all — here a Monday-to-Friday week from eight in the morning.
 */
export const WorkingWeek: Story = {
  args: {
    weekdays: [1, 2, 3, 4, 5],
    dayStart: 8,
    dayEnd: 19,
    label: 'Working week',
  },
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({ args, events: ref(week()) }),
    template: `
      <div style="height: 520px; padding: 16px">
        <VCalendar v-bind="args" v-model:events="events" />
      </div>
    `,
  }),
}

/**
 * Events happening at once share the width of their day. They are grouped into clusters
 * first, so a crowded morning never narrows a lone afternoon meeting.
 */
export const Overlapping: Story = {
  args: { view: 'day', dayStart: 8, dayEnd: 18, label: 'Overlapping events' },
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({
      args,
      events: ref<CalendarEvent[]>([
        {
          id: '1',
          title: t.value.standup,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '09:00',
          endTime: '10:00',
        },
        {
          id: '2',
          title: t.value.review,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '09:30',
          endTime: '11:00',
        },
        {
          id: '3',
          title: t.value.interview,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '10:00',
          endTime: '10:30',
        },
        {
          id: '4',
          title: t.value.workshop,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '09:00',
          endTime: '09:30',
        },
        {
          id: '5',
          title: t.value.lunch,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '12:30',
          endTime: '13:30',
        },
      ]),
    }),
    template: `
      <div style="height: 520px; padding: 16px">
        <VCalendar v-bind="args" v-model:events="events" />
      </div>
    `,
  }),
}

/**
 * An event without a `color` takes a hue derived from its id, so it keeps the same colour
 * however the list is filtered or sorted. One with a `color` uses it for its edge and a
 * wash of its face — never underneath the title, which is what keeps an arbitrary value
 * readable in both themes.
 */
export const Colours: Story = {
  args: { view: 'day', dayStart: 8, dayEnd: 20, label: 'Event colours' },
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({
      args,
      events: ref<CalendarEvent[]>([
        {
          id: 'hue-1',
          title: t.value.standup,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '08:00',
          endTime: '09:00',
        },
        {
          id: 'hue-2',
          title: t.value.review,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '09:00',
          endTime: '10:00',
        },
        {
          id: 'hue-3',
          title: t.value.workshop,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '10:00',
          endTime: '11:00',
        },
        {
          id: 'hue-4',
          title: t.value.retro,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '11:00',
          endTime: '12:00',
        },
        {
          id: 'hue-5',
          title: t.value.lunch,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '12:00',
          endTime: '13:00',
        },
        {
          id: 'hue-6',
          title: t.value.interview,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '13:00',
          endTime: '14:00',
        },
        {
          id: 'hue-7',
          title: t.value.oneToOne,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '14:00',
          endTime: '15:00',
        },
        {
          id: 'custom',
          title: t.value.release,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '16:00',
          endTime: '18:00',
          color: '#7c3aed',
        },
      ]),
    }),
    template: `
      <div style="height: 560px; padding: 16px">
        <VCalendar v-bind="args" v-model:events="events" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Every card must be on screen when the accessibility check runs: it only ever audits
    // what a play function leaves rendered, and this is the calendar's one colour surface.
    const canvas = within(canvasElement)
    await waitFor(() => expect(canvas.getAllByRole('button', { name: /–/ })).toHaveLength(8))
  },
}

/** The `#event` slot replaces a card's content, with everything the card knows about it. */
export const EventSlot: Story = {
  args: { view: 'day', dayStart: 8, dayEnd: 18, label: 'Custom event content' },
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({
      args,
      t,
      events: ref<Booking[]>([
        {
          id: '1',
          title: t.value.review,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '10:00',
          endTime: '11:30',
          room: 'B2',
        },
        {
          id: '2',
          title: t.value.workshop,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '14:00',
          endTime: '16:00',
          room: 'A1',
        },
      ]),
    }),
    template: `
      <div style="height: 520px; padding: 16px">
        <VCalendar v-bind="args" v-model:events="events">
          <template #event="{ event, timeText }">
            <strong>{{ event.title }}</strong>
            <span style="font-size: 12px">{{ timeText }}</span>
            <span style="font-size: 12px; opacity: 0.8">{{ t.room }} {{ event.room }}</span>
          </template>
        </VCalendar>
      </div>
    `,
  }),
}

/**
 * Drag a card to move it, drag its bottom edge to change how long it lasts, and — this story
 * asking for `creatable` — press an empty stretch of a day to make an event there. The model
 * is written once, when the gesture ends, never while it is under way.
 */
export const Editing: Story = {
  args: {
    view: 'day',
    dayStart: 8,
    dayEnd: 18,
    scrollTime: '08:00',
    creatable: true,
    label: 'Editing',
  },
  render: (args) => ({
    components: { VCalendar },
    setup: () => {
      const events = ref<CalendarEvent[]>([
        {
          id: 'a',
          title: t.value.review,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '09:00',
          endTime: '10:00',
        },
      ])
      return { args, events, last: ref('—') }
    },
    template: `
      <div style="display: grid; gap: 12px; height: 520px; grid-template-rows: 1fr auto; padding: 16px">
        <VCalendar
          v-bind="args"
          v-model:events="events"
          @event-move="(e) => (last = e.startTime + '–' + e.endTime)"
          @event-resize="(e) => (last = e.startTime + '–' + e.endTime)"
        />
        <output>{{ last }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const card = canvas.getByRole('button', { name: /09:00|9:00/ })

    /*
     * A real browser lays the grid out, which is the whole reason this test is here rather
     * than in the unit suite: the geometry that turns a screen position into an hour cannot
     * be exercised anywhere that measures everything as zero.
     */
    const box = card.getBoundingClientRect()
    const from = { x: box.left + box.width / 2, y: box.top + 8 }
    const fire = (type: string, y: number) =>
      card.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          pointerId: 1,
          button: 0,
          clientX: from.x,
          clientY: y,
        }),
      )

    // Two hours further down the day, which at the default hour height is a real distance.
    fire('pointerdown', from.y)
    fire('pointermove', from.y + 40)
    fire('pointermove', from.y + box.height * 2)
    fire('pointerup', from.y + box.height * 2)

    await waitFor(() => expect(canvas.getByText(/^11:00–12:00$/)).toBeVisible())

    /*
     * Act two: the same gesture, let go OFF the calendar, which must write nothing at all.
     *
     * It runs here rather than in the unit suite for the same reason as act one — only a real
     * browser lays the view out, so only here is there an inside and an outside to be on. And it
     * follows act one deliberately: the event is at 11:00 by now, so what the revert has to
     * restore is the CURRENT value and not the one the story was written with.
     */
    const root = canvasElement.querySelector('.v-calendar-view')!
    const view = root.getBoundingClientRect()

    /*
     * The card is looked up AGAIN on every use, and the moves are sent to the root rather than
     * to it. A dragged card is re-rendered as it travels and the element is not the same one
     * afterwards, so a reference taken once goes stale mid-gesture — and an event dispatched on
     * a node that has left the document reaches no handler at all. The root is the element the
     * move and release handlers are bound to, and it is there for the whole story.
     */
    const dragged = () =>
      canvasElement.querySelector('.v-calendar-event:not([data-ghost])') as HTMLElement
    const at = (target: Element, type: string, x: number, y: number) =>
      target.dispatchEvent(
        new PointerEvent(type, { bubbles: true, pointerId: 1, button: 0, clientX: x, clientY: y }),
      )

    const centre = { x: view.left + view.width / 2, y: view.top + view.height / 2 }
    at(dragged(), 'pointerdown', centre.x, centre.y)
    at(root, 'pointermove', centre.x, centre.y + 40)
    /*
     * Off the TOP of the calendar, and deliberately centred on the other axis. Past a side would
     * be outside too, but it is also what asks the calendar to turn the page — the day would
     * change under the test and the event would no longer be on the one being shown. Above the
     * top only auto-scrolls, which leaves the card where it is.
     */
    at(root, 'pointermove', centre.x, view.top - 40)
    await waitFor(() => expect(dragged()).toHaveAttribute('data-rejected'))

    at(root, 'pointerup', centre.x, view.top - 40)
    /*
     * The output is what a consumer would have saved, so it still reading act one's move is the
     * assertion. Releasing before asserting matters for its own sake too: axe runs after this
     * function, and leaving a refused card on screen would put a translucent danger-coloured box
     * under the contrast rule for no benefit.
     */
    await waitFor(() => expect(dragged()).not.toHaveAttribute('data-rejected'))
    await waitFor(() => expect(canvas.getByText(/^11:00–12:00$/)).toBeVisible())
  },
}

/**
 * The same three gestures, without a pointer. `Enter` takes hold of an event, the arrows
 * move it and `Shift` with them changes when it ends, `Enter` places it and `Escape` puts it
 * back. Every step is announced.
 */
export const KeyboardEditing: Story = {
  args: { view: 'week', dayStart: 8, dayEnd: 18, label: 'Keyboard editing' },
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({
      args,
      events: ref<CalendarEvent[]>([
        {
          id: 'a',
          title: t.value.standup,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '09:00',
          endTime: '09:30',
        },
      ]),
    }),
    template: `
      <div style="height: 520px; padding: 16px">
        <VCalendar v-bind="args" v-model:events="events" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const card = canvas.getByRole('button', { name: new RegExp(t.value.standup) })

    card.focus()
    await userEvent.keyboard('{Enter}')
    // Taking hold must not ALSO press the button: the two would fire on one keystroke.
    await waitFor(() => expect(card).toHaveAttribute('data-grabbed'))

    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await userEvent.keyboard('{Enter}')

    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /9:30 AM – 10:00 AM/ })).toBeVisible(),
    )
  },
}

/**
 * Events move in the month view too — by whole days, keeping their length. Drag a chip onto
 * one of the greyed days of the neighbouring month to move it there, or hold it against the
 * left or right edge for a moment and the calendar turns the month with the chip still under
 * the pointer.
 */
export const MonthDragging: Story = {
  args: { view: 'month', views: ['month', 'day'], label: 'Dragging across months' },
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({
      args,
      view: ref('month'),
      date: ref(ANCHOR),
      events: ref<CalendarEvent[]>([
        {
          id: 'a',
          title: t.value.review,
          start: ANCHOR,
          end: ANCHOR,
          startTime: '10:00',
          endTime: '11:30',
        },
        {
          id: 'b',
          title: t.value.release,
          start: '2026-06-16',
          end: '2026-06-18',
          startTime: '00:00',
          endTime: '23:59',
        },
        {
          id: 'c',
          title: t.value.standup,
          start: '2026-06-24',
          end: '2026-06-24',
          startTime: '09:00',
          endTime: '09:15',
        },
      ]),
    }),
    template: `
      <div style="height: 620px; padding: 16px">
        <VCalendar v-bind="args" v-model:view="view" v-model:date="date" v-model:events="events" />
      </div>
    `,
  }),
}

/**
 * `locale` drives the day names and the clock, and takes precedence over the design
 * system's global one. Everything goes through `Intl`, which is available on the server.
 */
export const Localization: Story = {
  args: { view: '4days', dayStart: 8, dayEnd: 14, label: 'Localization' },
  render: (args) => ({
    components: { VCalendar },
    setup: () => ({ args, events: ref(week()) }),
    template: `
      <div style="display: grid; gap: 24px; padding: 16px">
        <div style="height: 300px"><VCalendar v-bind="args" locale="en-US" label="English" /></div>
        <div style="height: 300px"><VCalendar v-bind="args" locale="fr-FR" label="Français" /></div>
        <div style="height: 300px"><VCalendar v-bind="args" locale="ja-JP" label="日本語" /></div>
      </div>
    `,
  }),
}
