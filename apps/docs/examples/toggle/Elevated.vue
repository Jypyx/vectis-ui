<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'

const period = ref('week')
</script>

<template>
  <VToggle v-model="period" elevated item-variant="ghost" label="Period">
    <VToggleItem value="day" label="Day" />
    <VToggleItem value="week" label="Week" />
    <VToggleItem value="month" label="Month" />
  </VToggle>
</template>
