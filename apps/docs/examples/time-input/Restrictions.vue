<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'

const typed = ref<string | null>('09:30')
const listed = ref<string | null>('09:30')
const picked = ref<string | null>('09:30')
</script>

<template>
  <div class="column">
    <VTimeInput
      v-model="typed"
      format="24h"
      min="09:00"
      max="17:00"
      label="Typed"
      hint="Type 08:00 and leave the field: the value stands and the field turns invalid"
    />

    <VTimeInput
      v-model="listed"
      mode="list"
      format="24h"
      :minute-step="30"
      min="09:00"
      max="17:00"
      label="List"
      hint="The rows outside the bounds are not offered at all"
    />

    <VTimeInput
      v-model="picked"
      mode="picker"
      format="24h"
      :minute-step="30"
      min="09:00"
      max="17:00"
      label="Clock"
      hint="The face prints only the hours it can take"
    />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
