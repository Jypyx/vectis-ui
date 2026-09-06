<script setup lang="ts">
import api from '~/content/api/switch'
import SwitchBasic from '~/examples/switch/Basic.vue'
import switchBasicSource from '~/examples/switch/Basic.vue?raw'
import SwitchDisabled from '~/examples/switch/Disabled.vue'
import switchDisabledSource from '~/examples/switch/Disabled.vue?raw'
import SwitchLabelPosition from '~/examples/switch/LabelPosition.vue'
import switchLabelPositionSource from '~/examples/switch/LabelPosition.vue?raw'
import SwitchSpread from '~/examples/switch/Spread.vue'
import switchSpreadSource from '~/examples/switch/Spread.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('switch')
</script>

<template>
  <h1>{{ t('switch.title') }}</h1>
  <DocsProse class="vd-lead" keypath="switch.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="switchBasicSource">
    <SwitchBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="label-position">{{ t('switch.examples.labelPosition.title') }}</h3>
  <DocsProse keypath="switch.examples.labelPosition.text" />
  <DocsExample :source="switchLabelPositionSource" stack>
    <SwitchLabelPosition />
  </DocsExample>

  <h3 id="spread">{{ t('switch.examples.spread.title') }}</h3>
  <DocsProse keypath="switch.examples.spread.text" />
  <DocsExample :source="switchSpreadSource" stack>
    <SwitchSpread />
  </DocsExample>

  <h3 id="disabled">{{ t('switch.examples.disabled.title') }}</h3>
  <DocsProse keypath="switch.examples.disabled.text" />
  <DocsExample :source="switchDisabledSource" stack>
    <SwitchDisabled />
  </DocsExample>

  <DocsApi page="switch" :api="api" />
</template>
