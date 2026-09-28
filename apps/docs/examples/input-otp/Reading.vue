<script setup lang="ts">
import { ref } from 'vue'
import { VInputOTP, VTypography } from 'vectis-ui'

const EXPECTED = '481902'

const code = ref('')
const verdict = ref<'right' | 'wrong' | null>(null)

function verify(value: string) {
  verdict.value = value === EXPECTED ? 'right' : 'wrong'
}
</script>

<template>
  <div class="column">
    <VInputOTP
      v-model="code"
      :length="6"
      :invalid="verdict === 'wrong'"
      label="Verification code"
      hint="Try 481902"
      @complete="verify"
      @update:model-value="verdict = null"
    />

    <VTypography variant="body-sm" tone="muted">
      Value: {{ code || 'empty' }} ({{ code.length }} of 6)
    </VTypography>

    <VTypography v-if="verdict === 'right'" variant="body-sm" tone="success">
      The code matches.
    </VTypography>
    <VTypography v-else-if="verdict === 'wrong'" variant="body-sm" tone="danger">
      That code is not the one we sent.
    </VTypography>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
