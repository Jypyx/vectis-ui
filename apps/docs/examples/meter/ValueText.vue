<script setup lang="ts">
import { VMeter } from 'vectis-ui'
</script>

<template>
  <div class="meters">
    <VMeter label="Humidity" :value="45" />
    <VMeter
      label="Temperature"
      :value="21.5"
      :min="-10"
      :max="40"
      :format-options="{ style: 'unit', unit: 'celsius' }"
    />
    <VMeter label="Storage" :value="7.2" :max="10" value-text="7.2 GB of 10 GB" />
  </div>
</template>

<style scoped>
.meters {
  display: grid;
  gap: var(--vectis-space-5);
  max-inline-size: 20rem;
}
</style>
