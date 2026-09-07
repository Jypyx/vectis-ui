<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput } from 'vectis-ui'

/* A real byte length, so the figure the counter prints is a real one. */
const start = () => [
  new File([new Uint8Array(240_000)], 'quarterly-report.pdf', { type: 'application/pdf' }),
  new File([new Uint8Array(96_000)], 'cover-photo.jpg', { type: 'image/jpeg' }),
]

const standard = ref(start())
const custom = ref(start())
</script>

<template>
  <div class="column">
    <VFileInput
      v-model="standard"
      counter
      multiple
      display="chip"
      label="The counter as it comes"
      hint="It sits under the field, to the right of this line"
    />

    <VFileInput v-model="custom" counter multiple display="chip" label="A wording of your own">
      <template #counter="{ count, size }">
        <span class="own">{{ count }} of 5 · {{ Math.round(size / 1000) }} kB</span>
      </template>
    </VFileInput>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
.own {
  font-variant-numeric: tabular-nums;
}
</style>
