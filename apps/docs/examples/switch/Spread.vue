<script setup lang="ts">
import { ref } from 'vue'
import { VSwitch } from 'vectis-ui'

const digest = ref(true)
const twoFactor = ref(false)
</script>

<template>
  <div class="settings">
    <VSwitch v-model="digest" spread>Weekly digest</VSwitch>
    <VSwitch v-model="twoFactor" spread label-position="start">Two-factor authentication</VSwitch>
  </div>
</template>

<style scoped>
/* A spread row takes the width it is given, so the panel is what decides how far apart
   the label and the switch end up. */
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
