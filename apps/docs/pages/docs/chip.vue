<script setup lang="ts">
import api from '~/content/api/chip'
import ChipBasic from '~/examples/chip/Basic.vue'
import chipBasicSource from '~/examples/chip/Basic.vue?raw'
import ChipClickableAndLinks from '~/examples/chip/ClickableAndLinks.vue'
import chipClickableAndLinksSource from '~/examples/chip/ClickableAndLinks.vue?raw'
import ChipCustomColors from '~/examples/chip/CustomColors.vue'
import chipCustomColorsSource from '~/examples/chip/CustomColors.vue?raw'
import ChipDismissible from '~/examples/chip/Dismissible.vue'
import chipDismissibleSource from '~/examples/chip/Dismissible.vue?raw'
import ChipIcons from '~/examples/chip/Icons.vue'
import chipIconsSource from '~/examples/chip/Icons.vue?raw'
import ChipSelection from '~/examples/chip/Selection.vue'
import chipSelectionSource from '~/examples/chip/Selection.vue?raw'
import ChipShapes from '~/examples/chip/Shapes.vue'
import chipShapesSource from '~/examples/chip/Shapes.vue?raw'
import ChipSizes from '~/examples/chip/Sizes.vue'
import chipSizesSource from '~/examples/chip/Sizes.vue?raw'
import ChipStates from '~/examples/chip/States.vue'
import chipStatesSource from '~/examples/chip/States.vue?raw'
import ChipVariantsAndTones from '~/examples/chip/VariantsAndTones.vue'
import chipVariantsAndTonesSource from '~/examples/chip/VariantsAndTones.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('chip')
</script>

<template>
  <h1>{{ t('chip.title') }}</h1>
  <DocsProse class="vd-lead" keypath="chip.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="chipBasicSource">
    <ChipBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants-and-tones">{{ t('chip.examples.variantsAndTones.title') }}</h3>
  <DocsProse keypath="chip.examples.variantsAndTones.text" />
  <DocsExample :source="chipVariantsAndTonesSource" stack>
    <ChipVariantsAndTones />
  </DocsExample>

  <h3 id="shapes">{{ t('chip.examples.shapes.title') }}</h3>
  <DocsProse keypath="chip.examples.shapes.text" />
  <DocsExample :source="chipShapesSource" stack>
    <ChipShapes />
  </DocsExample>

  <h3 id="sizes">{{ t('chip.examples.sizes.title') }}</h3>
  <DocsProse keypath="chip.examples.sizes.text" />
  <DocsExample :source="chipSizesSource" stack>
    <ChipSizes />
  </DocsExample>

  <h3 id="custom-colors">{{ t('chip.examples.customColors.title') }}</h3>
  <DocsProse keypath="chip.examples.customColors.text" />
  <DocsExample :source="chipCustomColorsSource" stack>
    <ChipCustomColors />
  </DocsExample>

  <h3 id="with-icons">{{ t('chip.examples.icons.title') }}</h3>
  <DocsProse keypath="chip.examples.icons.text" />
  <DocsExample :source="chipIconsSource">
    <ChipIcons />
  </DocsExample>

  <h3 id="clickable-and-links">{{ t('chip.examples.clickable.title') }}</h3>
  <DocsProse keypath="chip.examples.clickable.text" />
  <DocsExample :source="chipClickableAndLinksSource">
    <ChipClickableAndLinks />
  </DocsExample>

  <h3 id="selection">{{ t('chip.examples.selection.title') }}</h3>
  <DocsProse keypath="chip.examples.selection.text" />
  <DocsExample :source="chipSelectionSource" stack>
    <ChipSelection />
  </DocsExample>

  <h3 id="dismissible">{{ t('chip.examples.dismissible.title') }}</h3>
  <DocsProse keypath="chip.examples.dismissible.text" />
  <DocsExample :source="chipDismissibleSource" stack>
    <ChipDismissible />
  </DocsExample>

  <h3 id="states">{{ t('chip.examples.states.title') }}</h3>
  <DocsProse keypath="chip.examples.states.text" />
  <DocsExample :source="chipStatesSource" stack>
    <ChipStates />
  </DocsExample>

  <DocsApi page="chip" :api="api" />
</template>
