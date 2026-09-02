<script setup lang="ts">
import api from '~/content/api/input-otp'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('inputOtp.title') })
</script>

<template>
  <h1>{{ t('inputOtp.title') }}</h1>
  <DocsProse class="vd-lead" keypath="inputOtp.lead" />

  <DocsApi page="inputOtp" :api="api" />
</template>
