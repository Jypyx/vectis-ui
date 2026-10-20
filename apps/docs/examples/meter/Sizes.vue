<script setup lang="ts">
import { VMeter, type MeterSize } from 'vectis-ui'

const SIZES: MeterSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
</script>

<template>
  <div class="meters">
    <VMeter v-for="size in SIZES" :key="size" :size="size" :label="size" :value="40" />
  </div>
</template>

<style scoped>
.meters {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 20rem;
}
</style>
