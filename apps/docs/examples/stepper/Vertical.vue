<script setup lang="ts">
import { ref } from 'vue'
import { VStepper } from 'vectis-ui'
import type { StepperStep } from 'vectis-ui'

const STEPS: StepperStep[] = [
  { value: 'import', title: 'Import contacts', description: 'From a CSV file' },
  { value: 'map', title: 'Map the columns', description: 'Name, email, company' },
  { value: 'check', title: 'Check duplicates', description: 'Merge or skip' },
  { value: 'done', title: 'Done' },
]

const current = ref('map')
</script>

<template>
  <VStepper v-model="current" :steps="STEPS" orientation="vertical" />
</template>
