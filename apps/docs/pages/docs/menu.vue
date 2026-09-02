<script setup lang="ts">
import api from '~/content/api/menu'
import MenuBasic from '~/examples/menu/Basic.vue'
import menuBasicSource from '~/examples/menu/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('menu.title') })
</script>

<template>
  <h1>{{ t('menu.title') }}</h1>
  <DocsProse class="vd-lead" keypath="menu.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="menuBasicSource">
    <MenuBasic />
  </DocsExample>

  <DocsApi page="menu" :api="api" />
</template>
