<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'

const variants = ['ghost', 'outline'] as const
const tones = ['accent', 'neutral', 'danger'] as const

const page = ref(3)
</script>

<template>
  <div class="column">
    <!-- The current page is always filled, whatever the variant says: the variant
         paints the OTHER pages and the controls. -->
    <div v-for="variant in variants" :key="variant" class="row">
      <VPagination
        v-for="tone in tones"
        :key="tone"
        v-model="page"
        :length="6"
        :item-variant="variant"
        :tone="tone"
        :label="`${variant}, ${tone}`"
      />
      <VTypography variant="caption" tone="muted">{{ variant }}</VTypography>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-6);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-5);
}
</style>
