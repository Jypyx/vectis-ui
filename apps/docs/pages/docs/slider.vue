<script setup lang="ts">
import api from '~/content/api/slider'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('slider.title') })
</script>

<template>
  <h1>{{ t('slider.title') }}</h1>
  <DocsProse class="vd-lead" keypath="slider.lead" />

  <DocsApi page="slider" :api="api" />
</template>
