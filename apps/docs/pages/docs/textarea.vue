<script setup lang="ts">
import api from '~/content/api/textarea'
import TextareaAutoGrow from '~/examples/textarea/AutoGrow.vue'
import textareaAutoGrowSource from '~/examples/textarea/AutoGrow.vue?raw'
import TextareaBasic from '~/examples/textarea/Basic.vue'
import textareaBasicSource from '~/examples/textarea/Basic.vue?raw'
import TextareaClearable from '~/examples/textarea/Clearable.vue'
import textareaClearableSource from '~/examples/textarea/Clearable.vue?raw'
import TextareaClickableIcons from '~/examples/textarea/ClickableIcons.vue'
import textareaClickableIconsSource from '~/examples/textarea/ClickableIcons.vue?raw'
import TextareaCounters from '~/examples/textarea/Counters.vue'
import textareaCountersSource from '~/examples/textarea/Counters.vue?raw'
import TextareaIcons from '~/examples/textarea/Icons.vue'
import textareaIconsSource from '~/examples/textarea/Icons.vue?raw'
import TextareaLabelAndHint from '~/examples/textarea/LabelAndHint.vue'
import textareaLabelAndHintSource from '~/examples/textarea/LabelAndHint.vue?raw'
import TextareaSizes from '~/examples/textarea/Sizes.vue'
import textareaSizesSource from '~/examples/textarea/Sizes.vue?raw'
import TextareaStates from '~/examples/textarea/States.vue'
import textareaStatesSource from '~/examples/textarea/States.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('textarea')
</script>

<template>
  <h1>{{ t('textarea.title') }}</h1>
  <DocsProse class="vd-lead" keypath="textarea.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="textareaBasicSource" stack>
    <TextareaBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="label-and-hint">{{ t('textarea.examples.labelAndHint.title') }}</h3>
  <DocsProse keypath="textarea.examples.labelAndHint.text" />
  <DocsExample :source="textareaLabelAndHintSource" stack>
    <TextareaLabelAndHint />
  </DocsExample>

  <h3 id="sizes">{{ t('textarea.examples.sizes.title') }}</h3>
  <DocsProse keypath="textarea.examples.sizes.text" />
  <DocsExample :source="textareaSizesSource" stack>
    <TextareaSizes />
  </DocsExample>

  <h3 id="icons">{{ t('textarea.examples.icons.title') }}</h3>
  <DocsProse keypath="textarea.examples.icons.text" />
  <DocsExample :source="textareaIconsSource" stack>
    <TextareaIcons />
  </DocsExample>

  <h3 id="clickable-icons">{{ t('textarea.examples.clickableIcons.title') }}</h3>
  <DocsProse keypath="textarea.examples.clickableIcons.text" />
  <DocsExample :source="textareaClickableIconsSource" stack>
    <TextareaClickableIcons />
  </DocsExample>

  <h3 id="clearable">{{ t('textarea.examples.clearable.title') }}</h3>
  <DocsProse keypath="textarea.examples.clearable.text" />
  <DocsExample :source="textareaClearableSource" stack>
    <TextareaClearable />
  </DocsExample>

  <h3 id="counters">{{ t('textarea.examples.counters.title') }}</h3>
  <DocsProse keypath="textarea.examples.counters.text" />
  <DocsExample :source="textareaCountersSource" stack>
    <TextareaCounters />
  </DocsExample>

  <h3 id="auto-grow">{{ t('textarea.examples.autoGrow.title') }}</h3>
  <DocsProse keypath="textarea.examples.autoGrow.text" />
  <DocsExample :source="textareaAutoGrowSource" stack>
    <TextareaAutoGrow />
  </DocsExample>

  <h3 id="states">{{ t('textarea.examples.states.title') }}</h3>
  <DocsProse keypath="textarea.examples.states.text" />
  <DocsExample :source="textareaStatesSource" stack>
    <TextareaStates />
  </DocsExample>

  <DocsApi page="textarea" :api="api" />
</template>
