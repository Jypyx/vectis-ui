<script setup lang="ts">
import api from '~/content/api/toast'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('toast.title') })
</script>

<template>
  <h1>{{ t('toast.title') }}</h1>
  <DocsProse class="vd-lead" keypath="toast.lead" />

  <DocsApi page="toast" :api="api" />
</template>
