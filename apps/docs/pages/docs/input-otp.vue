<script setup lang="ts">
import api from '~/content/api/input-otp'
import InputOtpBasic from '~/examples/input-otp/Basic.vue'
import inputOtpBasicSource from '~/examples/input-otp/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('inputOtp.title') })
</script>

<template>
  <h1>{{ t('inputOtp.title') }}</h1>
  <DocsProse class="vd-lead" keypath="inputOtp.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="inputOtpBasicSource">
    <InputOtpBasic />
  </DocsExample>

  <DocsApi page="inputOtp" :api="api" />
</template>
