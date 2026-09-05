<script setup lang="ts">
import api from '~/content/api/input-group'
import InputGroupBasic from '~/examples/input-group/Basic.vue'
import inputGroupBasicSource from '~/examples/input-group/Basic.vue?raw'
import InputGroupNaming from '~/examples/input-group/Naming.vue'
import inputGroupNamingSource from '~/examples/input-group/Naming.vue?raw'
import InputGroupPanels from '~/examples/input-group/Panels.vue'
import inputGroupPanelsSource from '~/examples/input-group/Panels.vue?raw'
import InputGroupScope from '~/examples/input-group/Scope.vue'
import inputGroupScopeSource from '~/examples/input-group/Scope.vue?raw'
import InputGroupSearch from '~/examples/input-group/Search.vue'
import inputGroupSearchSource from '~/examples/input-group/Search.vue?raw'
import InputGroupSizes from '~/examples/input-group/Sizes.vue'
import inputGroupSizesSource from '~/examples/input-group/Sizes.vue?raw'
import InputGroupStates from '~/examples/input-group/States.vue'
import inputGroupStatesSource from '~/examples/input-group/States.vue?raw'
import InputGroupWidths from '~/examples/input-group/Widths.vue'
import inputGroupWidthsSource from '~/examples/input-group/Widths.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('inputGroup.title') })
</script>

<template>
  <h1>{{ t('inputGroup.title') }}</h1>
  <DocsProse class="vd-lead" keypath="inputGroup.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="inputGroupBasicSource" stack>
    <InputGroupBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

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

  <h3 id="search">{{ t('inputGroup.examples.search.title') }}</h3>
  <DocsProse keypath="inputGroup.examples.search.text" />
  <DocsExample :source="inputGroupSearchSource" stack>
    <InputGroupSearch />
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

  <h3 id="panels">{{ t('inputGroup.examples.panels.title') }}</h3>
  <DocsProse keypath="inputGroup.examples.panels.text" />
  <DocsExample :source="inputGroupPanelsSource" stack>
    <InputGroupPanels />
  </DocsExample>

  <h3 id="scope">{{ t('inputGroup.examples.scope.title') }}</h3>
  <DocsProse keypath="inputGroup.examples.scope.text" />
  <DocsExample :source="inputGroupScopeSource" stack>
    <InputGroupScope />
  </DocsExample>

  <DocsApi page="inputGroup" :api="api" />
</template>
