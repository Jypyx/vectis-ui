<script setup lang="ts">
import api from '~/content/api/file-input'
import FileInputBasic from '~/examples/file-input/Basic.vue'
import fileInputBasicSource from '~/examples/file-input/Basic.vue?raw'
import FileInputClearable from '~/examples/file-input/Clearable.vue'
import fileInputClearableSource from '~/examples/file-input/Clearable.vue?raw'
import FileInputCounter from '~/examples/file-input/Counter.vue'
import fileInputCounterSource from '~/examples/file-input/Counter.vue?raw'
import FileInputCustomIcon from '~/examples/file-input/CustomIcon.vue'
import fileInputCustomIconSource from '~/examples/file-input/CustomIcon.vue?raw'
import FileInputDisplay from '~/examples/file-input/Display.vue'
import fileInputDisplaySource from '~/examples/file-input/Display.vue?raw'
import FileInputLabelAndHint from '~/examples/file-input/LabelAndHint.vue'
import fileInputLabelAndHintSource from '~/examples/file-input/LabelAndHint.vue?raw'
import FileInputMultiple from '~/examples/file-input/Multiple.vue'
import fileInputMultipleSource from '~/examples/file-input/Multiple.vue?raw'
import FileInputPerFileLimits from '~/examples/file-input/PerFileLimits.vue'
import fileInputPerFileLimitsSource from '~/examples/file-input/PerFileLimits.vue?raw'
import FileInputSelectionLimits from '~/examples/file-input/SelectionLimits.vue'
import fileInputSelectionLimitsSource from '~/examples/file-input/SelectionLimits.vue?raw'
import FileInputSizes from '~/examples/file-input/Sizes.vue'
import fileInputSizesSource from '~/examples/file-input/Sizes.vue?raw'
import FileInputStates from '~/examples/file-input/States.vue'
import fileInputStatesSource from '~/examples/file-input/States.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('fileInput')
</script>

<template>
  <h1>{{ t('fileInput.title') }}</h1>
  <DocsProse class="vd-lead" keypath="fileInput.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="fileInputBasicSource" stack>
    <FileInputBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="label-and-hint">{{ t('fileInput.examples.labelAndHint.title') }}</h3>
  <DocsProse keypath="fileInput.examples.labelAndHint.text" />
  <DocsExample :source="fileInputLabelAndHintSource" stack>
    <FileInputLabelAndHint />
  </DocsExample>

  <h3 id="sizes">{{ t('fileInput.examples.sizes.title') }}</h3>
  <DocsProse keypath="fileInput.examples.sizes.text" />
  <DocsExample :source="fileInputSizesSource" stack>
    <FileInputSizes />
  </DocsExample>

  <h3 id="multiple">{{ t('fileInput.examples.multiple.title') }}</h3>
  <DocsProse keypath="fileInput.examples.multiple.text" />
  <DocsExample :source="fileInputMultipleSource" stack>
    <FileInputMultiple />
  </DocsExample>

  <h3 id="clearable">{{ t('fileInput.examples.clearable.title') }}</h3>
  <DocsProse keypath="fileInput.examples.clearable.text" />
  <DocsExample :source="fileInputClearableSource" stack>
    <FileInputClearable />
  </DocsExample>

  <h3 id="display">{{ t('fileInput.examples.display.title') }}</h3>
  <DocsProse keypath="fileInput.examples.display.text" />
  <DocsExample :source="fileInputDisplaySource" stack>
    <FileInputDisplay />
  </DocsExample>

  <h3 id="per-file-limits">{{ t('fileInput.examples.perFileLimits.title') }}</h3>
  <DocsProse keypath="fileInput.examples.perFileLimits.text" />
  <DocsExample :source="fileInputPerFileLimitsSource" stack>
    <FileInputPerFileLimits />
  </DocsExample>

  <h3 id="selection-limits">{{ t('fileInput.examples.selectionLimits.title') }}</h3>
  <DocsProse keypath="fileInput.examples.selectionLimits.text" />
  <DocsExample :source="fileInputSelectionLimitsSource" stack>
    <FileInputSelectionLimits />
  </DocsExample>

  <h3 id="counter">{{ t('fileInput.examples.counter.title') }}</h3>
  <DocsProse keypath="fileInput.examples.counter.text" />
  <DocsExample :source="fileInputCounterSource" stack>
    <FileInputCounter />
  </DocsExample>

  <h3 id="custom-icon">{{ t('fileInput.examples.customIcon.title') }}</h3>
  <DocsProse keypath="fileInput.examples.customIcon.text" />
  <DocsExample :source="fileInputCustomIconSource" stack>
    <FileInputCustomIcon />
  </DocsExample>

  <h3 id="states">{{ t('fileInput.examples.states.title') }}</h3>
  <DocsProse keypath="fileInput.examples.states.text" />
  <DocsExample :source="fileInputStatesSource" stack>
    <FileInputStates />
  </DocsExample>

  <DocsApi page="fileInput" :api="api" />
</template>
