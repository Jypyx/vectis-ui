<script setup lang="ts">
import api from '~/content/api/fieldset'
import FieldsetBasic from '~/examples/fieldset/Basic.vue'
import fieldsetBasicSource from '~/examples/fieldset/Basic.vue?raw'
import FieldsetError from '~/examples/fieldset/Error.vue'
import fieldsetErrorSource from '~/examples/fieldset/Error.vue?raw'
import FieldsetHiddenLegend from '~/examples/fieldset/HiddenLegend.vue'
import fieldsetHiddenLegendSource from '~/examples/fieldset/HiddenLegend.vue?raw'
import FieldsetHorizontal from '~/examples/fieldset/Horizontal.vue'
import fieldsetHorizontalSource from '~/examples/fieldset/Horizontal.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('fieldset')
</script>

<template>
  <h1>{{ t('fieldset.title') }}</h1>
  <DocsProse class="vd-lead" keypath="fieldset.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="fieldsetBasicSource">
    <FieldsetBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="horizontal">{{ t('fieldset.examples.horizontal.title') }}</h3>
  <DocsProse keypath="fieldset.examples.horizontal.text" />
  <DocsExample :source="fieldsetHorizontalSource">
    <FieldsetHorizontal />
  </DocsExample>

  <h3 id="error-and-required">{{ t('fieldset.examples.error.title') }}</h3>
  <DocsProse keypath="fieldset.examples.error.text" />
  <DocsExample :source="fieldsetErrorSource">
    <FieldsetError />
  </DocsExample>

  <h3 id="hidden-legend">{{ t('fieldset.examples.hiddenLegend.title') }}</h3>
  <DocsProse keypath="fieldset.examples.hiddenLegend.text" />
  <DocsExample :source="fieldsetHiddenLegendSource">
    <FieldsetHiddenLegend />
  </DocsExample>

  <DocsApi page="fieldset" :api="api" />
</template>
