<script setup lang="ts">
import api from '~/content/api/radio'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('radio.title') })
</script>

<template>
  <h1>{{ t('radio.title') }}</h1>
  <DocsProse class="vd-lead" keypath="radio.lead" />

  <DocsApi page="radio" :api="api" />
</template>
