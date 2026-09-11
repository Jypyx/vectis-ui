<script setup lang="ts">
import api from '~/content/api/input-group'
import InputGroupBasic from '~/examples/input-group/Basic.vue'
import inputGroupBasicSource from '~/examples/input-group/Basic.vue?raw'
import InputGroupMultipleInputs from '~/examples/input-group/MultipleInputs.vue'
import inputGroupMultipleInputsSource from '~/examples/input-group/MultipleInputs.vue?raw'
import InputGroupNaming from '~/examples/input-group/Naming.vue'
import inputGroupNamingSource from '~/examples/input-group/Naming.vue?raw'
import InputGroupPickers from '~/examples/input-group/Pickers.vue'
import inputGroupPickersSource from '~/examples/input-group/Pickers.vue?raw'
import InputGroupSizes from '~/examples/input-group/Sizes.vue'
import inputGroupSizesSource from '~/examples/input-group/Sizes.vue?raw'
import InputGroupStates from '~/examples/input-group/States.vue'
import inputGroupStatesSource from '~/examples/input-group/States.vue?raw'
import InputGroupWidths from '~/examples/input-group/Widths.vue'
import inputGroupWidthsSource from '~/examples/input-group/Widths.vue?raw'
import InputGroupWithButton from '~/examples/input-group/WithButton.vue'
import inputGroupWithButtonSource from '~/examples/input-group/WithButton.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('inputGroup')
</script>

<template>
  <h1>{{ t('inputGroup.title') }}</h1>
  <DocsProse class="vd-lead" keypath="inputGroup.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="inputGroupBasicSource" stack>
    <InputGroupBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="multiple-inputs">{{ t('inputGroup.examples.multipleInputs.title') }}</h3>
  <DocsProse keypath="inputGroup.examples.multipleInputs.text" />
  <DocsExample :source="inputGroupMultipleInputsSource" stack>
    <InputGroupMultipleInputs />
  </DocsExample>

  <h3 id="with-button">{{ t('inputGroup.examples.withButton.title') }}</h3>
  <DocsProse keypath="inputGroup.examples.withButton.text" />
  <DocsExample :source="inputGroupWithButtonSource" stack>
    <InputGroupWithButton />
  </DocsExample>

  <h3 id="pickers">{{ t('inputGroup.examples.pickers.title') }}</h3>
  <DocsProse keypath="inputGroup.examples.pickers.text" />
  <DocsExample :source="inputGroupPickersSource" stack>
    <InputGroupPickers />
  </DocsExample>

  <h3 id="naming">{{ t('inputGroup.examples.naming.title') }}</h3>
  <DocsProse keypath="inputGroup.examples.naming.text" />
  <DocsExample :source="inputGroupNamingSource" stack>
    <InputGroupNaming />
  </DocsExample>

  <h3 id="widths">{{ t('inputGroup.examples.widths.title') }}</h3>
  <DocsProse keypath="inputGroup.examples.widths.text" />
  <DocsExample :source="inputGroupWidthsSource" stack>
    <InputGroupWidths />
  </DocsExample>

  <h3 id="sizes">{{ t('inputGroup.examples.sizes.title') }}</h3>
  <DocsProse keypath="inputGroup.examples.sizes.text" />
  <DocsExample :source="inputGroupSizesSource" stack>
    <InputGroupSizes />
  </DocsExample>

  <h3 id="states">{{ t('inputGroup.examples.states.title') }}</h3>
  <DocsProse keypath="inputGroup.examples.states.text" />
  <DocsExample :source="inputGroupStatesSource" stack>
    <InputGroupStates />
  </DocsExample>

  <DocsApi page="inputGroup" :api="api" />
</template>
