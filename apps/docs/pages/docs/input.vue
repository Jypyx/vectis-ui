<script setup lang="ts">
import api from '~/content/api/input'
import InputBasic from '~/examples/input/Basic.vue'
import inputBasicSource from '~/examples/input/Basic.vue?raw'
import InputClearable from '~/examples/input/Clearable.vue'
import inputClearableSource from '~/examples/input/Clearable.vue?raw'
import InputClickableIcons from '~/examples/input/ClickableIcons.vue'
import inputClickableIconsSource from '~/examples/input/ClickableIcons.vue?raw'
import InputCounters from '~/examples/input/Counters.vue'
import inputCountersSource from '~/examples/input/Counters.vue?raw'
import InputIcons from '~/examples/input/Icons.vue'
import inputIconsSource from '~/examples/input/Icons.vue?raw'
import InputLabelAndHint from '~/examples/input/LabelAndHint.vue'
import inputLabelAndHintSource from '~/examples/input/LabelAndHint.vue?raw'
import InputPattern from '~/examples/input/Pattern.vue'
import inputPatternSource from '~/examples/input/Pattern.vue?raw'
import InputSizes from '~/examples/input/Sizes.vue'
import inputSizesSource from '~/examples/input/Sizes.vue?raw'
import InputStates from '~/examples/input/States.vue'
import inputStatesSource from '~/examples/input/States.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('input')
</script>

<template>
  <h1>{{ t('input.title') }}</h1>
  <DocsProse class="vd-lead" keypath="input.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="inputBasicSource" stack>
    <InputBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="label-and-hint">{{ t('input.examples.labelAndHint.title') }}</h3>
  <DocsProse keypath="input.examples.labelAndHint.text" />
  <DocsExample :source="inputLabelAndHintSource" stack>
    <InputLabelAndHint />
  </DocsExample>

  <h3 id="sizes">{{ t('input.examples.sizes.title') }}</h3>
  <DocsProse keypath="input.examples.sizes.text" />
  <DocsExample :source="inputSizesSource" stack>
    <InputSizes />
  </DocsExample>

  <h3 id="icons">{{ t('input.examples.icons.title') }}</h3>
  <DocsProse keypath="input.examples.icons.text" />
  <DocsExample :source="inputIconsSource" stack>
    <InputIcons />
  </DocsExample>

  <h3 id="clearable">{{ t('input.examples.clearable.title') }}</h3>
  <DocsProse keypath="input.examples.clearable.text" />
  <DocsExample :source="inputClearableSource" stack>
    <InputClearable />
  </DocsExample>

  <h3 id="states">{{ t('input.examples.states.title') }}</h3>
  <DocsProse keypath="input.examples.states.text" />
  <DocsExample :source="inputStatesSource" stack>
    <InputStates />
  </DocsExample>

  <h3 id="clickable-icons">{{ t('input.examples.clickableIcons.title') }}</h3>
  <DocsProse keypath="input.examples.clickableIcons.text" />
  <DocsExample :source="inputClickableIconsSource" stack>
    <InputClickableIcons />
  </DocsExample>

  <h3 id="counters">{{ t('input.examples.counters.title') }}</h3>
  <DocsProse keypath="input.examples.counters.text" />
  <DocsExample :source="inputCountersSource" stack>
    <InputCounters />
  </DocsExample>

  <h3 id="pattern">{{ t('input.examples.pattern.title') }}</h3>
  <DocsProse keypath="input.examples.pattern.text" />
  <DocsExample :source="inputPatternSource" stack>
    <InputPattern />
  </DocsExample>

  <DocsApi page="input" :api="api" />
</template>
