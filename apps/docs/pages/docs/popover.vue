<script setup lang="ts">
import api from '~/content/api/popover'
import PopoverBasic from '~/examples/popover/Basic.vue'
import popoverBasicSource from '~/examples/popover/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('popover.title') })
</script>

<template>
  <h1>{{ t('popover.title') }}</h1>
  <DocsProse class="vd-lead" keypath="popover.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="popoverBasicSource">
    <PopoverBasic />
  </DocsExample>

  <DocsApi page="popover" :api="api" />
</template>
