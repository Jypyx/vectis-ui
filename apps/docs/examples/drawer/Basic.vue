<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VCheckbox, VDrawer } from 'vectis-ui'

const open = ref(false)
const pending = ref(true)
const shipped = ref(false)
const refunded = ref(false)

function reset() {
  pending.value = false
  shipped.value = false
  refunded.value = false
}
</script>

<template>
  <VDrawer v-model:open="open" title="Filters" subtitle="Narrow the list of orders.">
    <template #trigger="{ triggerProps }">
      <VButton v-bind="triggerProps">Filters</VButton>
    </template>
    <div class="options">
      <VCheckbox v-model="pending">Pending</VCheckbox>
      <VCheckbox v-model="shipped">Shipped</VCheckbox>
      <VCheckbox v-model="refunded">Refunded</VCheckbox>
    </div>
    <template #footer>
      <VButton variant="ghost" tone="neutral" @click="reset">Reset</VButton>
      <VButton @click="open = false">Apply</VButton>
    </template>
  </VDrawer>
</template>

<style scoped>
.options {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-3);
}
</style>
