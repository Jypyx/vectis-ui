<script setup lang="ts">
import api from '~/content/api/button'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('button.title') })
</script>

<template>
  <h1>{{ t('button.title') }}</h1>
  <DocsProse class="vd-lead" keypath="button.lead" />

  <DocsApi page="button" :api="api" />
</template>
