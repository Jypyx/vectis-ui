<script setup lang="ts">
import api from '~/content/api/snackbar'
import SnackbarBasic from '~/examples/snackbar/Basic.vue'
import snackbarBasicSource from '~/examples/snackbar/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('snackbar.title') })
</script>

<template>
  <h1>{{ t('snackbar.title') }}</h1>
  <DocsProse class="vd-lead" keypath="snackbar.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="snackbarBasicSource">
    <SnackbarBasic />
  </DocsExample>

  <DocsApi page="snackbar" :api="api" />
</template>
