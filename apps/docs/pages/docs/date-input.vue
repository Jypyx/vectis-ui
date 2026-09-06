<script setup lang="ts">
import api from '~/content/api/date-input'
import DateInputAdjacentDays from '~/examples/date-input/AdjacentDays.vue'
import dateInputAdjacentDaysSource from '~/examples/date-input/AdjacentDays.vue?raw'
import DateInputBasic from '~/examples/date-input/Basic.vue'
import dateInputBasicSource from '~/examples/date-input/Basic.vue?raw'
import DateInputBounds from '~/examples/date-input/Bounds.vue'
import dateInputBoundsSource from '~/examples/date-input/Bounds.vue?raw'
import DateInputClearable from '~/examples/date-input/Clearable.vue'
import dateInputClearableSource from '~/examples/date-input/Clearable.vue?raw'
import DateInputCustomDay from '~/examples/date-input/CustomDay.vue'
import dateInputCustomDaySource from '~/examples/date-input/CustomDay.vue?raw'
import DateInputEvents from '~/examples/date-input/Events.vue'
import dateInputEventsSource from '~/examples/date-input/Events.vue?raw'
import DateInputLabelAndHint from '~/examples/date-input/LabelAndHint.vue'
import dateInputLabelAndHintSource from '~/examples/date-input/LabelAndHint.vue?raw'
import DateInputLocalization from '~/examples/date-input/Localization.vue'
import dateInputLocalizationSource from '~/examples/date-input/Localization.vue?raw'
import DateInputModes from '~/examples/date-input/Modes.vue'
import dateInputModesSource from '~/examples/date-input/Modes.vue?raw'
import DateInputMultiple from '~/examples/date-input/Multiple.vue'
import dateInputMultipleSource from '~/examples/date-input/Multiple.vue?raw'
import DateInputPlacement from '~/examples/date-input/Placement.vue'
import dateInputPlacementSource from '~/examples/date-input/Placement.vue?raw'
import DateInputPresets from '~/examples/date-input/Presets.vue'
import dateInputPresetsSource from '~/examples/date-input/Presets.vue?raw'
import DateInputRange from '~/examples/date-input/Range.vue'
import dateInputRangeSource from '~/examples/date-input/Range.vue?raw'
import DateInputSizes from '~/examples/date-input/Sizes.vue'
import dateInputSizesSource from '~/examples/date-input/Sizes.vue?raw'
import DateInputStates from '~/examples/date-input/States.vue'
import dateInputStatesSource from '~/examples/date-input/States.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('dateInput')
</script>

<template>
  <h1>{{ t('dateInput.title') }}</h1>
  <DocsProse class="vd-lead" keypath="dateInput.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="dateInputBasicSource" stack>
    <DateInputBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="label-hint-and-icon">{{ t('dateInput.examples.labelAndHint.title') }}</h3>
  <DocsProse keypath="dateInput.examples.labelAndHint.text" />
  <DocsExample :source="dateInputLabelAndHintSource" stack>
    <DateInputLabelAndHint />
  </DocsExample>

  <h3 id="sizes">{{ t('dateInput.examples.sizes.title') }}</h3>
  <DocsProse keypath="dateInput.examples.sizes.text" />
  <DocsExample :source="dateInputSizesSource" stack>
    <DateInputSizes />
  </DocsExample>

  <h3 id="modes">{{ t('dateInput.examples.modes.title') }}</h3>
  <DocsProse keypath="dateInput.examples.modes.text" />
  <DocsExample :source="dateInputModesSource" stack>
    <DateInputModes />
  </DocsExample>

  <h3 id="range">{{ t('dateInput.examples.range.title') }}</h3>
  <DocsProse keypath="dateInput.examples.range.text" />
  <DocsExample :source="dateInputRangeSource" stack>
    <DateInputRange />
  </DocsExample>

  <h3 id="multiple">{{ t('dateInput.examples.multiple.title') }}</h3>
  <DocsProse keypath="dateInput.examples.multiple.text" />
  <DocsExample :source="dateInputMultipleSource" stack>
    <DateInputMultiple />
  </DocsExample>

  <h3 id="presets">{{ t('dateInput.examples.presets.title') }}</h3>
  <DocsProse keypath="dateInput.examples.presets.text" />
  <DocsExample :source="dateInputPresetsSource" stack>
    <DateInputPresets />
  </DocsExample>

  <h3 id="bounds">{{ t('dateInput.examples.bounds.title') }}</h3>
  <DocsProse keypath="dateInput.examples.bounds.text" />
  <DocsExample :source="dateInputBoundsSource" stack>
    <DateInputBounds />
  </DocsExample>

  <h3 id="event-dots">{{ t('dateInput.examples.events.title') }}</h3>
  <DocsProse keypath="dateInput.examples.events.text" />
  <DocsExample :source="dateInputEventsSource" stack>
    <DateInputEvents />
  </DocsExample>

  <h3 id="custom-days">{{ t('dateInput.examples.customDay.title') }}</h3>
  <DocsProse keypath="dateInput.examples.customDay.text" />
  <DocsExample :source="dateInputCustomDaySource" stack>
    <DateInputCustomDay />
  </DocsExample>

  <h3 id="clearable">{{ t('dateInput.examples.clearable.title') }}</h3>
  <DocsProse keypath="dateInput.examples.clearable.text" />
  <DocsExample :source="dateInputClearableSource" stack>
    <DateInputClearable />
  </DocsExample>

  <h3 id="adjacent-days">{{ t('dateInput.examples.adjacentDays.title') }}</h3>
  <DocsProse keypath="dateInput.examples.adjacentDays.text" />
  <DocsExample :source="dateInputAdjacentDaysSource" stack>
    <DateInputAdjacentDays />
  </DocsExample>

  <h3 id="states">{{ t('dateInput.examples.states.title') }}</h3>
  <DocsProse keypath="dateInput.examples.states.text" />
  <DocsExample :source="dateInputStatesSource" stack>
    <DateInputStates />
  </DocsExample>

  <h3 id="localization">{{ t('dateInput.examples.localization.title') }}</h3>
  <DocsProse keypath="dateInput.examples.localization.text" />
  <DocsExample :source="dateInputLocalizationSource" stack>
    <DateInputLocalization />
  </DocsExample>

  <h3 id="placement">{{ t('dateInput.examples.placement.title') }}</h3>
  <DocsProse keypath="dateInput.examples.placement.text" />
  <DocsExample :source="dateInputPlacementSource" stack>
    <DateInputPlacement />
  </DocsExample>

  <DocsApi page="dateInput" :api="api" />
</template>
