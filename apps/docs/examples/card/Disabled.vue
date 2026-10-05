<script setup lang="ts">
import { VCard } from 'vectis-ui'
</script>

<template>
  <VCard
    href="#closed"
    disabled
    title="Mountain pass"
    subtitle="Closed for the winter"
    class="card"
  >
    The pass reopens in May, when the snow has melted.
  </VCard>
</template>

<style scoped>
.card {
  max-inline-size: 22rem;
}
</style>
