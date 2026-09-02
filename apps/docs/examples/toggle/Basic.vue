<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'

const alignment = ref('left')
</script>

<template>
  <VToggle v-model="alignment" label="Text alignment">
    <VToggleItem value="left" label="Left" />
    <VToggleItem value="center" label="Centre" />
    <VToggleItem value="right" label="Right" />
  </VToggle>
</template>
