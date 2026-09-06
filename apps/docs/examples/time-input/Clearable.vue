<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'

const withCross = ref<string | null>('09:15')
const withoutCross = ref<string | null>('09:15')
const inList = ref<string | null>('09:30')
</script>

<template>
  <div class="column">
    <VTimeInput
      v-model="withCross"
      clearable
      show-picker
      label="Clearable"
      hint="The cross sits to the left of the clock icon, never in its place"
    />

    <VTimeInput
      v-model="withoutCross"
      show-picker
      label="Not clearable, the default"
      hint="Emptying the field is then the reader's own business"
    />

    <VTimeInput
      v-model="inList"
      clearable
      mode="list"
      :minute-step="30"
      label="Clearable, as a list"
      hint="Here the cross is the combobox's own, chevron included"
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
