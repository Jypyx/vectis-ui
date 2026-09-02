<script setup lang="ts">
import api from '~/content/api/typography'
import TypographyBasic from '~/examples/typography/Basic.vue'
import typographyBasicSource from '~/examples/typography/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('typography.title') })
</script>

<template>
  <h1>{{ t('typography.title') }}</h1>
  <DocsProse class="vd-lead" keypath="typography.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="typographyBasicSource">
    <TypographyBasic />
  </DocsExample>

  <DocsApi page="typography" :api="api" />
</template>
