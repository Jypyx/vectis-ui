<script setup lang="ts">
import api from '~/content/api/button-group'
import ButtonGroupBasic from '~/examples/button-group/Basic.vue'
import buttonGroupBasicSource from '~/examples/button-group/Basic.vue?raw'
import ButtonGroupCompact from '~/examples/button-group/Compact.vue'
import buttonGroupCompactSource from '~/examples/button-group/Compact.vue?raw'
import ButtonGroupDetached from '~/examples/button-group/Detached.vue'
import buttonGroupDetachedSource from '~/examples/button-group/Detached.vue?raw'
import ButtonGroupElevated from '~/examples/button-group/Elevated.vue'
import buttonGroupElevatedSource from '~/examples/button-group/Elevated.vue?raw'
import ButtonGroupFullWidth from '~/examples/button-group/FullWidth.vue'
import buttonGroupFullWidthSource from '~/examples/button-group/FullWidth.vue?raw'
import ButtonGroupIcons from '~/examples/button-group/Icons.vue'
import buttonGroupIconsSource from '~/examples/button-group/Icons.vue?raw'
import ButtonGroupLink from '~/examples/button-group/Link.vue'
import buttonGroupLinkSource from '~/examples/button-group/Link.vue?raw'
import ButtonGroupOrientation from '~/examples/button-group/Orientation.vue'
import buttonGroupOrientationSource from '~/examples/button-group/Orientation.vue?raw'
import ButtonGroupSeamless from '~/examples/button-group/Seamless.vue'
import buttonGroupSeamlessSource from '~/examples/button-group/Seamless.vue?raw'
import ButtonGroupSizes from '~/examples/button-group/Sizes.vue'
import buttonGroupSizesSource from '~/examples/button-group/Sizes.vue?raw'
import ButtonGroupStates from '~/examples/button-group/States.vue'
import buttonGroupStatesSource from '~/examples/button-group/States.vue?raw'
import ButtonGroupToneOverride from '~/examples/button-group/ToneOverride.vue'
import buttonGroupToneOverrideSource from '~/examples/button-group/ToneOverride.vue?raw'
import ButtonGroupVariantsAndTones from '~/examples/button-group/VariantsAndTones.vue'
import buttonGroupVariantsAndTonesSource from '~/examples/button-group/VariantsAndTones.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useHead({ title: () => t('buttonGroup.title') })
</script>

<template>
  <h1>{{ t('buttonGroup.title') }}</h1>
  <DocsProse class="vd-lead" keypath="buttonGroup.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="buttonGroupBasicSource">
    <ButtonGroupBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="variants-and-tones">{{ t('buttonGroup.examples.variantsAndTones.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.variantsAndTones.text" />
  <DocsExample :source="buttonGroupVariantsAndTonesSource" stack>
    <ButtonGroupVariantsAndTones />
  </DocsExample>

  <h3 id="tone-override">{{ t('buttonGroup.examples.toneOverride.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.toneOverride.text" />
  <DocsExample :source="buttonGroupToneOverrideSource">
    <ButtonGroupToneOverride />
  </DocsExample>

  <h3 id="orientation">{{ t('buttonGroup.examples.orientation.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.orientation.text" />
  <DocsExample :source="buttonGroupOrientationSource">
    <ButtonGroupOrientation />
  </DocsExample>

  <h3 id="detached">{{ t('buttonGroup.examples.detached.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.detached.text" />
  <DocsExample :source="buttonGroupDetachedSource">
    <ButtonGroupDetached />
  </DocsExample>

  <h3 id="seamless">{{ t('buttonGroup.examples.seamless.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.seamless.text" />
  <DocsExample :source="buttonGroupSeamlessSource">
    <ButtonGroupSeamless />
  </DocsExample>

  <h3 id="elevated">{{ t('buttonGroup.examples.elevated.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.elevated.text" />
  <DocsExample :source="buttonGroupElevatedSource">
    <ButtonGroupElevated />
  </DocsExample>

  <h3 id="sizes">{{ t('buttonGroup.examples.sizes.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.sizes.text" />
  <DocsExample :source="buttonGroupSizesSource">
    <ButtonGroupSizes />
  </DocsExample>

  <h3 id="compact">{{ t('buttonGroup.examples.compact.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.compact.text" />
  <DocsExample :source="buttonGroupCompactSource" stack>
    <ButtonGroupCompact />
  </DocsExample>

  <h3 id="full-width">{{ t('buttonGroup.examples.fullWidth.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.fullWidth.text" />
  <DocsExample :source="buttonGroupFullWidthSource">
    <ButtonGroupFullWidth />
  </DocsExample>

  <h3 id="with-icons">{{ t('buttonGroup.examples.icons.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.icons.text" />
  <DocsExample :source="buttonGroupIconsSource">
    <ButtonGroupIcons />
  </DocsExample>

  <h3 id="link">{{ t('buttonGroup.examples.link.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.link.text" />
  <DocsExample :source="buttonGroupLinkSource">
    <ButtonGroupLink />
  </DocsExample>

  <h3 id="states">{{ t('buttonGroup.examples.states.title') }}</h3>
  <DocsProse keypath="buttonGroup.examples.states.text" />
  <DocsExample :source="buttonGroupStatesSource">
    <ButtonGroupStates />
  </DocsExample>

  <DocsApi page="buttonGroup" :api="api" />
</template>
