<script setup lang="ts">
import { VHotkeys, VTypography } from 'vectis-ui'
</script>

<template>
  <div class="row">
    <div class="cell">
      <VHotkeys keys="mod+shift+k" variant="outlined" />
      <VTypography variant="caption" tone="muted">One cap per key</VTypography>
    </div>

    <!-- The decoration moves from each cap to the shortcut as a whole, which is what
         puts the separator inside the key instead of between two of them. -->
    <div class="cell">
      <VHotkeys keys="mod+shift+k" attached variant="outlined" />
      <VTypography variant="caption" tone="muted">attached</VTypography>
    </div>

    <div class="cell">
      <VHotkeys keys="mod+shift+k" attached separator="" variant="outlined" />
      <VTypography variant="caption" tone="muted">attached, no separator</VTypography>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-6);
}
.cell {
  display: grid;
  justify-items: center;
  gap: var(--vectis-space-2);
}
</style>
