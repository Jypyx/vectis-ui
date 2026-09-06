<script setup lang="ts">
import { ref } from 'vue'
import { VCheckbox } from 'vectis-ui'

const analytics = ref(true)
const crashes = ref(false)
</script>

<template>
  <div class="settings">
    <VCheckbox v-model="analytics" spread>Share anonymous usage data</VCheckbox>
    <VCheckbox v-model="crashes" spread label-position="start">Send crash reports</VCheckbox>
  </div>
</template>

<style scoped>
/* A spread row takes the width it is given, so the panel is what decides how far apart
   the label and the box end up. */
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
