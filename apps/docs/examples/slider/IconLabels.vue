<script setup lang="ts">
import { ref } from 'vue'
import { VSlider, type SliderLabel } from 'vectis-ui'
import { check_circle as checkCircle, error, info, warning } from 'vectis-ui/icons'

const threshold = ref(1)

// A label may be an icon instead of a word, and then the words come with it: the icon
// is what the reader sees, the label what a screen reader announces.
const labels = [
  { icon: checkCircle, label: 'Silent' },
  { icon: info, label: 'Information' },
  { icon: warning, label: 'Warning' },
  { icon: error, label: 'Error' },
] satisfies SliderLabel[]
</script>

<template>
  <div class="demo">
    <VSlider v-model="threshold" :min="0" :max="3" :labels="labels" label="Alert threshold" />
    <p class="value">{{ labels[threshold]?.label }}</p>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  gap: var(--vectis-space-3);
  inline-size: 20rem;
  padding-inline: var(--vectis-space-4);
}
.value {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
