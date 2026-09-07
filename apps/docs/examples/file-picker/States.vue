<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VFilePicker } from 'vectis-ui'

const taken = ref<File[]>([])
const empty = ref<File[]>([])

onMounted(() => {
  taken.value = [
    new File([new Uint8Array(320_000)], 'contract.pdf', { type: 'application/pdf' }),
    new File([new Uint8Array(48_000)], 'figures.csv', { type: 'text/csv' }),
  ]
})
</script>

<template>
  <div class="column">
    <VFilePicker
      v-model="taken"
      multiple
      readonly
      preview="bottom"
      title="Read-only"
      subtitle="What was taken stays on show, its remove buttons disabled along with the zone"
    />

    <VFilePicker
      v-model="empty"
      disabled
      title="Disabled"
      subtitle="No dialog, no drop, and the zone greys through the colour tokens"
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
