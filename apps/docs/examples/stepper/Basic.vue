<script setup lang="ts">
import { computed, ref } from 'vue'
import { VButton, VStepper, VTypography } from 'vectis-ui'
import type { StepperStep } from 'vectis-ui'

const STEPS: StepperStep[] = [
  { value: 'account', title: 'Account' },
  { value: 'shipping', title: 'Shipping' },
  { value: 'payment', title: 'Payment' },
  { value: 'review', title: 'Review' },
]

const current = ref('account')
const index = computed(() => STEPS.findIndex((step) => step.value === current.value))

function go(offset: number) {
  current.value = STEPS[index.value + offset]!.value as string
}
</script>

<template>
  <div class="checkout">
    <VStepper v-model="current" :steps="STEPS" />
    <VTypography>The {{ STEPS[index]!.title.toLowerCase() }} form goes here.</VTypography>
    <div class="actions">
      <VButton variant="outline" tone="neutral" :disabled="index === 0" @click="go(-1)">
        Back
      </VButton>
      <VButton :disabled="index === STEPS.length - 1" @click="go(1)">Next</VButton>
    </div>
  </div>
</template>

<style scoped>
.checkout {
  display: grid;
  gap: var(--vectis-space-6);
}

.actions {
  display: flex;
  gap: var(--vectis-space-2);
}
</style>
