<script setup lang="ts">
import api from '~/content/api/field'
import FieldBasic from '~/examples/field/Basic.vue'
import fieldBasicSource from '~/examples/field/Basic.vue?raw'
import FieldError from '~/examples/field/Error.vue'
import fieldErrorSource from '~/examples/field/Error.vue?raw'
import FieldHiddenLabel from '~/examples/field/HiddenLabel.vue'
import fieldHiddenLabelSource from '~/examples/field/HiddenLabel.vue?raw'
import FieldLabelStart from '~/examples/field/LabelStart.vue'
import fieldLabelStartSource from '~/examples/field/LabelStart.vue?raw'
import FieldNative from '~/examples/field/Native.vue'
import fieldNativeSource from '~/examples/field/Native.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('field')
</script>

<template>
  <h1>{{ t('field.title') }}</h1>
  <DocsProse class="vd-lead" keypath="field.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample stack :source="fieldBasicSource">
    <FieldBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="native-control">{{ t('field.examples.native.title') }}</h3>
  <DocsProse keypath="field.examples.native.text" />
  <DocsExample stack :source="fieldNativeSource">
    <FieldNative />
  </DocsExample>

  <h3 id="error">{{ t('field.examples.error.title') }}</h3>
  <DocsProse keypath="field.examples.error.text" />
  <DocsExample stack :source="fieldErrorSource">
    <FieldError />
  </DocsExample>

  <h3 id="label-beside-the-control">{{ t('field.examples.labelStart.title') }}</h3>
  <DocsProse keypath="field.examples.labelStart.text" />
  <DocsExample stack :source="fieldLabelStartSource">
    <FieldLabelStart />
  </DocsExample>

  <h3 id="hidden-label">{{ t('field.examples.hiddenLabel.title') }}</h3>
  <DocsProse keypath="field.examples.hiddenLabel.text" />
  <DocsExample stack :source="fieldHiddenLabelSource">
    <FieldHiddenLabel />
  </DocsExample>

  <DocsApi page="field" :api="api" />
</template>
