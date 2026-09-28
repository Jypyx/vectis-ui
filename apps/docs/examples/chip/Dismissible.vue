<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VChip } from 'vectis-ui'

const ALL = ['Vue', 'TypeScript', 'CSS', 'Vite']

const tags = ref([...ALL])

function remove(tag: string) {
  tags.value = tags.value.filter((current) => current !== tag)
}
</script>

<template>
  <div class="row">
    <VChip v-for="tag in tags" :key="tag" tone="accent" dismissible @dismiss="remove(tag)">
      {{ tag }}
    </VChip>
    <VButton
      v-if="tags.length < ALL.length"
      variant="ghost"
      tone="neutral"
      size="xs"
      @click="tags = [...ALL]"
    >
      Reset
    </VButton>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--vectis-space-2);
}
</style>
