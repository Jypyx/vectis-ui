<script setup lang="ts">
import api from '~/content/api/progress-linear'
import ProgressLinearBasic from '~/examples/progress-linear/Basic.vue'
import progressLinearBasicSource from '~/examples/progress-linear/Basic.vue?raw'
import ProgressLinearCustomColors from '~/examples/progress-linear/CustomColors.vue'
import progressLinearCustomColorsSource from '~/examples/progress-linear/CustomColors.vue?raw'
import ProgressLinearCustomContent from '~/examples/progress-linear/CustomContent.vue'
import progressLinearCustomContentSource from '~/examples/progress-linear/CustomContent.vue?raw'
import ProgressLinearIndeterminate from '~/examples/progress-linear/Indeterminate.vue'
import progressLinearIndeterminateSource from '~/examples/progress-linear/Indeterminate.vue?raw'
import ProgressLinearOrientation from '~/examples/progress-linear/Orientation.vue'
import progressLinearOrientationSource from '~/examples/progress-linear/Orientation.vue?raw'
import ProgressLinearShape from '~/examples/progress-linear/Shape.vue'
import progressLinearShapeSource from '~/examples/progress-linear/Shape.vue?raw'
import ProgressLinearThickness from '~/examples/progress-linear/Thickness.vue'
import progressLinearThicknessSource from '~/examples/progress-linear/Thickness.vue?raw'
import ProgressLinearTones from '~/examples/progress-linear/Tones.vue'
import progressLinearTonesSource from '~/examples/progress-linear/Tones.vue?raw'
import ProgressLinearValue from '~/examples/progress-linear/Value.vue'
import progressLinearValueSource from '~/examples/progress-linear/Value.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('progressLinear')
</script>

<template>
  <h1>{{ t('progressLinear.title') }}</h1>
  <DocsProse class="vd-lead" keypath="progressLinear.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="progressLinearBasicSource" stack>
    <ProgressLinearBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="value">{{ t('progressLinear.examples.value.title') }}</h3>
  <DocsProse keypath="progressLinear.examples.value.text" />
  <DocsExample :source="progressLinearValueSource" stack>
    <ProgressLinearValue />
  </DocsExample>

  <h3 id="indeterminate">{{ t('progressLinear.examples.indeterminate.title') }}</h3>
  <DocsProse keypath="progressLinear.examples.indeterminate.text" />
  <DocsExample :source="progressLinearIndeterminateSource" stack>
    <ProgressLinearIndeterminate />
  </DocsExample>

  <h3 id="tones">{{ t('progressLinear.examples.tones.title') }}</h3>
  <DocsProse keypath="progressLinear.examples.tones.text" />
  <DocsExample :source="progressLinearTonesSource" stack>
    <ProgressLinearTones />
  </DocsExample>

  <h3 id="custom-colors">{{ t('progressLinear.examples.customColors.title') }}</h3>
  <DocsProse keypath="progressLinear.examples.customColors.text" />
  <DocsExample :source="progressLinearCustomColorsSource" stack>
    <ProgressLinearCustomColors />
  </DocsExample>

  <h3 id="thickness">{{ t('progressLinear.examples.thickness.title') }}</h3>
  <DocsProse keypath="progressLinear.examples.thickness.text" />
  <DocsExample :source="progressLinearThicknessSource" stack>
    <ProgressLinearThickness />
  </DocsExample>

  <h3 id="shape">{{ t('progressLinear.examples.shape.title') }}</h3>
  <DocsProse keypath="progressLinear.examples.shape.text" />
  <DocsExample :source="progressLinearShapeSource" stack>
    <ProgressLinearShape />
  </DocsExample>

  <h3 id="custom-content">{{ t('progressLinear.examples.customContent.title') }}</h3>
  <DocsProse keypath="progressLinear.examples.customContent.text" />
  <DocsExample :source="progressLinearCustomContentSource" stack>
    <ProgressLinearCustomContent />
  </DocsExample>

  <h3 id="orientation">{{ t('progressLinear.examples.orientation.title') }}</h3>
  <DocsProse keypath="progressLinear.examples.orientation.text" />
  <DocsExample :source="progressLinearOrientationSource" stack>
    <ProgressLinearOrientation />
  </DocsExample>

  <DocsApi page="progressLinear" :api="api" />
</template>
