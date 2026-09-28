<script setup lang="ts">
import { ref } from 'vue'
import { VSlider } from 'vectis-ui'

const size = ref(2)
</script>

<template>
  <div class="demo">
    <VSlider v-model="size" :min="0" :max="4" :labels="['XS', 'S', 'M', 'L', 'XL']" label="Size" />
  </div>
</template>

<style scoped>
.demo {
  inline-size: 20rem;
  padding-inline: var(--vectis-space-4);
}
</style>
