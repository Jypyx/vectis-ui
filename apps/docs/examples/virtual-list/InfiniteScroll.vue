<script setup lang="ts">
import { computed, ref } from 'vue'
import { VVirtualList } from 'vectis-ui'

const total = 200

function page(from: number) {
  return Array.from({ length: 40 }, (_, i) => ({ id: from + i + 1 }))
}

const events = ref(page(0))
const loading = ref(false)
const hasMore = computed(() => events.value.length < total)

// Stands in for a request to your API.
function loadMore() {
  loading.value = true
  setTimeout(() => {
    events.value = [...events.value, ...page(events.value.length)]
    loading.value = false
  }, 600)
}
</script>

<template>
  <VVirtualList
    :items="events"
    item-key="id"
    :height="320"
    :loading="loading"
    :has-more="hasMore"
    label="Activity"
    class="list"
    @load-more="loadMore"
  >
    <template #default="{ item }">
      <div class="row">Event {{ item.id }}</div>
    </template>
  </VVirtualList>
</template>

<style scoped>
.list {
  max-inline-size: 420px;
  border: 1px solid var(--vectis-color-border);
}

.row {
  display: flex;
  align-items: center;
  min-block-size: 40px;
  padding-inline: var(--vectis-space-3);
  border-block-end: 1px solid var(--vectis-color-border);
}
</style>
