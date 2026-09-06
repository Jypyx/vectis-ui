<script setup lang="ts">
import { ref } from 'vue'
import { VRadio } from 'vectis-ui'

const side = ref('start')
</script>

<template>
  <div class="settings">
    <VRadio v-model="side" name="spread-side" value="start" spread label-position="start">
      Label at the start, dot at the end
    </VRadio>
    <VRadio v-model="side" name="spread-side" value="end" spread>
      Dot at the start, label at the end
    </VRadio>
  </div>
</template>

<style scoped>
/* A spread row takes the width it is given, so the panel is what decides how far apart
   the label and the dot end up. */
.settings {
  display: grid;
  gap: var(--vectis-space-3);
  inline-size: 100%;
  max-inline-size: 24rem;
  padding: var(--vectis-space-4);
  border: 1px solid var(--vectis-color-border);
  border-radius: var(--vectis-radius-surface);
}
</style>
