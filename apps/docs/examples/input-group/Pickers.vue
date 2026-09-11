<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput, VInputGroup, VTimeInput } from 'vectis-ui'

const date = ref<string | null>('2026-09-21')
const time = ref<string | null>('09:30')
</script>

<template>
  <!-- Two anchored panels in one row. Each is anchored to its own field's box rather
       than to the group, so each opens under the segment it belongs to. -->
  <VInputGroup label="Scheduled for" hint="The date, then the time of day">
    <VDateInput v-model="date" show-picker aria-label="Date" />
    <VTimeInput v-model="time" show-picker aria-label="Time" class="time" />
  </VInputGroup>
</template>

<style scoped>
.time {
  flex: 0 0 13rem;
}
</style>
