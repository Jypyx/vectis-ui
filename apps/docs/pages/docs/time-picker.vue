<script setup lang="ts">
import api from '~/content/api/time-picker'
import TimePickerBasic from '~/examples/time-picker/Basic.vue'
import timePickerBasicSource from '~/examples/time-picker/Basic.vue?raw'
import TimePickerHourFormat from '~/examples/time-picker/HourFormat.vue'
import timePickerHourFormatSource from '~/examples/time-picker/HourFormat.vue?raw'
import TimePickerLocalization from '~/examples/time-picker/Localization.vue'
import timePickerLocalizationSource from '~/examples/time-picker/Localization.vue?raw'
import TimePickerRestrictions from '~/examples/time-picker/Restrictions.vue'
import timePickerRestrictionsSource from '~/examples/time-picker/Restrictions.vue?raw'
import TimePickerSteps from '~/examples/time-picker/Steps.vue'
import timePickerStepsSource from '~/examples/time-picker/Steps.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('timePicker')
</script>

<template>
  <h1>{{ t('timePicker.title') }}</h1>
  <DocsProse class="vd-lead" keypath="timePicker.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="timePickerBasicSource">
    <TimePickerBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="minute-step">{{ t('timePicker.examples.minuteStep.title') }}</h3>
  <DocsProse keypath="timePicker.examples.minuteStep.text" />
  <DocsExample :source="timePickerStepsSource">
    <TimePickerSteps />
  </DocsExample>

  <h3 id="restrictions">{{ t('timePicker.examples.restrictions.title') }}</h3>
  <DocsProse keypath="timePicker.examples.restrictions.text" />
  <DocsExample :source="timePickerRestrictionsSource">
    <TimePickerRestrictions />
  </DocsExample>

  <h3 id="hour-format">{{ t('timePicker.examples.hourFormat.title') }}</h3>
  <DocsProse keypath="timePicker.examples.hourFormat.text" />
  <DocsExample :source="timePickerHourFormatSource">
    <TimePickerHourFormat />
  </DocsExample>

  <h3 id="localization">{{ t('timePicker.examples.localization.title') }}</h3>
  <DocsProse keypath="timePicker.examples.localization.text" />
  <DocsExample :source="timePickerLocalizationSource">
    <TimePickerLocalization />
  </DocsExample>

  <DocsApi page="timePicker" :api="api" />
</template>
