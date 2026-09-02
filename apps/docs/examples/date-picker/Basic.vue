<script setup lang="ts">
import { ref } from 'vue'
import { VDatePicker } from 'vectis-ui'

const date = ref('2026-06-10')
</script>

<template>
  <VDatePicker v-model="date" />
</template>
