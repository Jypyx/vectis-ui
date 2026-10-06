<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VResizable, VResizablePanel } from 'vectis-ui'

const KEY = 'docs-resizable-sizes'
const sizes = ref<number[]>([40, 60])

onMounted(() => {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
  if (Array.isArray(saved) && saved.length === 2) sizes.value = saved
})

function save(value: number[]) {
  localStorage.setItem(KEY, JSON.stringify(value))
}
</script>

<template>
  <div class="stack">
    <VResizable v-model="sizes" class="group" @change="save">
      <VResizablePanel class="pane">Resize, then reload the page.</VResizablePanel>
      <VResizablePanel class="pane">Content</VResizablePanel>
    </VResizable>
    <p class="sizes">Sizes: {{ sizes.map((size) => Math.round(size)).join(' / ') }}</p>
  </div>
</template>

<style scoped>
.group {
  block-size: 14rem;
  border: 1px solid var(--vectis-color-border);
  border-radius: var(--vectis-radius-surface);
}

.pane {
  padding: var(--vectis-space-4);
}

.stack {
  display: grid;
  gap: var(--vectis-space-3);
}

.sizes {
  margin: 0;
}
</style>
