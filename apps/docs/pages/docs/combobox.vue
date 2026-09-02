<script setup lang="ts">
import api from '~/content/api/combobox'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('combobox.title') })
</script>

<template>
  <h1>{{ t('combobox.title') }}</h1>
  <DocsProse class="vd-lead" keypath="combobox.lead" />

  <DocsApi page="combobox" :api="api" />
</template>
