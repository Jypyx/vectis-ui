<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography, type PaginationSelectedVariant } from 'vectis-ui'

const variants: PaginationSelectedVariant[] = ['solid', 'soft', 'ghost']
const pages = ref<Record<string, number>>({ solid: 3, soft: 3, ghost: 3 })
</script>

<template>
  <div class="column">
    <!-- How the current page is drawn, in the row's tone: filled with `solid`, tinted
         with `soft`, or the colour of its text alone with `ghost`. Solid is the loudest
         and the safest default; ghost is for a row that must stay quiet, where the
         difference rests on the text colour alone. -->
    <div v-for="variant in variants" :key="variant" class="row">
      <VTypography variant="caption" tone="muted">{{ variant }}</VTypography>
      <VPagination
        v-model="pages[variant]"
        :length="6"
        :selected-variant="variant"
        item-variant="outline"
        :label="`Pages, ${variant}`"
      />
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-5);
}
.row {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-2);
}
</style>
