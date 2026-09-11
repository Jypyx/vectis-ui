<script setup lang="ts">
import api from '~/content/api/icon-button'
import IconButtonBasic from '~/examples/icon-button/Basic.vue'
import iconButtonBasicSource from '~/examples/icon-button/Basic.vue?raw'
import IconButtonElevated from '~/examples/icon-button/Elevated.vue'
import iconButtonElevatedSource from '~/examples/icon-button/Elevated.vue?raw'
import IconButtonIcons from '~/examples/icon-button/Icons.vue'
import iconButtonIconsSource from '~/examples/icon-button/Icons.vue?raw'
import IconButtonLink from '~/examples/icon-button/Link.vue'
import iconButtonLinkSource from '~/examples/icon-button/Link.vue?raw'
import IconButtonShapes from '~/examples/icon-button/Shapes.vue'
import iconButtonShapesSource from '~/examples/icon-button/Shapes.vue?raw'
import IconButtonSizes from '~/examples/icon-button/Sizes.vue'
import iconButtonSizesSource from '~/examples/icon-button/Sizes.vue?raw'
import IconButtonStates from '~/examples/icon-button/States.vue'
import iconButtonStatesSource from '~/examples/icon-button/States.vue?raw'
import IconButtonVariantsAndTones from '~/examples/icon-button/VariantsAndTones.vue'
import iconButtonVariantsAndTonesSource from '~/examples/icon-button/VariantsAndTones.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('iconButton')
</script>

<template>
  <h1>{{ t('iconButton.title') }}</h1>
  <DocsProse class="vd-lead" keypath="iconButton.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="iconButtonBasicSource">
    <IconButtonBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants-and-tones">{{ t('iconButton.examples.variantsAndTones.title') }}</h3>
  <DocsProse keypath="iconButton.examples.variantsAndTones.text" />
  <DocsExample :source="iconButtonVariantsAndTonesSource" stack>
    <IconButtonVariantsAndTones />
  </DocsExample>

  <h3 id="elevated">{{ t('iconButton.examples.elevated.title') }}</h3>
  <DocsProse keypath="iconButton.examples.elevated.text" />
  <DocsExample :source="iconButtonElevatedSource" stack>
    <IconButtonElevated />
  </DocsExample>

  <h3 id="sizes">{{ t('iconButton.examples.sizes.title') }}</h3>
  <DocsProse keypath="iconButton.examples.sizes.text" />
  <DocsExample :source="iconButtonSizesSource" stack>
    <IconButtonSizes />
  </DocsExample>

  <h3 id="shapes">{{ t('iconButton.examples.shapes.title') }}</h3>
  <DocsProse keypath="iconButton.examples.shapes.text" />
  <DocsExample :source="iconButtonShapesSource" stack>
    <IconButtonShapes />
  </DocsExample>

  <h3 id="icons">{{ t('iconButton.examples.icons.title') }}</h3>
  <DocsProse keypath="iconButton.examples.icons.text" />
  <DocsExample :source="iconButtonIconsSource">
    <IconButtonIcons />
  </DocsExample>

  <h3 id="link">{{ t('iconButton.examples.link.title') }}</h3>
  <DocsProse keypath="iconButton.examples.link.text" />
  <DocsExample :source="iconButtonLinkSource">
    <IconButtonLink />
  </DocsExample>

  <h3 id="states">{{ t('iconButton.examples.states.title') }}</h3>
  <DocsProse keypath="iconButton.examples.states.text" />
  <DocsExample :source="iconButtonStatesSource" stack>
    <IconButtonStates />
  </DocsExample>

  <DocsApi page="iconButton" :api="api" />
</template>
