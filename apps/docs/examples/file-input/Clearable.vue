<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput } from 'vectis-ui'

const withCross = ref<File[]>([])
const withoutCross = ref<File[]>([])
</script>

<template>
  <div class="column">
    <VFileInput
      v-model="withCross"
      clearable
      multiple
      display="chip"
      label="Clearable"
      hint="Add a file: the cross appears to the left of the paperclip"
    />

    <VFileInput
      v-model="withoutCross"
      multiple
      display="chip"
      label="Not clearable, the default"
      hint="Files then come out one chip at a time"
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
