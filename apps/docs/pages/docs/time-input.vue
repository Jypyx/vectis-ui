<script setup lang="ts">
import api from '~/content/api/time-input'
import TimeInputBasic from '~/examples/time-input/Basic.vue'
import timeInputBasicSource from '~/examples/time-input/Basic.vue?raw'
import TimeInputClearable from '~/examples/time-input/Clearable.vue'
import timeInputClearableSource from '~/examples/time-input/Clearable.vue?raw'
import TimeInputLabelAndHint from '~/examples/time-input/LabelAndHint.vue'
import timeInputLabelAndHintSource from '~/examples/time-input/LabelAndHint.vue?raw'
import TimeInputLocalization from '~/examples/time-input/Localization.vue'
import timeInputLocalizationSource from '~/examples/time-input/Localization.vue?raw'
import TimeInputModes from '~/examples/time-input/Modes.vue'
import timeInputModesSource from '~/examples/time-input/Modes.vue?raw'
import TimeInputPlacement from '~/examples/time-input/Placement.vue'
import timeInputPlacementSource from '~/examples/time-input/Placement.vue?raw'
import TimeInputSizes from '~/examples/time-input/Sizes.vue'
import timeInputSizesSource from '~/examples/time-input/Sizes.vue?raw'
import TimeInputStates from '~/examples/time-input/States.vue'
import timeInputStatesSource from '~/examples/time-input/States.vue?raw'
import TimeInputSteps from '~/examples/time-input/Steps.vue'
import timeInputStepsSource from '~/examples/time-input/Steps.vue?raw'
import TimeInputTwelveHour from '~/examples/time-input/TwelveHour.vue'
import timeInputTwelveHourSource from '~/examples/time-input/TwelveHour.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('timeInput')
</script>

<template>
  <h1>{{ t('timeInput.title') }}</h1>
  <DocsProse class="vd-lead" keypath="timeInput.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="timeInputBasicSource" stack>
    <TimeInputBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="label-hint-and-icon">{{ t('timeInput.examples.labelAndHint.title') }}</h3>
  <DocsProse keypath="timeInput.examples.labelAndHint.text" />
  <DocsExample :source="timeInputLabelAndHintSource" stack>
    <TimeInputLabelAndHint />
  </DocsExample>

  <h3 id="sizes">{{ t('timeInput.examples.sizes.title') }}</h3>
  <DocsProse keypath="timeInput.examples.sizes.text" />
  <DocsExample :source="timeInputSizesSource" stack>
    <TimeInputSizes />
  </DocsExample>

  <h3 id="modes">{{ t('timeInput.examples.modes.title') }}</h3>
  <DocsProse keypath="timeInput.examples.modes.text" />
  <DocsExample :source="timeInputModesSource" stack>
    <TimeInputModes />
  </DocsExample>

  <h3 id="steps">{{ t('timeInput.examples.steps.title') }}</h3>
  <DocsProse keypath="timeInput.examples.steps.text" />
  <DocsExample :source="timeInputStepsSource" stack>
    <TimeInputSteps />
  </DocsExample>

  <h3 id="clearable">{{ t('timeInput.examples.clearable.title') }}</h3>
  <DocsProse keypath="timeInput.examples.clearable.text" />
  <DocsExample :source="timeInputClearableSource" stack>
    <TimeInputClearable />
  </DocsExample>

  <h3 id="states">{{ t('timeInput.examples.states.title') }}</h3>
  <DocsProse keypath="timeInput.examples.states.text" />
  <DocsExample :source="timeInputStatesSource" stack>
    <TimeInputStates />
  </DocsExample>

  <h3 id="twelve-hour">{{ t('timeInput.examples.twelveHour.title') }}</h3>
  <DocsProse keypath="timeInput.examples.twelveHour.text" />
  <DocsExample :source="timeInputTwelveHourSource" stack>
    <TimeInputTwelveHour />
  </DocsExample>

  <h3 id="localization">{{ t('timeInput.examples.localization.title') }}</h3>
  <DocsProse keypath="timeInput.examples.localization.text" />
  <DocsExample :source="timeInputLocalizationSource" stack>
    <TimeInputLocalization />
  </DocsExample>

  <h3 id="placement">{{ t('timeInput.examples.placement.title') }}</h3>
  <DocsProse keypath="timeInput.examples.placement.text" />
  <DocsExample :source="timeInputPlacementSource" stack>
    <TimeInputPlacement />
  </DocsExample>

  <DocsApi page="timeInput" :api="api" />
</template>
