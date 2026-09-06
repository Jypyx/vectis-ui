<script setup lang="ts">
import api from '~/content/api/radio'
import RadioBasic from '~/examples/radio/Basic.vue'
import radioBasicSource from '~/examples/radio/Basic.vue?raw'
import RadioDisabled from '~/examples/radio/Disabled.vue'
import radioDisabledSource from '~/examples/radio/Disabled.vue?raw'
import RadioLabelPosition from '~/examples/radio/LabelPosition.vue'
import radioLabelPositionSource from '~/examples/radio/LabelPosition.vue?raw'
import RadioSpread from '~/examples/radio/Spread.vue'
import radioSpreadSource from '~/examples/radio/Spread.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('radio')
</script>

<template>
  <h1>{{ t('radio.title') }}</h1>
  <DocsProse class="vd-lead" keypath="radio.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="radioBasicSource" stack>
    <RadioBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="label-position">{{ t('radio.examples.labelPosition.title') }}</h3>
  <DocsProse keypath="radio.examples.labelPosition.text" />
  <DocsExample :source="radioLabelPositionSource" stack>
    <RadioLabelPosition />
  </DocsExample>

  <h3 id="spread">{{ t('radio.examples.spread.title') }}</h3>
  <DocsProse keypath="radio.examples.spread.text" />
  <DocsExample :source="radioSpreadSource" stack>
    <RadioSpread />
  </DocsExample>

  <h3 id="disabled">{{ t('radio.examples.disabled.title') }}</h3>
  <DocsProse keypath="radio.examples.disabled.text" />
  <DocsExample :source="radioDisabledSource" stack>
    <RadioDisabled />
  </DocsExample>

  <DocsApi page="radio" :api="api" />
</template>
