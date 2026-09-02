<script setup lang="ts">
import api from '~/content/api/toast'
import ToastBasic from '~/examples/toast/Basic.vue'
import toastBasicSource from '~/examples/toast/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('toast.title') })
</script>

<template>
  <h1>{{ t('toast.title') }}</h1>
  <DocsProse class="vd-lead" keypath="toast.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="toastBasicSource">
    <ToastBasic />
  </DocsExample>

  <DocsApi page="toast" :api="api" />
</template>
