<script setup lang="ts">
import api from '~/content/api/tabs'
import TabsBasic from '~/examples/tabs/Basic.vue'
import tabsBasicSource from '~/examples/tabs/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('tabs.title') })
</script>

<template>
  <h1>{{ t('tabs.title') }}</h1>
  <DocsProse class="vd-lead" keypath="tabs.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="tabsBasicSource" stack>
    <TabsBasic />
  </DocsExample>

  <DocsApi page="tabs" :api="api" />
</template>
