<script setup lang="ts">
import { VProgressLinear, VTypography, type ProgressLinearValuePosition } from 'vectis-ui'

const POSITIONS: ProgressLinearValuePosition[] = ['start', 'center', 'end']
</script>

<template>
  <div class="column">
    <!-- The text is rendered TWICE: once over the empty track, once over the fill in a
         contrasting colour, the second copy clipped at the fill's edge. Whatever the
         slot renders must therefore be free of side effects. -->
    <div v-for="position in POSITIONS" :key="position" class="labelled">
      <VTypography variant="caption" tone="muted">valuePosition {{ position }}</VTypography>
      <VProgressLinear
        :value="55"
        thickness="22"
        show-value
        :value-position="position"
        :aria-label="`Upload, ${position}`"
      />
    </div>

    <!-- The slot replaces the percentage and receives the value, the max and the
         percentage worked out from them. -->
    <div class="labelled">
      <VTypography variant="caption" tone="muted">A slot of your own</VTypography>
      <VProgressLinear :value="7" :max="12" thickness="22" aria-label="Files uploaded">
        <template #default="{ value, max }">{{ value }} of {{ max }} files</template>
      </VProgressLinear>
    </div>

    <VTypography variant="body-sm" tone="muted">
      The bar is 4px by default, so writing inside it means giving it a thickness that can hold a
      line of text.
    </VTypography>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 28rem;
}
.labelled {
  display: grid;
  gap: var(--vectis-space-2);
}
</style>
