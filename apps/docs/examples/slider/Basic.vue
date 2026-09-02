<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const volume = ref(40)
</script>

<template>
  <VSlider v-model="volume" label="Volume" />
</template>
