<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VCommandPalette } from 'vectis-ui'
import type { CommandPaletteCommand } from 'vectis-ui'
import { description } from 'vectis-ui/icons'

const DOCUMENTS = ['Roadmap 2026', 'Release plan', 'Planning poker notes', 'Team charter']

const open = ref(false)
const loading = ref(false)
const results = ref<CommandPaletteCommand[]>([])
let request = 0

function search(query: string) {
  const id = ++request
  loading.value = true
  // Stands in for a request to a server.
  setTimeout(() => {
    if (id !== request) return
    const q = query.toLowerCase()
    results.value = DOCUMENTS.filter((name) => name.toLowerCase().includes(q)).map((label) => ({
      label,
      icon: description,
    }))
    loading.value = false
  }, 400)
}
</script>

<template>
  <VCommandPalette
    v-model:open="open"
    :items="results"
    :filter="false"
    :loading="loading"
    loading-text="Searching documents…"
    placeholder="Search documents…"
    @search="search"
  >
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps">Search documents</VButton>
    </template>
  </VCommandPalette>
</template>
