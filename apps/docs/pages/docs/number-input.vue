<script setup lang="ts">
import api from '~/content/api/number-input'
import NumberInputBasic from '~/examples/number-input/Basic.vue'
import numberInputBasicSource from '~/examples/number-input/Basic.vue?raw'
import NumberInputControls from '~/examples/number-input/Controls.vue'
import numberInputControlsSource from '~/examples/number-input/Controls.vue?raw'
import NumberInputFormatting from '~/examples/number-input/Formatting.vue'
import numberInputFormattingSource from '~/examples/number-input/Formatting.vue?raw'
import NumberInputStep from '~/examples/number-input/Step.vue'
import numberInputStepSource from '~/examples/number-input/Step.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('numberInput')
</script>

<template>
  <h1>{{ t('numberInput.title') }}</h1>
  <DocsProse class="vd-lead" keypath="numberInput.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="numberInputBasicSource">
    <NumberInputBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="controls">{{ t('numberInput.examples.controls.title') }}</h3>
  <DocsProse keypath="numberInput.examples.controls.text" />
  <DocsExample :source="numberInputControlsSource">
    <NumberInputControls />
  </DocsExample>

  <h3 id="formatting">{{ t('numberInput.examples.formatting.title') }}</h3>
  <DocsProse keypath="numberInput.examples.formatting.text" />
  <DocsExample :source="numberInputFormattingSource">
    <NumberInputFormatting />
  </DocsExample>

  <h3 id="step">{{ t('numberInput.examples.step.title') }}</h3>
  <DocsProse keypath="numberInput.examples.step.text" />
  <DocsExample :source="numberInputStepSource">
    <NumberInputStep />
  </DocsExample>

  <DocsApi page="number-input" :api="api" />
</template>
