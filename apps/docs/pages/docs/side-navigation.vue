<script setup lang="ts">
import api from '~/content/api/side-navigation'
import SideNavigationBasic from '~/examples/side-navigation/Basic.vue'
import sideNavigationBasicSource from '~/examples/side-navigation/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('sideNavigation.title') })
</script>

<template>
  <h1>{{ t('sideNavigation.title') }}</h1>
  <DocsProse class="vd-lead" keypath="sideNavigation.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="sideNavigationBasicSource" stack>
    <SideNavigationBasic />
  </DocsExample>

  <DocsApi page="sideNavigation" :api="api" />
</template>
