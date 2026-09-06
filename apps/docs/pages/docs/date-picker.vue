<script setup lang="ts">
import api from '~/content/api/date-picker'
import DatePickerAdjacentDays from '~/examples/date-picker/AdjacentDays.vue'
import datePickerAdjacentDaysSource from '~/examples/date-picker/AdjacentDays.vue?raw'
import DatePickerBasic from '~/examples/date-picker/Basic.vue'
import datePickerBasicSource from '~/examples/date-picker/Basic.vue?raw'
import DatePickerBounds from '~/examples/date-picker/Bounds.vue'
import datePickerBoundsSource from '~/examples/date-picker/Bounds.vue?raw'
import DatePickerDisabledDates from '~/examples/date-picker/DisabledDates.vue'
import datePickerDisabledDatesSource from '~/examples/date-picker/DisabledDates.vue?raw'
import DatePickerEvents from '~/examples/date-picker/Events.vue'
import datePickerEventsSource from '~/examples/date-picker/Events.vue?raw'
import DatePickerLocalization from '~/examples/date-picker/Localization.vue'
import datePickerLocalizationSource from '~/examples/date-picker/Localization.vue?raw'
import DatePickerMultiple from '~/examples/date-picker/Multiple.vue'
import datePickerMultipleSource from '~/examples/date-picker/Multiple.vue?raw'
import DatePickerPresets from '~/examples/date-picker/Presets.vue'
import datePickerPresetsSource from '~/examples/date-picker/Presets.vue?raw'
import DatePickerRange from '~/examples/date-picker/Range.vue'
import datePickerRangeSource from '~/examples/date-picker/Range.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('datePicker')
</script>

<template>
  <h1>{{ t('datePicker.title') }}</h1>
  <DocsProse class="vd-lead" keypath="datePicker.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="datePickerBasicSource">
    <DatePickerBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="range">{{ t('datePicker.examples.range.title') }}</h3>
  <DocsProse keypath="datePicker.examples.range.text" />
  <DocsExample :source="datePickerRangeSource">
    <DatePickerRange />
  </DocsExample>

  <h3 id="multiple">{{ t('datePicker.examples.multiple.title') }}</h3>
  <DocsProse keypath="datePicker.examples.multiple.text" />
  <DocsExample :source="datePickerMultipleSource">
    <DatePickerMultiple />
  </DocsExample>

  <h3 id="presets">{{ t('datePicker.examples.presets.title') }}</h3>
  <DocsProse keypath="datePicker.examples.presets.text" />
  <DocsExample :source="datePickerPresetsSource">
    <DatePickerPresets />
  </DocsExample>

  <h3 id="disabled-dates">{{ t('datePicker.examples.disabledDates.title') }}</h3>
  <DocsProse keypath="datePicker.examples.disabledDates.text" />
  <DocsExample :source="datePickerDisabledDatesSource">
    <DatePickerDisabledDates />
  </DocsExample>

  <h3 id="bounds">{{ t('datePicker.examples.bounds.title') }}</h3>
  <DocsProse keypath="datePicker.examples.bounds.text" />
  <DocsExample :source="datePickerBoundsSource">
    <DatePickerBounds />
  </DocsExample>

  <h3 id="event-dots">{{ t('datePicker.examples.events.title') }}</h3>
  <DocsProse keypath="datePicker.examples.events.text" />
  <DocsExample :source="datePickerEventsSource">
    <DatePickerEvents />
  </DocsExample>

  <h3 id="adjacent-days">{{ t('datePicker.examples.adjacentDays.title') }}</h3>
  <DocsProse keypath="datePicker.examples.adjacentDays.text" />
  <DocsExample :source="datePickerAdjacentDaysSource">
    <DatePickerAdjacentDays />
  </DocsExample>

  <h3 id="localization">{{ t('datePicker.examples.localization.title') }}</h3>
  <DocsProse keypath="datePicker.examples.localization.text" />
  <DocsExample :source="datePickerLocalizationSource">
    <DatePickerLocalization />
  </DocsExample>

  <DocsApi page="datePicker" :api="api" />
</template>
