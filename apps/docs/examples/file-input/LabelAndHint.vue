<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput } from 'vectis-ui'
import { search } from 'vectis-ui/icons'

const attachment = ref<File[]>([])
const found = ref<File[]>([
  new File(['x'], 'contract.pdf', { type: 'application/pdf' }),
  new File(['x'], 'annex.pdf', { type: 'application/pdf' }),
])
</script>

<template>
  <div class="column">
    <VFileInput
      v-model="attachment"
      label="Attachment"
      hint="Drop a file on the field, or use the paperclip"
      placeholder="No file chosen yet"
    />

    <!-- The start icon is rendered before the chips, so a chip display keeps both. -->
    <VFileInput
      v-model="found"
      multiple
      display="chip"
      :icon-start="search"
      label="Search the attachments"
      hint="An icon at the start, the paperclip at the end"
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
