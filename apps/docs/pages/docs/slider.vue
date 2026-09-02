<script setup lang="ts">
import api from '~/content/api/slider'
import SliderBasic from '~/examples/slider/Basic.vue'
import sliderBasicSource from '~/examples/slider/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('slider.title') })
</script>

<template>
  <h1>{{ t('slider.title') }}</h1>
  <DocsProse class="vd-lead" keypath="slider.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="sliderBasicSource" stack>
    <SliderBasic />
  </DocsExample>

  <DocsApi page="slider" :api="api" />
</template>
