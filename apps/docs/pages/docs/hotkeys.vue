<script setup lang="ts">
import api from '~/content/api/hotkeys'
import HotkeysBasic from '~/examples/hotkeys/Basic.vue'
import hotkeysBasicSource from '~/examples/hotkeys/Basic.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('hotkeys.title') })
</script>

<template>
  <h1>{{ t('hotkeys.title') }}</h1>
  <DocsProse class="vd-lead" keypath="hotkeys.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="hotkeysBasicSource">
    <HotkeysBasic />
  </DocsExample>

  <DocsApi page="hotkeys" :api="api" />
</template>
