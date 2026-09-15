<script setup lang="ts">
import { computed, reactive, ref, useId } from 'vue'
import {
  VButton,
  VCalendar,
  VDateInput,
  VDialog,
  VInput,
  VSwitch,
  VTextarea,
  VTimeInput,
  type CalendarCell,
  type CalendarEvent,
  type CalendarEventId,
  type CalendarEventTimes,
  type CalendarView,
} from 'vectis-ui'

const view = ref<CalendarView>('week')
const anchor = ref('2026-06-10')

const events = ref<CalendarEvent[]>([
  {
    id: 'standup',
    title: 'Standup',
    start: '2026-06-08',
    end: '2026-06-08',
    startTime: '09:00',
    endTime: '09:15',
  },
  {
    id: 'review',
    title: 'Design review',
    start: '2026-06-10',
    end: '2026-06-10',
    startTime: '14:00',
    endTime: '15:30',
    description: 'With Anna and Ravi',
  },
])

let nextId = 1

/** What the form edits: a copy, so Cancel leaves the calendar as it was. */
interface Draft {
  title: string
  allDay: boolean
  start: string | null
  startTime: string | null
  end: string | null
  endTime: string | null
  description: string
}

const open = ref(false)
const formId = useId()
/** The event being edited, or null while a new one is being written. */
const editingId = ref<CalendarEventId | null>(null)
const draft = reactive<Draft>(emptyDraft())

function emptyDraft(): Draft {
  return {
    title: '',
    allDay: false,
    start: null,
    startTime: null,
    end: null,
    endTime: null,
    description: '',
  }
}

/** A local date and time moved by some minutes, crossing midnight when it has to. */
function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const moved = new Date(`${date}T${time}:00`)
  moved.setMinutes(moved.getMinutes() + minutes)
  const two = (part: number) => String(part).padStart(2, '0')
  return {
    date: `${moved.getFullYear()}-${two(moved.getMonth() + 1)}-${two(moved.getDate())}`,
    time: `${two(moved.getHours())}:${two(moved.getMinutes())}`,
  }
}

function openNew(times: CalendarEventTimes) {
  Object.assign(draft, emptyDraft(), times)
  editingId.value = null
  open.value = true
}

/* A drawn-out slot already has both ends. */
function onEventCreate(times: CalendarEventTimes) {
  openNew(times)
}

/* A clicked cell only has a start, so the event is given an hour. A day of the month view
   reports the hour the grid starts at, midnight here, which is a poor default for a meeting. */
function onCellActivate(cell: CalendarCell) {
  const startTime = view.value === 'month' ? '09:00' : cell.time
  const end = addMinutes(cell.date, startTime, 60)
  openNew({ start: cell.date, startTime, end: end.date, endTime: end.time })
}

/* The toolbar button has neither, and starts on the day the calendar is showing. */
function onNewClick() {
  openNew({ start: anchor.value, startTime: '09:00', end: anchor.value, endTime: '10:00' })
}

function onEventActivate(event: CalendarEvent) {
  Object.assign(draft, {
    title: event.title,
    allDay: event.allDay ?? false,
    start: event.start,
    startTime: event.startTime,
    end: event.end,
    endTime: event.endTime,
    description: event.description ?? '',
  })
  editingId.value = event.id
  open.value = true
}

/* ISO dates and 24-hour times compare correctly as strings, so no Date is needed here. */
const endsBeforeStart = computed(() => {
  if (!draft.start || !draft.end) return false
  if (draft.allDay) return draft.end < draft.start
  if (!draft.startTime || !draft.endTime) return false
  return `${draft.end} ${draft.endTime}` <= `${draft.start} ${draft.startTime}`
})

function save() {
  // `required` has the browser refuse empty fields before this runs. What it cannot know is
  // whether the end comes after the start, or that a title made of spaces is no title.
  const title = draft.title.trim()
  // The contract always wants times: an all-day event spans the whole of its days.
  const startTime = draft.allDay ? '00:00' : draft.startTime
  const endTime = draft.allDay ? '23:59' : draft.endTime
  if (!title || !draft.start || !draft.end || !startTime || !endTime) return
  if (endsBeforeStart.value) return

  const saved: CalendarEvent = {
    id: editingId.value ?? `event-${nextId++}`,
    title,
    start: draft.start,
    end: draft.end,
    startTime,
    endTime,
    allDay: draft.allDay || undefined,
    description: draft.description.trim() || undefined,
  }

  // A new array rather than a push: the calendar is handed a list and never mutates it.
  events.value =
    editingId.value === null
      ? [...events.value, saved]
      : events.value.map((event) => (event.id === saved.id ? saved : event))
  open.value = false
}

function remove() {
  events.value = events.value.filter((event) => event.id !== editingId.value)
  open.value = false
}
</script>

<template>
  <VCalendar
    v-model:view="view"
    v-model:date="anchor"
    v-model:events="events"
    creatable
    :views="['day', 'week', 'month']"
    :day-start="7"
    :day-end="20"
    label="Editable schedule"
    class="calendar"
    @event-create="onEventCreate"
    @cell-activate="onCellActivate"
    @event-activate="onEventActivate"
  >
    <template #actions>
      <VButton size="sm" @click="onNewClick">New event</VButton>
    </template>
  </VCalendar>

  <!-- Closing the dialog hands the focus back to whatever opened it: the card, the cell or
       the button. The form lives in the body and its buttons in the footer, so the submit
       button reaches it through the `form` attribute. -->
  <VDialog
    v-model:open="open"
    :title="editingId === null ? 'New event' : 'Edit event'"
    width="32rem"
  >
    <form :id="formId" class="form" @submit.prevent="save">
      <VInput v-model="draft.title" label="Title" required />

      <VSwitch v-model="draft.allDay" label="All day" class="all-day" />

      <div class="row">
        <VDateInput v-model="draft.start" label="Start date" show-picker required />
        <VTimeInput
          v-if="!draft.allDay"
          v-model="draft.startTime"
          label="Start time"
          :minute-step="15"
          required
        />
      </div>

      <div class="row">
        <VDateInput
          v-model="draft.end"
          label="End date"
          show-picker
          required
          :invalid="endsBeforeStart"
          :hint="endsBeforeStart ? 'The event has to end after it starts.' : undefined"
        />
        <VTimeInput
          v-if="!draft.allDay"
          v-model="draft.endTime"
          label="End time"
          :minute-step="15"
          required
          :invalid="endsBeforeStart"
        />
      </div>

      <VTextarea v-model="draft.description" label="Description" :rows="3" />
    </form>

    <template #footer>
      <VButton
        v-if="editingId !== null"
        class="delete"
        variant="ghost"
        tone="danger"
        @click="remove"
      >
        Delete
      </VButton>
      <VButton variant="ghost" tone="neutral" @click="open = false">Cancel</VButton>
      <VButton type="submit" :form="formId">Save</VButton>
    </template>
  </VDialog>
</template>

<style scoped>
.calendar {
  block-size: 34rem;
}

.form {
  display: grid;
  gap: var(--vectis-space-4);
}

/* A grid item stretches by default, which would push the label away from its switch. */
.all-day {
  justify-self: start;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--vectis-space-3);
  align-items: start;
}

/* Pushed to the other end of the footer, away from the button that saves. */
.delete {
  margin-inline-end: auto;
}
</style>
