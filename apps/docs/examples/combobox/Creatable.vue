<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox, type ComboboxOption } from 'vectis-ui'

const tags = ref(['vue'])

const suggestions = ref<ComboboxOption[]>([
  { value: 'vue', label: 'Vue' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'vite', label: 'Vite' },
])

function addSuggestion(text: string) {
  suggestions.value.push({ value: text, label: text })
}
</script>

<template>
  <div class="column">
    <VCombobox
      v-model="tags"
      :options="suggestions"
      multiple
      creatable
      label="Tags"
      hint="Type a new tag and press Enter to create it"
      placeholder="Add a tag"
      @create="addSuggestion"
    />
    <output class="value" aria-label="Chosen values">{{ tags.join(', ') || 'none' }}</output>
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-3);
  max-inline-size: 26rem;
}
.value {
  font-family: var(--vectis-text-family-code);
  font-size: var(--vectis-text-body-sm-size);
  color: var(--vectis-color-text-muted);
}
</style>
