<script setup lang="ts">
import { VMeter } from 'vectis-ui'
</script>

<template>
  <div class="meters">
    <VMeter label="Humidity" :value="45" :low="30" :high="60" />
    <VMeter label="CPU load" :value="55" :low="30" :high="70" :optimum="0" />
    <VMeter label="Battery" :value="12" :low="20" :high="50" :optimum="100" />
  </div>
</template>

<style scoped>
.meters {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 20rem;
}
</style>
