<script setup lang="ts">
import api from '~/content/api/hotkeys'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('hotkeys.title') })
</script>

<template>
  <h1>{{ t('hotkeys.title') }}</h1>
  <DocsProse class="vd-lead" keypath="hotkeys.lead" />

  <DocsApi page="hotkeys" :api="api" />
</template>
