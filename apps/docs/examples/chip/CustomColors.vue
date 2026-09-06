<script setup lang="ts">
import { ref } from 'vue'
import { VChip } from 'vectis-ui'

const selected = ref(true)
</script>

<template>
  <div class="row">
    <VChip color="#7c3aed" variant="soft">soft</VChip>
    <VChip color="#7c3aed" variant="solid">solid</VChip>
    <VChip color="#7c3aed" variant="outline">outline</VChip>
    <VChip v-model:selected="selected" color="#7c3aed" selectable check>selectable</VChip>
  </div>

  <div class="row">
    <VChip color="#0f766e">#0f766e</VChip>
    <VChip color="mediumvioletred">mediumvioletred</VChip>
    <VChip color="oklch(0.55 0.15 150)">oklch(0.55 0.15 150)</VChip>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-2);
}
</style>
