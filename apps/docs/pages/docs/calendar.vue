<script setup lang="ts">
import api from '~/content/api/calendar'
import CalendarAllDay from '~/examples/calendar/AllDay.vue'
import calendarAllDaySource from '~/examples/calendar/AllDay.vue?raw'
import CalendarBasic from '~/examples/calendar/Basic.vue'
import calendarBasicSource from '~/examples/calendar/Basic.vue?raw'
import CalendarColours from '~/examples/calendar/Colours.vue'
import calendarColoursSource from '~/examples/calendar/Colours.vue?raw'
import CalendarCustomView from '~/examples/calendar/CustomView.vue'
import calendarCustomViewSource from '~/examples/calendar/CustomView.vue?raw'
import CalendarEventSlot from '~/examples/calendar/EventSlot.vue'
import calendarEventSlotSource from '~/examples/calendar/EventSlot.vue?raw'
import CalendarMonth from '~/examples/calendar/Month.vue'
import calendarMonthSource from '~/examples/calendar/Month.vue?raw'
import CalendarOverlapping from '~/examples/calendar/Overlapping.vue'
import calendarOverlappingSource from '~/examples/calendar/Overlapping.vue?raw'
import CalendarWeekdays from '~/examples/calendar/Weekdays.vue'
import calendarWeekdaysSource from '~/examples/calendar/Weekdays.vue?raw'
import CalendarYear from '~/examples/calendar/Year.vue'
import calendarYearSource from '~/examples/calendar/Year.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('calendar.title') })
</script>

<template>
  <h1>{{ t('calendar.title') }}</h1>
  <DocsProse class="vd-lead" keypath="calendar.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="calendarBasicSource" stack>
    <CalendarBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="month">{{ t('calendar.examples.month.title') }}</h3>
  <DocsProse keypath="calendar.examples.month.text" />
  <DocsExample :source="calendarMonthSource" stack>
    <CalendarMonth />
  </DocsExample>

  <h3 id="year">{{ t('calendar.examples.year.title') }}</h3>
  <DocsProse keypath="calendar.examples.year.text" />
  <DocsExample :source="calendarYearSource" stack>
    <CalendarYear />
  </DocsExample>

  <h3 id="custom-view">{{ t('calendar.examples.customView.title') }}</h3>
  <DocsProse keypath="calendar.examples.customView.text" />
  <DocsExample :source="calendarCustomViewSource" stack>
    <CalendarCustomView />
  </DocsExample>

  <h3 id="which-days-are-shown">{{ t('calendar.examples.weekdays.title') }}</h3>
  <DocsProse keypath="calendar.examples.weekdays.text" />
  <DocsExample :source="calendarWeekdaysSource" stack>
    <CalendarWeekdays />
  </DocsExample>

  <h3 id="all-day-events">{{ t('calendar.examples.allDay.title') }}</h3>
  <DocsProse keypath="calendar.examples.allDay.text" />
  <DocsExample :source="calendarAllDaySource" stack>
    <CalendarAllDay />
  </DocsExample>

  <h3 id="overlapping-events">{{ t('calendar.examples.overlapping.title') }}</h3>
  <DocsProse keypath="calendar.examples.overlapping.text" />
  <DocsExample :source="calendarOverlappingSource" stack>
    <CalendarOverlapping />
  </DocsExample>

  <h3 id="colours">{{ t('calendar.examples.colours.title') }}</h3>
  <DocsProse keypath="calendar.examples.colours.text" />
  <DocsExample :source="calendarColoursSource" stack>
    <CalendarColours />
  </DocsExample>

  <h3 id="custom-event-content">{{ t('calendar.examples.eventSlot.title') }}</h3>
  <DocsProse keypath="calendar.examples.eventSlot.text" />
  <DocsExample :source="calendarEventSlotSource" stack>
    <CalendarEventSlot />
  </DocsExample>

  <DocsApi page="calendar" :api="api" />
</template>
