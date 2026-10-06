<script setup lang="ts">
import { ref } from 'vue'
import { VColorPicker } from 'vectis-ui'

const color = ref<string | null>('rgb(59 130 246 / 0.6)')
</script>

<template>
  <div class="row">
    <VColorPicker v-model="color" format="rgb" alpha />
    <code>{{ color }}</code>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--vectis-space-4);
}
</style>
