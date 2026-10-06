<script setup lang="ts">
import api from '~/content/api/color-picker'
import ColorPickerBasic from '~/examples/color-picker/Basic.vue'
import colorPickerBasicSource from '~/examples/color-picker/Basic.vue?raw'
import ColorPickerFormats from '~/examples/color-picker/Formats.vue'
import colorPickerFormatsSource from '~/examples/color-picker/Formats.vue?raw'
import ColorPickerAlpha from '~/examples/color-picker/Alpha.vue'
import colorPickerAlphaSource from '~/examples/color-picker/Alpha.vue?raw'
import ColorPickerSwatches from '~/examples/color-picker/Swatches.vue'
import colorPickerSwatchesSource from '~/examples/color-picker/Swatches.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('colorPicker')
</script>

<template>
  <h1>{{ t('colorPicker.title') }}</h1>
  <DocsProse class="vd-lead" keypath="colorPicker.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="colorPickerBasicSource">
    <ColorPickerBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="formats">{{ t('colorPicker.examples.formats.title') }}</h3>
  <DocsProse keypath="colorPicker.examples.formats.text" />
  <DocsExample :source="colorPickerFormatsSource">
    <ColorPickerFormats />
  </DocsExample>

  <h3 id="opacity">{{ t('colorPicker.examples.alpha.title') }}</h3>
  <DocsProse keypath="colorPicker.examples.alpha.text" />
  <DocsExample :source="colorPickerAlphaSource">
    <ColorPickerAlpha />
  </DocsExample>

  <h3 id="swatches">{{ t('colorPicker.examples.swatches.title') }}</h3>
  <DocsProse keypath="colorPicker.examples.swatches.text" />
  <DocsExample :source="colorPickerSwatchesSource">
    <ColorPickerSwatches />
  </DocsExample>

  <DocsApi page="colorPicker" :api="api" />
</template>
