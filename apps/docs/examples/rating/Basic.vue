<script setup lang="ts">
import { ref } from 'vue'
import { VRating } from 'vectis-ui'

const rating = ref<number | null>(3)
</script>

<template>
  <VRating v-model="rating" label="Quality" hint="Your overall impression of the product." />
</template>
