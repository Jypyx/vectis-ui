<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VCard } from 'vectis-ui'

const loading = ref(true)
</script>

<template>
  <div class="demo">
    <VButton variant="outline" tone="neutral" @click="loading = !loading">
      {{ loading ? 'Show content' : 'Show loading' }}
    </VButton>
    <VCard
      :loading="loading"
      loading-text="Loading the trail"
      title="Forest loop"
      subtitle="6 km · 2 hours"
      class="card"
    >
      <template #media>
        <div class="cover" />
      </template>
      A shaded walk under old oaks, suitable for children.
    </VCard>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--vectis-space-3);
}

.card {
  inline-size: 22rem;
  max-inline-size: 100%;
}

.cover {
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, oklch(0.55 0.12 150), oklch(0.35 0.08 170));
}
</style>
