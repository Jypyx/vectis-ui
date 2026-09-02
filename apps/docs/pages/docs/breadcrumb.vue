<script setup lang="ts">
import api from '~/content/api/breadcrumb'
import BreadcrumbBasic from '~/examples/breadcrumb/Basic.vue'
import breadcrumbBasicSource from '~/examples/breadcrumb/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('breadcrumb.title') })
</script>

<template>
  <h1>{{ t('breadcrumb.title') }}</h1>
  <DocsProse class="vd-lead" keypath="breadcrumb.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="breadcrumbBasicSource" stack>
    <BreadcrumbBasic />
  </DocsExample>

  <DocsApi page="breadcrumb" :api="api" />
</template>
