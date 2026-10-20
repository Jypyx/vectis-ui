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
    :items="ITEMS"
    :max="128"
    label="Storage"
    orientation="vertical"
    size="lg"
    show-value
  />
</template>
