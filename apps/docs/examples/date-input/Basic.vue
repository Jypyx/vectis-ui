<script setup lang="ts">
import { ref } from 'vue'
import { VDateInput } from 'vectis-ui'

const date = ref<string | null>(null)
</script>

<template>
  <VDateInput v-model="date" label="Start date" show-picker />
</template>
