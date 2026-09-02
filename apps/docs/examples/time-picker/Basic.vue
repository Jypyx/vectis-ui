<script setup lang="ts">
import { ref } from 'vue'
import { VTimePicker } from 'vectis-ui'

const time = ref<string | null>('09:30')
</script>

<template>
  <VTimePicker v-model="time" />
</template>
