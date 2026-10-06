<script setup lang="ts">
import api from '~/content/api/meter'
import MeterBasic from '~/examples/meter/Basic.vue'
import meterBasicSource from '~/examples/meter/Basic.vue?raw'
import MeterHiddenText from '~/examples/meter/HiddenText.vue'
import meterHiddenTextSource from '~/examples/meter/HiddenText.vue?raw'
import MeterRegions from '~/examples/meter/Regions.vue'
import meterRegionsSource from '~/examples/meter/Regions.vue?raw'
import MeterSegments from '~/examples/meter/Segments.vue'
import meterSegmentsSource from '~/examples/meter/Segments.vue?raw'
import MeterSizes from '~/examples/meter/Sizes.vue'
import meterSizesSource from '~/examples/meter/Sizes.vue?raw'
import MeterTones from '~/examples/meter/Tones.vue'
import meterTonesSource from '~/examples/meter/Tones.vue?raw'
import MeterValueText from '~/examples/meter/ValueText.vue'
import meterValueTextSource from '~/examples/meter/ValueText.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('meter')
</script>

<template>
  <h1>{{ t('meter.title') }}</h1>
  <DocsProse class="vd-lead" keypath="meter.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="meterBasicSource" stack>
    <MeterBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="regions">{{ t('meter.examples.regions.title') }}</h3>
  <DocsProse keypath="meter.examples.regions.text" />
  <DocsExample :source="meterRegionsSource" stack>
    <MeterRegions />
  </DocsExample>

  <h3 id="tones">{{ t('meter.examples.tones.title') }}</h3>
  <DocsProse keypath="meter.examples.tones.text" />
  <DocsExample :source="meterTonesSource" stack>
    <MeterTones />
  </DocsExample>

  <h3 id="value">{{ t('meter.examples.valueText.title') }}</h3>
  <DocsProse keypath="meter.examples.valueText.text" />
  <DocsExample :source="meterValueTextSource" stack>
    <MeterValueText />
  </DocsExample>

  <h3 id="segments">{{ t('meter.examples.segments.title') }}</h3>
  <DocsProse keypath="meter.examples.segments.text" />
  <DocsExample :source="meterSegmentsSource" stack>
    <MeterSegments />
  </DocsExample>

  <h3 id="sizes">{{ t('meter.examples.sizes.title') }}</h3>
  <DocsProse keypath="meter.examples.sizes.text" />
  <DocsExample :source="meterSizesSource" stack>
    <MeterSizes />
  </DocsExample>

  <h3 id="hidden-text">{{ t('meter.examples.hiddenText.title') }}</h3>
  <DocsProse keypath="meter.examples.hiddenText.text" />
  <DocsExample :source="meterHiddenTextSource" stack>
    <MeterHiddenText />
  </DocsExample>

  <DocsApi page="meter" :api="api" />
</template>
