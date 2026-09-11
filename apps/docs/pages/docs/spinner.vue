<script setup lang="ts">
import api from '~/content/api/spinner'
import SpinnerBasic from '~/examples/spinner/Basic.vue'
import spinnerBasicSource from '~/examples/spinner/Basic.vue?raw'
import SpinnerColour from '~/examples/spinner/Colour.vue'
import spinnerColourSource from '~/examples/spinner/Colour.vue?raw'
import SpinnerInPlaceOfAnIcon from '~/examples/spinner/InPlaceOfAnIcon.vue'
import spinnerInPlaceOfAnIconSource from '~/examples/spinner/InPlaceOfAnIcon.vue?raw'
import SpinnerSizes from '~/examples/spinner/Sizes.vue'
import spinnerSizesSource from '~/examples/spinner/Sizes.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('spinner')
</script>

<template>
  <h1>{{ t('spinner.title') }}</h1>
  <DocsProse class="vd-lead" keypath="spinner.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="spinnerBasicSource">
    <SpinnerBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="sizes">{{ t('spinner.examples.sizes.title') }}</h3>
  <DocsProse keypath="spinner.examples.sizes.text" />
  <DocsExample :source="spinnerSizesSource" stack>
    <SpinnerSizes />
  </DocsExample>

  <h3 id="colour">{{ t('spinner.examples.colour.title') }}</h3>
  <DocsProse keypath="spinner.examples.colour.text" />
  <DocsExample :source="spinnerColourSource" stack>
    <SpinnerColour />
  </DocsExample>

  <h3 id="in-place-of-an-icon">{{ t('spinner.examples.icon.title') }}</h3>
  <DocsProse keypath="spinner.examples.icon.text" />
  <DocsExample :source="spinnerInPlaceOfAnIconSource" stack>
    <SpinnerInPlaceOfAnIcon />
  </DocsExample>

  <DocsApi page="spinner" :api="api" />
</template>
