<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'

const typed = ref<string | null>('09:15')
const withPicker = ref<string | null>('09:15')
const readOnly = ref<string | null>('09:15')
const fromList = ref<string | null>('09:30')
</script>

<template>
  <div class="column">
    <VTimeInput
      v-model="typed"
      label="Typed, the default"
      hint="No icon, no panel: the mask is the whole control"
    />

    <VTimeInput
      v-model="withPicker"
      show-picker
      label="Typed, with the clock"
      hint="showPicker adds the icon and the panel it opens"
    />

    <VTimeInput
      v-model="readOnly"
      mode="readonly"
      label="Read-only"
      hint="Nothing can be typed, so the clock is the only way in"
    />

    <VTimeInput
      v-model="fromList"
      mode="list"
      :minute-step="30"
      label="List"
      hint="Every half hour, found by typing rather than by scrolling"
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
