<script setup lang="ts">
import { computed, ref } from 'vue'
import { VRating } from 'vectis-ui'

const rating = ref<number | null>(null)
const error = computed(() => (rating.value === null ? 'Choose a rating.' : undefined))
</script>

<template>
  <VRating v-model="rating" label="Quality" :error="error" required name="quality" />
</template>
