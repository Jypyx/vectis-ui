<script setup lang="ts">
import { ref } from 'vue'
import { VTimeInput } from 'vectis-ui'

const time = ref<string | null>(null)
</script>

<template>
  <VTimeInput v-model="time" label="Start time" />
</template>
