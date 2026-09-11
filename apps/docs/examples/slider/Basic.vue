<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const volume = ref(40)
</script>

<template>
  <div class="demo">
    <VSlider v-model="volume" label="Volume" />
  </div>
</template>

<style scoped>
.demo {
  inline-size: 20rem;
}
</style>
