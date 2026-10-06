<script setup lang="ts">
import api from '~/content/api/split-button'
import SplitButtonBasic from '~/examples/split-button/Basic.vue'
import splitButtonBasicSource from '~/examples/split-button/Basic.vue?raw'
import SplitButtonFullWidth from '~/examples/split-button/FullWidth.vue'
import splitButtonFullWidthSource from '~/examples/split-button/FullWidth.vue?raw'
import SplitButtonLinkAndIcons from '~/examples/split-button/LinkAndIcons.vue'
import splitButtonLinkAndIconsSource from '~/examples/split-button/LinkAndIcons.vue?raw'
import SplitButtonSizes from '~/examples/split-button/Sizes.vue'
import splitButtonSizesSource from '~/examples/split-button/Sizes.vue?raw'
import SplitButtonStates from '~/examples/split-button/States.vue'
import splitButtonStatesSource from '~/examples/split-button/States.vue?raw'
import SplitButtonVariants from '~/examples/split-button/Variants.vue'
import splitButtonVariantsSource from '~/examples/split-button/Variants.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('splitButton')
</script>

<template>
  <h1>{{ t('splitButton.title') }}</h1>
  <DocsProse class="vd-lead" keypath="splitButton.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="splitButtonBasicSource">
    <SplitButtonBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants">{{ t('splitButton.examples.variants.title') }}</h3>
  <DocsProse keypath="splitButton.examples.variants.text" />
  <DocsExample :source="splitButtonVariantsSource">
    <SplitButtonVariants />
  </DocsExample>

  <h3 id="sizes">{{ t('splitButton.examples.sizes.title') }}</h3>
  <DocsProse keypath="splitButton.examples.sizes.text" />
  <DocsExample :source="splitButtonSizesSource">
    <SplitButtonSizes />
  </DocsExample>

  <h3 id="states">{{ t('splitButton.examples.states.title') }}</h3>
  <DocsProse keypath="splitButton.examples.states.text" />
  <DocsExample :source="splitButtonStatesSource">
    <SplitButtonStates />
  </DocsExample>

  <h3 id="link-and-icons">{{ t('splitButton.examples.linkAndIcons.title') }}</h3>
  <DocsProse keypath="splitButton.examples.linkAndIcons.text" />
  <DocsExample :source="splitButtonLinkAndIconsSource">
    <SplitButtonLinkAndIcons />
  </DocsExample>

  <h3 id="full-width">{{ t('splitButton.examples.fullWidth.title') }}</h3>
  <DocsProse keypath="splitButton.examples.fullWidth.text" />
  <DocsExample :source="splitButtonFullWidthSource" stack>
    <SplitButtonFullWidth />
  </DocsExample>

  <DocsApi page="splitButton" :api="api" />
</template>
