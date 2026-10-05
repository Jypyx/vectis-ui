<script setup lang="ts">
import { ref } from 'vue'
import { VStepper } from 'vectis-ui'
import type { StepperStep } from 'vectis-ui'

const STEPS: StepperStep[] = [
  { value: 'profile', title: 'Profile', completed: true },
  { value: 'team', title: 'Team' },
  { value: 'billing', title: 'Billing', completed: true },
  { value: 'integrations', title: 'Integrations' },
]

const current = ref('team')
</script>

<template>
  <VStepper v-model="current" :steps="STEPS" non-linear label="Workspace setup" />
</template>
