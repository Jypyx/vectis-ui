<script setup lang="ts">
import api from '~/content/api/dialog'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('dialog.title') })
</script>

<template>
  <h1>{{ t('dialog.title') }}</h1>
  <DocsProse class="vd-lead" keypath="dialog.lead" />

  <DocsApi page="dialog" :api="api" />
</template>
