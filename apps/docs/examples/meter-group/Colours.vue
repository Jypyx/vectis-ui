<script setup lang="ts">
import { VMeterGroup, type MeterGroupItem } from 'vectis-ui'

const ITEMS: MeterGroupItem[] = [
  { label: 'Rent', value: 40, icon: 'home' },
  { label: 'Food', value: 20 },
  { label: 'Transport', value: 10 },
  { label: 'Savings', value: 15, tone: 'success' },
  { label: 'Leisure', value: 8, color: '#db2777' },
]
</script>

<template>
  <VMeterGroup class="group" :items="ITEMS" label="Budget" />
</template>

<style scoped>
.group {
  max-inline-size: 24rem;
}
</style>
