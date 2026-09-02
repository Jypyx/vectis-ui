<script setup lang="ts">
import api from '~/content/api/avatar-group'
import AvatarGroupBasic from '~/examples/avatar-group/Basic.vue'
import avatarGroupBasicSource from '~/examples/avatar-group/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('avatarGroup.title') })
</script>

<template>
  <h1>{{ t('avatarGroup.title') }}</h1>
  <DocsProse class="vd-lead" keypath="avatarGroup.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="avatarGroupBasicSource">
    <AvatarGroupBasic />
  </DocsExample>

  <DocsApi page="avatarGroup" :api="api" />
</template>
