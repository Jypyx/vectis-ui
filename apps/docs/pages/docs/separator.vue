<script setup lang="ts">
import api from '~/content/api/separator'
import SeparatorBasic from '~/examples/separator/Basic.vue'
import separatorBasicSource from '~/examples/separator/Basic.vue?raw'
import SeparatorLabelled from '~/examples/separator/Labelled.vue'
import separatorLabelledSource from '~/examples/separator/Labelled.vue?raw'
import SeparatorOrientation from '~/examples/separator/Orientation.vue'
import separatorOrientationSource from '~/examples/separator/Orientation.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('separator')
</script>

<template>
  <h1>{{ t('separator.title') }}</h1>
  <DocsProse class="vd-lead" keypath="separator.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="separatorBasicSource" stack>
    <SeparatorBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="orientation">{{ t('separator.examples.orientation.title') }}</h3>
  <DocsProse keypath="separator.examples.orientation.text" />
  <DocsExample :source="separatorOrientationSource" stack>
    <SeparatorOrientation />
  </DocsExample>

  <h3 id="labelled">{{ t('separator.examples.labelled.title') }}</h3>
  <DocsProse keypath="separator.examples.labelled.text" />
  <DocsExample :source="separatorLabelledSource" stack>
    <SeparatorLabelled />
  </DocsExample>

  <DocsApi page="separator" :api="api" />
</template>
