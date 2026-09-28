<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VSkeletonLoader, VTypography } from 'vectis-ui'

const pending = ref(true)
</script>

<template>
  <div class="demo">
    <VButton size="sm" variant="outline" tone="neutral" @click="pending = !pending">
      {{ pending ? 'Load' : 'Reload' }}
    </VButton>

    <div class="zone" :aria-busy="pending || undefined">
      <template v-if="pending">
        <VSkeletonLoader shape="control" size="sm" width="55%" />
        <VSkeletonLoader :lines="3" />
      </template>
      <template v-else>
        <VTypography variant="heading-4">Sales analysis</VTypography>
        <VTypography variant="body-sm" tone="muted">
          The quarter closes on a 12% rise in revenue, driven by annual subscriptions.
        </VTypography>
      </template>
    </div>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-4);
  inline-size: 24rem;
}
.zone {
  display: grid;
  gap: var(--vectis-space-3);
  inline-size: 100%;
}
</style>
