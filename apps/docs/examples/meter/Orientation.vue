<script setup lang="ts">
import { VMeter } from 'vectis-ui'
</script>

<template>
  <div class="row">
    <VMeter orientation="vertical" label="Tank" :value="60" show-value />
    <VMeter
      orientation="vertical"
      label="Battery"
      :value="70"
      :low="20"
      :high="50"
      :optimum="100"
      :segments="5"
      size="lg"
    />
    <VMeter orientation="vertical" label="Humidity" :value="45" size="xl" />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: end;
  gap: var(--vectis-space-6);
}
</style>
