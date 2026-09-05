<script setup lang="ts">
import { VDateInput, VInputGroup, VTimeInput } from 'vectis-ui'
</script>

<template>
  <VInputGroup label="Scheduled for" hint="The date, then the time of day">
    <VDateInput show-picker aria-label="Date" />
    <VTimeInput aria-label="Time" class="time" />
  </VInputGroup>
</template>

<style scoped>
.time {
  flex: 0 0 12rem;
}
</style>
