<script setup lang="ts">
import { ref } from 'vue'
import { VContextMenu, VMenuItem, VMenuSeparator, VTypography } from 'vectis-ui'

const files = ['report.pdf', 'budget.xlsx', 'notes.txt']
const last = ref('')

function run(command: string, target: Element | null) {
  const file = target?.closest<HTMLElement>('[data-file]')?.dataset.file
  last.value = file ? `${command} ${file}` : command
}
</script>

<template>
  <div class="column">
    <VContextMenu as="ul" class="files" aria-label="Files">
      <li v-for="file in files" :key="file" :data-file="file">
        <button type="button" class="file">{{ file }}</button>
      </li>
      <template #menu="{ target }">
        <VMenuItem label="Open" @select="run('Open', target)" />
        <VMenuItem label="Rename" @select="run('Rename', target)" />
        <VMenuSeparator />
        <VMenuItem label="Delete" tone="danger" @select="run('Delete', target)" />
      </template>
    </VContextMenu>

    <VTypography variant="body-sm" tone="muted">
      {{ last ? `Last command: ${last}.` : 'Right-click a file, or focus it and press Shift+F10.' }}
    </VTypography>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-3);
}
.files {
  display: grid;
  gap: var(--vectis-space-1);
  max-inline-size: 20rem;
  margin: 0;
  padding: var(--vectis-space-2);
  border: 1px dashed var(--vectis-color-border);
  border-radius: var(--vectis-radius-md);
  list-style: none;
}
.file {
  inline-size: 100%;
  padding: var(--vectis-space-2);
  border: none;
  border-radius: var(--vectis-radius-sm);
  background: var(--vectis-color-surface-muted);
  color: var(--vectis-color-text);
  font: inherit;
  text-align: start;
}
</style>
