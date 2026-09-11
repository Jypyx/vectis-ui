<script setup lang="ts">
import api from '~/content/api/input-otp'
import InputOtpBasic from '~/examples/input-otp/Basic.vue'
import inputOtpBasicSource from '~/examples/input-otp/Basic.vue?raw'
import InputOtpFormats from '~/examples/input-otp/Formats.vue'
import inputOtpFormatsSource from '~/examples/input-otp/Formats.vue?raw'
import InputOtpLabelAndHint from '~/examples/input-otp/LabelAndHint.vue'
import inputOtpLabelAndHintSource from '~/examples/input-otp/LabelAndHint.vue?raw'
import InputOtpLength from '~/examples/input-otp/Length.vue'
import inputOtpLengthSource from '~/examples/input-otp/Length.vue?raw'
import InputOtpPasting from '~/examples/input-otp/Pasting.vue'
import inputOtpPastingSource from '~/examples/input-otp/Pasting.vue?raw'
import InputOtpPattern from '~/examples/input-otp/Pattern.vue'
import inputOtpPatternSource from '~/examples/input-otp/Pattern.vue?raw'
import InputOtpReading from '~/examples/input-otp/Reading.vue'
import inputOtpReadingSource from '~/examples/input-otp/Reading.vue?raw'
import InputOtpSeparators from '~/examples/input-otp/Separators.vue'
import inputOtpSeparatorsSource from '~/examples/input-otp/Separators.vue?raw'
import InputOtpSizes from '~/examples/input-otp/Sizes.vue'
import inputOtpSizesSource from '~/examples/input-otp/Sizes.vue?raw'
import InputOtpStates from '~/examples/input-otp/States.vue'
import inputOtpStatesSource from '~/examples/input-otp/States.vue?raw'

definePageMeta({ layout: 'docs' })

const { t } = useI18n()
useDocsHead('inputOtp')
</script>

<template>
  <h1>{{ t('inputOtp.title') }}</h1>
  <DocsProse class="vd-lead" keypath="inputOtp.lead" />

  <h2 id="usage">{{ t('common.usage') }}</h2>
  <DocsExample :source="inputOtpBasicSource">
    <InputOtpBasic />
  </DocsExample>

  <h2 id="examples">{{ t('common.examples') }}</h2>

  <h3 id="label-and-hint">{{ t('inputOtp.examples.labelAndHint.title') }}</h3>
  <DocsProse keypath="inputOtp.examples.labelAndHint.text" />
  <DocsExample :source="inputOtpLabelAndHintSource" stack>
    <InputOtpLabelAndHint />
  </DocsExample>

  <h3 id="sizes">{{ t('inputOtp.examples.sizes.title') }}</h3>
  <DocsProse keypath="inputOtp.examples.sizes.text" />
  <DocsExample :source="inputOtpSizesSource" stack>
    <InputOtpSizes />
  </DocsExample>

  <h3 id="length">{{ t('inputOtp.examples.length.title') }}</h3>
  <DocsProse keypath="inputOtp.examples.length.text" />
  <DocsExample :source="inputOtpLengthSource" stack>
    <InputOtpLength />
  </DocsExample>

  <h3 id="formats">{{ t('inputOtp.examples.formats.title') }}</h3>
  <DocsProse keypath="inputOtp.examples.formats.text" />
  <DocsExample :source="inputOtpFormatsSource" stack>
    <InputOtpFormats />
  </DocsExample>

  <h3 id="pattern">{{ t('inputOtp.examples.pattern.title') }}</h3>
  <DocsProse keypath="inputOtp.examples.pattern.text" />
  <DocsExample :source="inputOtpPatternSource" stack>
    <InputOtpPattern />
  </DocsExample>

  <h3 id="separators">{{ t('inputOtp.examples.separators.title') }}</h3>
  <DocsProse keypath="inputOtp.examples.separators.text" />
  <DocsExample :source="inputOtpSeparatorsSource" stack>
    <InputOtpSeparators />
  </DocsExample>

  <h3 id="pasting">{{ t('inputOtp.examples.pasting.title') }}</h3>
  <DocsProse keypath="inputOtp.examples.pasting.text" />
  <DocsExample :source="inputOtpPastingSource" stack>
    <InputOtpPasting />
  </DocsExample>

  <h3 id="reading">{{ t('inputOtp.examples.reading.title') }}</h3>
  <DocsProse keypath="inputOtp.examples.reading.text" />
  <DocsExample :source="inputOtpReadingSource" stack>
    <InputOtpReading />
  </DocsExample>

  <h3 id="states">{{ t('inputOtp.examples.states.title') }}</h3>
  <DocsProse keypath="inputOtp.examples.states.text" />
  <DocsExample :source="inputOtpStatesSource" stack>
    <InputOtpStates />
  </DocsExample>

  <DocsApi page="inputOtp" :api="api" />
</template>
