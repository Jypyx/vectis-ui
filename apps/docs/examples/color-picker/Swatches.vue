<script setup lang="ts">
import { ref } from 'vue'
import { VColorPicker } from 'vectis-ui'
import type { ColorSwatch } from 'vectis-ui'

const color = ref<string | null>('#0ea5e9')
const swatches: ColorSwatch[] = [
  { color: '#0ea5e9', label: 'Ocean' },
  { color: '#16a34a', label: 'Forest' },
  { color: '#f59e0b', label: 'Sun' },
  '#e11d48',
  '#7c3aed',
  '#0f172a',
]
</script>

<template>
  <VColorPicker v-model="color" :swatches="swatches" label="Brand colours" />
</template>
