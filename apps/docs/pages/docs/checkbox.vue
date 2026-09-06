<script setup lang="ts">
import api from '~/content/api/checkbox'
import CheckboxBasic from '~/examples/checkbox/Basic.vue'
import checkboxBasicSource from '~/examples/checkbox/Basic.vue?raw'
import CheckboxDisabled from '~/examples/checkbox/Disabled.vue'
import checkboxDisabledSource from '~/examples/checkbox/Disabled.vue?raw'
import CheckboxIndeterminate from '~/examples/checkbox/Indeterminate.vue'
import checkboxIndeterminateSource from '~/examples/checkbox/Indeterminate.vue?raw'
import CheckboxLabelPosition from '~/examples/checkbox/LabelPosition.vue'
import checkboxLabelPositionSource from '~/examples/checkbox/LabelPosition.vue?raw'
import CheckboxSpread from '~/examples/checkbox/Spread.vue'
import checkboxSpreadSource from '~/examples/checkbox/Spread.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('checkbox')
</script>

<template>
  <h1>{{ t('checkbox.title') }}</h1>
  <DocsProse class="vd-lead" keypath="checkbox.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="checkboxBasicSource">
    <CheckboxBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="label-position">{{ t('checkbox.examples.labelPosition.title') }}</h3>
  <DocsProse keypath="checkbox.examples.labelPosition.text" />
  <DocsExample :source="checkboxLabelPositionSource" stack>
    <CheckboxLabelPosition />
  </DocsExample>

  <h3 id="spread">{{ t('checkbox.examples.spread.title') }}</h3>
  <DocsProse keypath="checkbox.examples.spread.text" />
  <DocsExample :source="checkboxSpreadSource" stack>
    <CheckboxSpread />
  </DocsExample>

  <h3 id="indeterminate">{{ t('checkbox.examples.indeterminate.title') }}</h3>
  <DocsProse keypath="checkbox.examples.indeterminate.text" />
  <DocsExample :source="checkboxIndeterminateSource" stack>
    <CheckboxIndeterminate />
  </DocsExample>

  <h3 id="disabled">{{ t('checkbox.examples.disabled.title') }}</h3>
  <DocsProse keypath="checkbox.examples.disabled.text" />
  <DocsExample :source="checkboxDisabledSource" stack>
    <CheckboxDisabled />
  </DocsExample>

  <DocsApi page="checkbox" :api="api" />
</template>
