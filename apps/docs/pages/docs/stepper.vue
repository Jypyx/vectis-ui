<script setup lang="ts">
import api from '~/content/api/stepper'
import StepperBasic from '~/examples/stepper/Basic.vue'
import stepperBasicSource from '~/examples/stepper/Basic.vue?raw'
import StepperNonLinear from '~/examples/stepper/NonLinear.vue'
import stepperNonLinearSource from '~/examples/stepper/NonLinear.vue?raw'
import StepperStates from '~/examples/stepper/States.vue'
import stepperStatesSource from '~/examples/stepper/States.vue?raw'
import StepperVertical from '~/examples/stepper/Vertical.vue'
import stepperVerticalSource from '~/examples/stepper/Vertical.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('stepper')
</script>

<template>
  <h1>{{ t('stepper.title') }}</h1>
  <DocsProse class="vd-lead" keypath="stepper.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="stepperBasicSource" stack>
    <StepperBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="states">{{ t('stepper.examples.states.title') }}</h3>
  <DocsProse keypath="stepper.examples.states.text" />
  <DocsExample :source="stepperStatesSource" stack>
    <StepperStates />
  </DocsExample>

  <h3 id="non-linear">{{ t('stepper.examples.nonLinear.title') }}</h3>
  <DocsProse keypath="stepper.examples.nonLinear.text" />
  <DocsExample :source="stepperNonLinearSource" stack>
    <StepperNonLinear />
  </DocsExample>

  <h3 id="vertical">{{ t('stepper.examples.vertical.title') }}</h3>
  <DocsProse keypath="stepper.examples.vertical.text" />
  <DocsExample :source="stepperVerticalSource">
    <StepperVertical />
  </DocsExample>

  <DocsApi page="stepper" :api="api" />
</template>
