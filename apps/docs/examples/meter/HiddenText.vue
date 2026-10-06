<script setup lang="ts">
import { VMeter } from 'vectis-ui'
</script>

<template>
  <VMeter class="meter" label="Quota" :value="30" hide-label hide-value />
</template>

<style scoped>
.meter {
  max-inline-size: 20rem;
}
</style>
