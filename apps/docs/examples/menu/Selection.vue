<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VMenu, VMenuItem } from 'vectis-ui'
import { check } from 'vectis-ui/icons'

const SORTS = [
  { value: 'name', label: 'Name' },
  { value: 'modified', label: 'Date modified' },
  { value: 'size', label: 'Size' },
]

const sort = ref('name')
const current = () => SORTS.find((option) => option.value === sort.value)?.label
</script>

<template>
  <VMenu match-trigger>
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps" variant="outline" tone="neutral">
        Sort by {{ current() }}
      </VButton>
    </template>

    <!-- `selected` says which one is in effect right now. It colours the row and is
         announced as the current choice, so the tick beside it is decoration rather
         than the information itself. -->
    <VMenuItem
      v-for="option in SORTS"
      :key="option.value"
      :label="option.label"
      :selected="sort === option.value"
      :icon-end="sort === option.value ? check : undefined"
      @select="sort = option.value"
    />
  </VMenu>
</template>
