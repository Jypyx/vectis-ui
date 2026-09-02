<script setup lang="ts">
import api from '~/content/api/icon'
import IconBasic from '~/examples/icon/Basic.vue'
import iconBasicSource from '~/examples/icon/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('icon.title') })
</script>

<template>
  <h1>{{ t('icon.title') }}</h1>
  <DocsProse class="vd-lead" keypath="icon.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="iconBasicSource">
    <IconBasic />
  </DocsExample>

  <DocsApi page="icon" :api="api" />
</template>
