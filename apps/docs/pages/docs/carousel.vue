<script setup lang="ts">
import api from '~/content/api/carousel'
import CarouselBasic from '~/examples/carousel/Basic.vue'
import carouselBasicSource from '~/examples/carousel/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('carousel.title') })
</script>

<template>
  <h1>{{ t('carousel.title') }}</h1>
  <DocsProse class="vd-lead" keypath="carousel.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="carouselBasicSource" stack>
    <CarouselBasic />
  </DocsExample>

  <DocsApi page="carousel" :api="api" />
</template>
