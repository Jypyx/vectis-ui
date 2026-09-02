<script setup lang="ts">
import api from '~/content/api/carousel'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('carousel.title') })
</script>

<template>
  <h1>{{ t('carousel.title') }}</h1>
  <DocsProse class="vd-lead" keypath="carousel.lead" />

  <DocsApi page="carousel" :api="api" />
</template>
