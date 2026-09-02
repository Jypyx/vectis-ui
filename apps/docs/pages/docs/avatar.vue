<script setup lang="ts">
import api from '~/content/api/avatar'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('avatar.title') })
</script>

<template>
  <h1>{{ t('avatar.title') }}</h1>
  <DocsProse class="vd-lead" keypath="avatar.lead" />

  <DocsApi page="avatar" :api="api" />
</template>
