<script setup lang="ts">
import api from '~/content/api/slider'
import SliderBasic from '~/examples/slider/Basic.vue'
import sliderBasicSource from '~/examples/slider/Basic.vue?raw'
import SliderDisabled from '~/examples/slider/Disabled.vue'
import sliderDisabledSource from '~/examples/slider/Disabled.vue?raw'
import SliderForm from '~/examples/slider/Form.vue'
import sliderFormSource from '~/examples/slider/Form.vue?raw'
import SliderIconLabels from '~/examples/slider/IconLabels.vue'
import sliderIconLabelsSource from '~/examples/slider/IconLabels.vue?raw'
import SliderInputs from '~/examples/slider/Inputs.vue'
import sliderInputsSource from '~/examples/slider/Inputs.vue?raw'
import SliderMinMax from '~/examples/slider/MinMax.vue'
import sliderMinMaxSource from '~/examples/slider/MinMax.vue?raw'
import SliderOrientation from '~/examples/slider/Orientation.vue'
import sliderOrientationSource from '~/examples/slider/Orientation.vue?raw'
import SliderRange from '~/examples/slider/Range.vue'
import sliderRangeSource from '~/examples/slider/Range.vue?raw'
import SliderSteps from '~/examples/slider/Steps.vue'
import sliderStepsSource from '~/examples/slider/Steps.vue?raw'
import SliderTextLabels from '~/examples/slider/TextLabels.vue'
import sliderTextLabelsSource from '~/examples/slider/TextLabels.vue?raw'
import SliderTooltip from '~/examples/slider/Tooltip.vue'
import sliderTooltipSource from '~/examples/slider/Tooltip.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('slider')
</script>

<template>
  <h1>{{ t('slider.title') }}</h1>
  <DocsProse class="vd-lead" keypath="slider.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="sliderBasicSource" stack>
    <SliderBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="range">{{ t('slider.examples.range.title') }}</h3>
  <DocsProse keypath="slider.examples.range.text" />
  <DocsExample :source="sliderRangeSource" stack>
    <SliderRange />
  </DocsExample>

  <h3 id="min-max">{{ t('slider.examples.minMax.title') }}</h3>
  <DocsProse keypath="slider.examples.minMax.text" />
  <DocsExample :source="sliderMinMaxSource" stack>
    <SliderMinMax />
  </DocsExample>

  <h3 id="steps">{{ t('slider.examples.steps.title') }}</h3>
  <DocsProse keypath="slider.examples.steps.text" />
  <DocsExample :source="sliderStepsSource" stack>
    <SliderSteps />
  </DocsExample>

  <h3 id="text-labels">{{ t('slider.examples.textLabels.title') }}</h3>
  <DocsProse keypath="slider.examples.textLabels.text" />
  <DocsExample :source="sliderTextLabelsSource" stack>
    <SliderTextLabels />
  </DocsExample>

  <h3 id="icon-labels">{{ t('slider.examples.iconLabels.title') }}</h3>
  <DocsProse keypath="slider.examples.iconLabels.text" />
  <DocsExample :source="sliderIconLabelsSource" stack>
    <SliderIconLabels />
  </DocsExample>

  <h3 id="tooltip">{{ t('slider.examples.tooltip.title') }}</h3>
  <DocsProse keypath="slider.examples.tooltip.text" />
  <DocsExample :source="sliderTooltipSource" stack>
    <SliderTooltip />
  </DocsExample>

  <h3 id="inputs">{{ t('slider.examples.inputs.title') }}</h3>
  <DocsProse keypath="slider.examples.inputs.text" />
  <DocsExample :source="sliderInputsSource" stack>
    <SliderInputs />
  </DocsExample>

  <h3 id="orientation">{{ t('slider.examples.orientation.title') }}</h3>
  <DocsProse keypath="slider.examples.orientation.text" />
  <DocsExample :source="sliderOrientationSource" stack>
    <SliderOrientation />
  </DocsExample>

  <h3 id="disabled">{{ t('slider.examples.disabled.title') }}</h3>
  <DocsProse keypath="slider.examples.disabled.text" />
  <DocsExample :source="sliderDisabledSource" stack>
    <SliderDisabled />
  </DocsExample>

  <h3 id="form">{{ t('slider.examples.form.title') }}</h3>
  <DocsProse keypath="slider.examples.form.text" />
  <DocsExample :source="sliderFormSource" stack>
    <SliderForm />
  </DocsExample>

  <DocsApi page="slider" :api="api" />
</template>
