<script setup lang="ts">
import api from '~/content/api/chip'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('chip.title') })
</script>

<template>
  <h1>{{ t('chip.title') }}</h1>
  <DocsProse class="vd-lead" keypath="chip.lead" />

  <DocsApi page="chip" :api="api" />
</template>
