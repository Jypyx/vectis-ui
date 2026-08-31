<script setup lang="ts">
import { VSwitch } from 'vectis-ui'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
const { apiColumns } = useDocsTable()
useHead({ title: () => t('switch.title') })

const reducedMotion = ref(true)
const notes = ref(true)

const basicCode = `<VSwitch v-model="reducedMotion">Respect reduced motion</VSwitch>

<VSwitch v-model="notes" label-position="start" spread>
  Send me release notes
</VSwitch>`
</script>

<template>
  <h1>{{ t('switch.title') }}</h1>
  <DocsProse class="vd-lead" keypath="switch.lead" />

  <h2 id="the-choice">{{ t('switch.choiceHeading') }}</h2>
  <DocsProse keypath="switch.choiceBody" />
  <DocsDemo stack>
    <VSwitch v-model="reducedMotion">Respect reduced motion</VSwitch>
    <VSwitch v-model="notes" label-position="start" spread>Send me release notes</VSwitch>
    <VSwitch disabled>Beta channel (unavailable on this plan)</VSwitch>
  </DocsDemo>
  <DocsProse keypath="switch.spread" />
  <DocsCode lang="vue" :code="basicCode" />
  <DocsProse keypath="switch.labelSlot" />

  <h2 id="how-it-is-built">{{ t('switch.builtHeading') }}</h2>
  <DocsProseList keypath="switch.built" />

  <h2 id="api">{{ t('switch.apiHeading') }}</h2>
  <DocsTable :columns="apiColumns">
    <tr>
      <td><code>v-model</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>labelPosition</code></td>
      <td><code>'start' | 'end'</code></td>
      <td><code>'end'</code></td>
    </tr>
    <tr>
      <td><code>spread</code></td>
      <DocsProse tag="td" keypath="switch.apiSpread" />
      <td><code>false</code></td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
  </DocsTable>
  <DocsProse keypath="switch.apiBody" />
</template>
