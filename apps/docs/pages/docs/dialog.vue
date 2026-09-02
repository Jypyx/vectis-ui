<script setup lang="ts">
import api from '~/content/api/dialog'
import DialogBasic from '~/examples/dialog/Basic.vue'
import dialogBasicSource from '~/examples/dialog/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('dialog.title') })
</script>

<template>
  <h1>{{ t('dialog.title') }}</h1>
  <DocsProse class="vd-lead" keypath="dialog.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="dialogBasicSource">
    <DialogBasic />
  </DocsExample>

  <DocsApi page="dialog" :api="api" />
</template>
