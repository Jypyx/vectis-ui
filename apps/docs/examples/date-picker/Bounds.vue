<script setup lang="ts">
import { ref } from 'vue'
import { VDatePicker } from 'vectis-ui'

const date = ref('2026-06-15')
</script>

<template>
  <VDatePicker v-model="date" min="2026-06-05" max="2026-06-24" />
</template>
