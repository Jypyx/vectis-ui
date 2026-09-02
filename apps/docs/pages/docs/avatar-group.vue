<script setup lang="ts">
import api from '~/content/api/avatar-group'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('avatarGroup.title') })
</script>

<template>
  <h1>{{ t('avatarGroup.title') }}</h1>
  <DocsProse class="vd-lead" keypath="avatarGroup.lead" />

  <DocsApi page="avatarGroup" :api="api" />
</template>
