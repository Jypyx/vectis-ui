<script setup lang="ts">
import { VMeterGroup, type MeterGroupItem } from 'vectis-ui'

const ITEMS: MeterGroupItem[] = [
  { label: 'Documents', value: 32 },
  { label: 'Photos', value: 24 },
  { label: 'Apps', value: 18 },
  { label: 'System', value: 12, tone: 'neutral' },
]
</script>

<template>
  <VMeterGroup
    class="group"
    :items="ITEMS"
    :max="128"
    label="Storage"
    :format-options="{ style: 'unit', unit: 'gigabyte' }"
    value-text="86 GB of 128 GB"
    show-value
  />
</template>

<style scoped>
.group {
  max-inline-size: 24rem;
}
</style>
