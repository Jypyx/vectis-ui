<script setup lang="ts">
import api from '~/content/api/alert'
import AlertActions from '~/examples/alert/Actions.vue'
import alertActionsSource from '~/examples/alert/Actions.vue?raw'
import AlertBasic from '~/examples/alert/Basic.vue'
import alertBasicSource from '~/examples/alert/Basic.vue?raw'
import AlertClosable from '~/examples/alert/Closable.vue'
import alertClosableSource from '~/examples/alert/Closable.vue?raw'
import AlertIcon from '~/examples/alert/Icon.vue'
import alertIconSource from '~/examples/alert/Icon.vue?raw'
import AlertLive from '~/examples/alert/Live.vue'
import alertLiveSource from '~/examples/alert/Live.vue?raw'
import AlertTones from '~/examples/alert/Tones.vue'
import alertTonesSource from '~/examples/alert/Tones.vue?raw'
import AlertVariants from '~/examples/alert/Variants.vue'
import alertVariantsSource from '~/examples/alert/Variants.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('alert')
</script>

<template>
  <h1>{{ t('alert.title') }}</h1>
  <DocsProse class="vd-lead" keypath="alert.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample stack :source="alertBasicSource">
    <AlertBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants">{{ t('alert.examples.variants.title') }}</h3>
  <DocsProse keypath="alert.examples.variants.text" />
  <DocsExample stack :source="alertVariantsSource">
    <AlertVariants />
  </DocsExample>

  <h3 id="tones">{{ t('alert.examples.tones.title') }}</h3>
  <DocsProse keypath="alert.examples.tones.text" />
  <DocsExample stack :source="alertTonesSource">
    <AlertTones />
  </DocsExample>

  <h3 id="icon">{{ t('alert.examples.icon.title') }}</h3>
  <DocsProse keypath="alert.examples.icon.text" />
  <DocsExample stack :source="alertIconSource">
    <AlertIcon />
  </DocsExample>

  <h3 id="actions">{{ t('alert.examples.actions.title') }}</h3>
  <DocsProse keypath="alert.examples.actions.text" />
  <DocsExample stack :source="alertActionsSource">
    <AlertActions />
  </DocsExample>

  <h3 id="closable">{{ t('alert.examples.closable.title') }}</h3>
  <DocsProse keypath="alert.examples.closable.text" />
  <DocsExample :source="alertClosableSource">
    <AlertClosable />
  </DocsExample>

  <h3 id="live">{{ t('alert.examples.live.title') }}</h3>
  <DocsProse keypath="alert.examples.live.text" />
  <DocsExample :source="alertLiveSource">
    <AlertLive />
  </DocsExample>

  <DocsApi page="alert" :api="api" />
</template>
