<script setup lang="ts">
import api from '~/content/api/switch'
import SwitchBasic from '~/examples/switch/Basic.vue'
import switchBasicSource from '~/examples/switch/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('switch.title') })
</script>

<template>
  <h1>{{ t('switch.title') }}</h1>
  <DocsProse class="vd-lead" keypath="switch.lead" />

  <h2 id="the-choice">{{ t('switch.choiceHeading') }}</h2>
  <DocsProse keypath="switch.choiceBody" />
  <DocsExample :source="switchBasicSource" stack>
    <SwitchBasic />
  </DocsExample>
  <DocsProse keypath="switch.spread" />

  <DocsApi page="switch" :api="api" />
</template>
