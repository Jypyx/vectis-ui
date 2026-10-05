<script setup lang="ts">
import { ref } from 'vue'
import { VNumberInput } from 'vectis-ui'

const guests = ref<number | null>(2)
const rooms = ref<number | null>(1)
const nights = ref<number | null>(3)
</script>

<template>
  <div class="stack">
    <VNumberInput v-model="guests" label="Guests" controls="split" :min="1" />
    <VNumberInput v-model="rooms" label="Rooms" controls="stacked" :min="1" />
    <VNumberInput v-model="nights" label="Nights" controls="none" :min="1" />
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  gap: var(--vectis-space-4);
  max-inline-size: 15rem;
}
</style>
