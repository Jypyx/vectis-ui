<script setup lang="ts">
import api from '~/content/api/icon-button'
import IconButtonBasic from '~/examples/icon-button/Basic.vue'
import iconButtonBasicSource from '~/examples/icon-button/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('iconButton.title') })
</script>

<template>
  <h1>{{ t('iconButton.title') }}</h1>
  <DocsProse class="vd-lead" keypath="iconButton.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="iconButtonBasicSource">
    <IconButtonBasic />
  </DocsExample>

  <DocsApi page="iconButton" :api="api" />
</template>
