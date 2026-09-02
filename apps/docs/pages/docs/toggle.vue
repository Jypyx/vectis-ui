<script setup lang="ts">
import api from '~/content/api/toggle'
import ToggleBasic from '~/examples/toggle/Basic.vue'
import toggleBasicSource from '~/examples/toggle/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('toggle.title') })
</script>

<template>
  <h1>{{ t('toggle.title') }}</h1>
  <DocsProse class="vd-lead" keypath="toggle.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="toggleBasicSource">
    <ToggleBasic />
  </DocsExample>

  <DocsApi page="toggle" :api="api" />
</template>
