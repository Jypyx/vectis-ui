<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox, VInput, VInputGroup } from 'vectis-ui'

const tags = ref(['design', 'accessibility'])

const options = [
  { value: 'design', label: 'Design' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'tokens', label: 'Tokens' },
]
</script>

<template>
  <!-- A combobox holding several values grows past the height of its neighbour, and the
       merged border then only covers the top of it. A row is a line of single line
       controls. -->
  <VInputGroup label="A segment that grows" hint="Outside what a joined row can hold">
    <VCombobox v-model="tags" multiple :options="options" aria-label="Tags" />
    <VInput aria-label="Note" placeholder="Note" />
  </VInputGroup>
</template>
