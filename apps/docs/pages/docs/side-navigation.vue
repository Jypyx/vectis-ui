<script setup lang="ts">
import api from '~/content/api/side-navigation'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('sideNavigation.title') })
</script>

<template>
  <h1>{{ t('sideNavigation.title') }}</h1>
  <DocsProse class="vd-lead" keypath="sideNavigation.lead" />

  <DocsApi page="sideNavigation" :api="api" />
</template>
