<script setup lang="ts">
import api from '~/content/api/toggle'
import ToggleBasic from '~/examples/toggle/Basic.vue'
import toggleBasicSource from '~/examples/toggle/Basic.vue?raw'
import ToggleDetached from '~/examples/toggle/Detached.vue'
import toggleDetachedSource from '~/examples/toggle/Detached.vue?raw'
import ToggleDisabled from '~/examples/toggle/Disabled.vue'
import toggleDisabledSource from '~/examples/toggle/Disabled.vue?raw'
import ToggleElevated from '~/examples/toggle/Elevated.vue'
import toggleElevatedSource from '~/examples/toggle/Elevated.vue?raw'
import ToggleFilledIcons from '~/examples/toggle/FilledIcons.vue'
import toggleFilledIconsSource from '~/examples/toggle/FilledIcons.vue?raw'
import ToggleItemContent from '~/examples/toggle/ItemContent.vue'
import toggleItemContentSource from '~/examples/toggle/ItemContent.vue?raw'
import ToggleMandatory from '~/examples/toggle/Mandatory.vue'
import toggleMandatorySource from '~/examples/toggle/Mandatory.vue?raw'
import ToggleMultiple from '~/examples/toggle/Multiple.vue'
import toggleMultipleSource from '~/examples/toggle/Multiple.vue?raw'
import ToggleOrientation from '~/examples/toggle/Orientation.vue'
import toggleOrientationSource from '~/examples/toggle/Orientation.vue?raw'
import ToggleSeamless from '~/examples/toggle/Seamless.vue'
import toggleSeamlessSource from '~/examples/toggle/Seamless.vue?raw'
import ToggleSelectedVariants from '~/examples/toggle/SelectedVariants.vue'
import toggleSelectedVariantsSource from '~/examples/toggle/SelectedVariants.vue?raw'
import ToggleSizes from '~/examples/toggle/Sizes.vue'
import toggleSizesSource from '~/examples/toggle/Sizes.vue?raw'
import ToggleVariants from '~/examples/toggle/Variants.vue'
import toggleVariantsSource from '~/examples/toggle/Variants.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('toggle')
</script>

<template>
  <h1>{{ t('toggle.title') }}</h1>
  <DocsProse class="vd-lead" keypath="toggle.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="toggleBasicSource">
    <ToggleBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants">{{ t('toggle.examples.variants.title') }}</h3>
  <DocsProse keypath="toggle.examples.variants.text" />
  <DocsExample :source="toggleVariantsSource" stack>
    <ToggleVariants />
  </DocsExample>

  <h3 id="selected-variants">{{ t('toggle.examples.selectedVariants.title') }}</h3>
  <DocsProse keypath="toggle.examples.selectedVariants.text" />
  <DocsExample :source="toggleSelectedVariantsSource" stack>
    <ToggleSelectedVariants />
  </DocsExample>

  <h3 id="sizes">{{ t('toggle.examples.sizes.title') }}</h3>
  <DocsProse keypath="toggle.examples.sizes.text" />
  <DocsExample :source="toggleSizesSource" stack>
    <ToggleSizes />
  </DocsExample>

  <h3 id="item-content">{{ t('toggle.examples.itemContent.title') }}</h3>
  <DocsProse keypath="toggle.examples.itemContent.text" />
  <DocsExample :source="toggleItemContentSource" stack>
    <ToggleItemContent />
  </DocsExample>

  <h3 id="filled-icons">{{ t('toggle.examples.filledIcons.title') }}</h3>
  <DocsProse keypath="toggle.examples.filledIcons.text" />
  <DocsExample :source="toggleFilledIconsSource">
    <ToggleFilledIcons />
  </DocsExample>

  <h3 id="detached">{{ t('toggle.examples.detached.title') }}</h3>
  <DocsProse keypath="toggle.examples.detached.text" />
  <DocsExample :source="toggleDetachedSource" stack>
    <ToggleDetached />
  </DocsExample>

  <h3 id="seamless">{{ t('toggle.examples.seamless.title') }}</h3>
  <DocsProse keypath="toggle.examples.seamless.text" />
  <DocsExample :source="toggleSeamlessSource" stack>
    <ToggleSeamless />
  </DocsExample>

  <h3 id="elevated">{{ t('toggle.examples.elevated.title') }}</h3>
  <DocsProse keypath="toggle.examples.elevated.text" />
  <DocsExample :source="toggleElevatedSource">
    <ToggleElevated />
  </DocsExample>

  <h3 id="orientation">{{ t('toggle.examples.orientation.title') }}</h3>
  <DocsProse keypath="toggle.examples.orientation.text" />
  <DocsExample :source="toggleOrientationSource" stack>
    <ToggleOrientation />
  </DocsExample>

  <h3 id="multiple">{{ t('toggle.examples.multiple.title') }}</h3>
  <DocsProse keypath="toggle.examples.multiple.text" />
  <DocsExample :source="toggleMultipleSource" stack>
    <ToggleMultiple />
  </DocsExample>

  <h3 id="mandatory">{{ t('toggle.examples.mandatory.title') }}</h3>
  <DocsProse keypath="toggle.examples.mandatory.text" />
  <DocsExample :source="toggleMandatorySource" stack>
    <ToggleMandatory />
  </DocsExample>

  <h3 id="disabled">{{ t('toggle.examples.disabled.title') }}</h3>
  <DocsProse keypath="toggle.examples.disabled.text" />
  <DocsExample :source="toggleDisabledSource" stack>
    <ToggleDisabled />
  </DocsExample>

  <DocsApi page="toggle" :api="api" />
</template>
