<script setup lang="ts">
import api from '~/content/api/color-input'
import ColorInputBasic from '~/examples/color-input/Basic.vue'
import colorInputBasicSource from '~/examples/color-input/Basic.vue?raw'
import ColorInputFormats from '~/examples/color-input/Formats.vue'
import colorInputFormatsSource from '~/examples/color-input/Formats.vue?raw'
import ColorInputAlphaAndSwatches from '~/examples/color-input/AlphaAndSwatches.vue'
import colorInputAlphaAndSwatchesSource from '~/examples/color-input/AlphaAndSwatches.vue?raw'
import ColorInputClearable from '~/examples/color-input/Clearable.vue'
import colorInputClearableSource from '~/examples/color-input/Clearable.vue?raw'
import ColorInputValidation from '~/examples/color-input/Validation.vue'
import colorInputValidationSource from '~/examples/color-input/Validation.vue?raw'
import ColorInputSizes from '~/examples/color-input/Sizes.vue'
import colorInputSizesSource from '~/examples/color-input/Sizes.vue?raw'
import ColorInputStates from '~/examples/color-input/States.vue'
import colorInputStatesSource from '~/examples/color-input/States.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('colorInput')
</script>

<template>
  <h1>{{ t('colorInput.title') }}</h1>
  <DocsProse class="vd-lead" keypath="colorInput.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="colorInputBasicSource">
    <ColorInputBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="formats">{{ t('colorInput.examples.formats.title') }}</h3>
  <DocsProse keypath="colorInput.examples.formats.text" />
  <DocsExample :source="colorInputFormatsSource">
    <ColorInputFormats />
  </DocsExample>

  <h3 id="opacity-and-swatches">{{ t('colorInput.examples.alphaAndSwatches.title') }}</h3>
  <DocsProse keypath="colorInput.examples.alphaAndSwatches.text" />
  <DocsExample :source="colorInputAlphaAndSwatchesSource">
    <ColorInputAlphaAndSwatches />
  </DocsExample>

  <h3 id="clearable">{{ t('colorInput.examples.clearable.title') }}</h3>
  <DocsProse keypath="colorInput.examples.clearable.text" />
  <DocsExample :source="colorInputClearableSource">
    <ColorInputClearable />
  </DocsExample>

  <h3 id="validation">{{ t('colorInput.examples.validation.title') }}</h3>
  <DocsProse keypath="colorInput.examples.validation.text" />
  <DocsExample :source="colorInputValidationSource">
    <ColorInputValidation />
  </DocsExample>

  <h3 id="sizes">{{ t('colorInput.examples.sizes.title') }}</h3>
  <DocsProse keypath="colorInput.examples.sizes.text" />
  <DocsExample :source="colorInputSizesSource">
    <ColorInputSizes />
  </DocsExample>

  <h3 id="read-only-and-disabled">{{ t('colorInput.examples.states.title') }}</h3>
  <DocsProse keypath="colorInput.examples.states.text" />
  <DocsExample :source="colorInputStatesSource">
    <ColorInputStates />
  </DocsExample>

  <DocsApi page="colorInput" :api="api" />
</template>
