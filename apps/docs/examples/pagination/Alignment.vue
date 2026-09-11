<script setup lang="ts">
import { ref } from 'vue'
import { VPagination, VTypography } from 'vectis-ui'

const aligns = ['start', 'center', 'end'] as const

const page = ref(3)
</script>

<template>
  <div class="column">
    <!-- Alignment only says something in responsive mode, where the nav takes the whole
         width it is given. Outside it the row has its own intrinsic width and sits
         wherever its parent puts it. -->
    <div v-for="align in aligns" :key="align" class="box">
      <VPagination
        v-model="page"
        :length="6"
        responsive
        :align="align"
        item-variant="outline"
        :label="`Pages aligned ${align}`"
      />
      <VTypography variant="caption" tone="muted">{{ align }}</VTypography>
    </div>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
}
.box {
  display: grid;
  gap: var(--vectis-space-2);
  padding: var(--vectis-space-3);
  border: 1px dashed var(--vectis-color-border);
  border-radius: var(--vectis-radius-surface);
}
</style>
