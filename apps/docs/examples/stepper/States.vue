<script setup lang="ts">
import { ref } from 'vue'
import { VStepper } from 'vectis-ui'
import type { StepperStep } from 'vectis-ui'

const STEPS: StepperStep[] = [
  { value: 'account', title: 'Account' },
  { value: 'shipping', title: 'Shipping', disabled: true },
  { value: 'payment', title: 'Payment', description: 'Card declined', error: true },
  { value: 'review', title: 'Review' },
]

const current = ref('review')
</script>

<template>
  <VStepper v-model="current" :steps="STEPS" />
</template>
