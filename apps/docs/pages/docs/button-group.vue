<script setup lang="ts">
import api from '~/content/api/button-group'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('buttonGroup.title') })
</script>

<template>
  <h1>{{ t('buttonGroup.title') }}</h1>
  <DocsProse class="vd-lead" keypath="buttonGroup.lead" />

  <DocsApi page="buttonGroup" :api="api" />
</template>
