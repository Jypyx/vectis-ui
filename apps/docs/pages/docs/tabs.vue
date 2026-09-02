<script setup lang="ts">
import api from '~/content/api/tabs'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('tabs.title') })
</script>

<template>
  <h1>{{ t('tabs.title') }}</h1>
  <DocsProse class="vd-lead" keypath="tabs.lead" />

  <DocsApi page="tabs" :api="api" />
</template>
