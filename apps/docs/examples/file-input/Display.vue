<script setup lang="ts">
import { ref } from 'vue'
import { VChip, VFileInput } from 'vectis-ui'
import { description, picture_as_pdf as pictureAsPdf } from 'vectis-ui/icons'

/* Two files to start with, so the three fields read before anything is picked. A real
   selection comes from the dialog or from a drop. */
const start = () => [
  new File(['x'], 'quarterly-report.pdf', { type: 'application/pdf' }),
  new File(['x'], 'balance-sheet-2026-final-v3.xlsx'),
]

const asText = ref(start())
const asChips = ref(start())
const custom = ref(start())
</script>

<template>
  <div class="column">
    <VFileInput
      v-model="asText"
      multiple
      label="text, the default"
      hint="The names joined by commas, on one line"
    />

    <VFileInput
      v-model="asChips"
      multiple
      display="chip"
      label="chip"
      hint="One dismissible chip each, cut in the middle so the extension survives"
    />

    <VFileInput v-model="custom" multiple display="chip" label="a chip of your own">
      <template #chip="{ file, label, remove, size, compact }">
        <VChip
          :icon-start="file.type === 'application/pdf' ? pictureAsPdf : description"
          :size="size"
          :compact="compact"
          :dismiss-label="`Remove ${file.name}`"
          variant="outline"
          tone="accent"
          dismissible
          @dismiss="remove"
        >
          {{ label }}
        </VChip>
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
</style>
