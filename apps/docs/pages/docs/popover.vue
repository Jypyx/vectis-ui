<script setup lang="ts">
import api from '~/content/api/popover'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('popover.title') })
</script>

<template>
  <h1>{{ t('popover.title') }}</h1>
  <DocsProse class="vd-lead" keypath="popover.lead" />

  <DocsApi page="popover" :api="api" />
</template>
