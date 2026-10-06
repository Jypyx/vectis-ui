<script setup lang="ts">
import { ref } from 'vue'
import { VMenuItem, VMenuSeparator, VSplitButton, VTypography } from 'vectis-ui'

const last = ref('Nothing yet')
</script>

<template>
  <div class="demo">
    <VSplitButton label="Save" @click="last = 'Saved'">
      <VMenuItem label="Save as draft" @select="last = 'Saved as draft'" />
      <VMenuItem label="Save and close" @select="last = 'Saved and closed'" />
      <VMenuSeparator />
      <VMenuItem label="Discard changes" tone="danger" @select="last = 'Changes discarded'" />
    </VSplitButton>
    <VTypography variant="body-sm" tone="muted">Last action: {{ last }}</VTypography>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-3);
  justify-items: start;
}
</style>
