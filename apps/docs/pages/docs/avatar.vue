<script setup lang="ts">
import api from '~/content/api/avatar'
import AvatarBasic from '~/examples/avatar/Basic.vue'
import avatarBasicSource from '~/examples/avatar/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('avatar.title') })
</script>

<template>
  <h1>{{ t('avatar.title') }}</h1>
  <DocsProse class="vd-lead" keypath="avatar.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="avatarBasicSource">
    <AvatarBasic />
  </DocsExample>

  <DocsApi page="avatar" :api="api" />
</template>
