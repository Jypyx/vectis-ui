<script setup lang="ts">
import { VMeter } from 'vectis-ui'
</script>

<template>
  <VMeter class="meter" :value="64" label="Storage" />
</template>

<style scoped>
.meter {
  max-inline-size: 20rem;
}
</style>
