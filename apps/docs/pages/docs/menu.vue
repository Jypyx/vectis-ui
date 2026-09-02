<script setup lang="ts">
import api from '~/content/api/menu'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('menu.title') })
</script>

<template>
  <h1>{{ t('menu.title') }}</h1>
  <DocsProse class="vd-lead" keypath="menu.lead" />

  <DocsApi page="menu" :api="api" />
</template>
