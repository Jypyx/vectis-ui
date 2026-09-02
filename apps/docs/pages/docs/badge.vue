<script setup lang="ts">
import api from '~/content/api/badge'
import BadgeBasic from '~/examples/badge/Basic.vue'
import badgeBasicSource from '~/examples/badge/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('badge.title') })
</script>

<template>
  <h1>{{ t('badge.title') }}</h1>
  <DocsProse class="vd-lead" keypath="badge.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="badgeBasicSource">
    <BadgeBasic />
  </DocsExample>

  <DocsApi page="badge" :api="api" />
</template>
