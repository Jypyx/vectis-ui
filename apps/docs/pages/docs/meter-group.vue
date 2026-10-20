<script setup lang="ts">
import api from '~/content/api/meter-group'
import MeterGroupBasic from '~/examples/meter-group/Basic.vue'
import meterGroupBasicSource from '~/examples/meter-group/Basic.vue?raw'
import MeterGroupColours from '~/examples/meter-group/Colours.vue'
import meterGroupColoursSource from '~/examples/meter-group/Colours.vue?raw'
import MeterGroupOrientation from '~/examples/meter-group/Orientation.vue'
import meterGroupOrientationSource from '~/examples/meter-group/Orientation.vue?raw'
import MeterGroupOverflow from '~/examples/meter-group/Overflow.vue'
import meterGroupOverflowSource from '~/examples/meter-group/Overflow.vue?raw'
import MeterGroupSizes from '~/examples/meter-group/Sizes.vue'
import meterGroupSizesSource from '~/examples/meter-group/Sizes.vue?raw'
import MeterGroupSlots from '~/examples/meter-group/Slots.vue'
import meterGroupSlotsSource from '~/examples/meter-group/Slots.vue?raw'
import MeterGroupValues from '~/examples/meter-group/Values.vue'
import meterGroupValuesSource from '~/examples/meter-group/Values.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('meterGroup')
</script>

<template>
  <h1>{{ t('meterGroup.title') }}</h1>
  <DocsProse class="vd-lead" keypath="meterGroup.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="meterGroupBasicSource" stack>
    <MeterGroupBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="colours">{{ t('meterGroup.examples.colours.title') }}</h3>
  <DocsProse keypath="meterGroup.examples.colours.text" />
  <DocsExample :source="meterGroupColoursSource" stack>
    <MeterGroupColours />
  </DocsExample>

  <h3 id="values">{{ t('meterGroup.examples.values.title') }}</h3>
  <DocsProse keypath="meterGroup.examples.values.text" />
  <DocsExample :source="meterGroupValuesSource" stack>
    <MeterGroupValues />
  </DocsExample>

  <h3 id="overflow">{{ t('meterGroup.examples.overflow.title') }}</h3>
  <DocsProse keypath="meterGroup.examples.overflow.text" />
  <DocsExample :source="meterGroupOverflowSource" stack>
    <MeterGroupOverflow />
  </DocsExample>

  <h3 id="slots">{{ t('meterGroup.examples.slots.title') }}</h3>
  <DocsProse keypath="meterGroup.examples.slots.text" />
  <DocsExample :source="meterGroupSlotsSource" stack>
    <MeterGroupSlots />
  </DocsExample>

  <h3 id="sizes">{{ t('meterGroup.examples.sizes.title') }}</h3>
  <DocsProse keypath="meterGroup.examples.sizes.text" />
  <DocsExample :source="meterGroupSizesSource" stack>
    <MeterGroupSizes />
  </DocsExample>

  <h3 id="orientation">{{ t('meterGroup.examples.orientation.title') }}</h3>
  <DocsProse keypath="meterGroup.examples.orientation.text" />
  <DocsExample :source="meterGroupOrientationSource" stack>
    <MeterGroupOrientation />
  </DocsExample>

  <DocsApi page="meterGroup" :api="api" />
</template>
