<script setup lang="ts">
import api from '~/content/api/progress-circular'
import ProgressCircularBasic from '~/examples/progress-circular/Basic.vue'
import progressCircularBasicSource from '~/examples/progress-circular/Basic.vue?raw'
import ProgressCircularCustomColors from '~/examples/progress-circular/CustomColors.vue'
import progressCircularCustomColorsSource from '~/examples/progress-circular/CustomColors.vue?raw'
import ProgressCircularCustomContent from '~/examples/progress-circular/CustomContent.vue'
import progressCircularCustomContentSource from '~/examples/progress-circular/CustomContent.vue?raw'
import ProgressCircularIndeterminate from '~/examples/progress-circular/Indeterminate.vue'
import progressCircularIndeterminateSource from '~/examples/progress-circular/Indeterminate.vue?raw'
import ProgressCircularShape from '~/examples/progress-circular/Shape.vue'
import progressCircularShapeSource from '~/examples/progress-circular/Shape.vue?raw'
import ProgressCircularSizeAndThickness from '~/examples/progress-circular/SizeAndThickness.vue'
import progressCircularSizeAndThicknessSource from '~/examples/progress-circular/SizeAndThickness.vue?raw'
import ProgressCircularTones from '~/examples/progress-circular/Tones.vue'
import progressCircularTonesSource from '~/examples/progress-circular/Tones.vue?raw'
import ProgressCircularValue from '~/examples/progress-circular/Value.vue'
import progressCircularValueSource from '~/examples/progress-circular/Value.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('progressCircular')
</script>

<template>
  <h1>{{ t('progressCircular.title') }}</h1>
  <DocsProse class="vd-lead" keypath="progressCircular.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="progressCircularBasicSource">
    <ProgressCircularBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="value">{{ t('progressCircular.examples.value.title') }}</h3>
  <DocsProse keypath="progressCircular.examples.value.text" />
  <DocsExample :source="progressCircularValueSource" stack>
    <ProgressCircularValue />
  </DocsExample>

  <h3 id="indeterminate">{{ t('progressCircular.examples.indeterminate.title') }}</h3>
  <DocsProse keypath="progressCircular.examples.indeterminate.text" />
  <DocsExample :source="progressCircularIndeterminateSource" stack>
    <ProgressCircularIndeterminate />
  </DocsExample>

  <h3 id="tones">{{ t('progressCircular.examples.tones.title') }}</h3>
  <DocsProse keypath="progressCircular.examples.tones.text" />
  <DocsExample :source="progressCircularTonesSource" stack>
    <ProgressCircularTones />
  </DocsExample>

  <h3 id="custom-colors">{{ t('progressCircular.examples.customColors.title') }}</h3>
  <DocsProse keypath="progressCircular.examples.customColors.text" />
  <DocsExample :source="progressCircularCustomColorsSource" stack>
    <ProgressCircularCustomColors />
  </DocsExample>

  <h3 id="size-and-thickness">{{ t('progressCircular.examples.sizeAndThickness.title') }}</h3>
  <DocsProse keypath="progressCircular.examples.sizeAndThickness.text" />
  <DocsExample :source="progressCircularSizeAndThicknessSource" stack>
    <ProgressCircularSizeAndThickness />
  </DocsExample>

  <h3 id="shape">{{ t('progressCircular.examples.shape.title') }}</h3>
  <DocsProse keypath="progressCircular.examples.shape.text" />
  <DocsExample :source="progressCircularShapeSource" stack>
    <ProgressCircularShape />
  </DocsExample>

  <h3 id="custom-content">{{ t('progressCircular.examples.customContent.title') }}</h3>
  <DocsProse keypath="progressCircular.examples.customContent.text" />
  <DocsExample :source="progressCircularCustomContentSource" stack>
    <ProgressCircularCustomContent />
  </DocsExample>

  <DocsApi page="progressCircular" :api="api" />
</template>
