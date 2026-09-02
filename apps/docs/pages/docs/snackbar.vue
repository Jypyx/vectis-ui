<script setup lang="ts">
import api from '~/content/api/snackbar'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('snackbar.title') })
</script>

<template>
  <h1>{{ t('snackbar.title') }}</h1>
  <DocsProse class="vd-lead" keypath="snackbar.lead" />

  <DocsApi page="snackbar" :api="api" />
</template>
