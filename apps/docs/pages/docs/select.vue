<script setup lang="ts">
import api from '~/content/api/select'
import SelectBasic from '~/examples/select/Basic.vue'
import selectBasicSource from '~/examples/select/Basic.vue?raw'
import SelectCustomOption from '~/examples/select/CustomOption.vue'
import selectCustomOptionSource from '~/examples/select/CustomOption.vue?raw'
import SelectForm from '~/examples/select/Form.vue'
import selectFormSource from '~/examples/select/Form.vue?raw'
import SelectGroups from '~/examples/select/Groups.vue'
import selectGroupsSource from '~/examples/select/Groups.vue?raw'
import SelectLabelAndHint from '~/examples/select/LabelAndHint.vue'
import selectLabelAndHintSource from '~/examples/select/LabelAndHint.vue?raw'
import SelectMultiple from '~/examples/select/Multiple.vue'
import selectMultipleSource from '~/examples/select/Multiple.vue?raw'
import SelectSizes from '~/examples/select/Sizes.vue'
import selectSizesSource from '~/examples/select/Sizes.vue?raw'
import SelectStates from '~/examples/select/States.vue'
import selectStatesSource from '~/examples/select/States.vue?raw'
import SelectTextDisplay from '~/examples/select/TextDisplay.vue'
import selectTextDisplaySource from '~/examples/select/TextDisplay.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('select')
</script>

<template>
  <h1>{{ t('select.title') }}</h1>
  <DocsProse class="vd-lead" keypath="select.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="selectBasicSource" stack>
    <SelectBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="label-and-hint">{{ t('select.examples.labelAndHint.title') }}</h3>
  <DocsProse keypath="select.examples.labelAndHint.text" />
  <DocsExample :source="selectLabelAndHintSource" stack>
    <SelectLabelAndHint />
  </DocsExample>

  <h3 id="sizes">{{ t('select.examples.sizes.title') }}</h3>
  <DocsProse keypath="select.examples.sizes.text" />
  <DocsExample :source="selectSizesSource" stack>
    <SelectSizes />
  </DocsExample>

  <h3 id="states">{{ t('select.examples.states.title') }}</h3>
  <DocsProse keypath="select.examples.states.text" />
  <DocsExample :source="selectStatesSource" stack>
    <SelectStates />
  </DocsExample>

  <h3 id="groups">{{ t('select.examples.groups.title') }}</h3>
  <DocsProse keypath="select.examples.groups.text" />
  <DocsExample :source="selectGroupsSource" stack>
    <SelectGroups />
  </DocsExample>

  <h3 id="multiple">{{ t('select.examples.multiple.title') }}</h3>
  <DocsProse keypath="select.examples.multiple.text" />
  <DocsExample :source="selectMultipleSource" stack>
    <SelectMultiple />
  </DocsExample>

  <h3 id="text-display">{{ t('select.examples.textDisplay.title') }}</h3>
  <DocsProse keypath="select.examples.textDisplay.text" />
  <DocsExample :source="selectTextDisplaySource" stack>
    <SelectTextDisplay />
  </DocsExample>

  <h3 id="custom-options">{{ t('select.examples.customOption.title') }}</h3>
  <DocsProse keypath="select.examples.customOption.text" />
  <DocsExample :source="selectCustomOptionSource" stack>
    <SelectCustomOption />
  </DocsExample>

  <h3 id="forms">{{ t('select.examples.form.title') }}</h3>
  <DocsProse keypath="select.examples.form.text" />
  <DocsExample :source="selectFormSource" stack>
    <SelectForm />
  </DocsExample>

  <DocsApi page="select" :api="api" />
</template>
