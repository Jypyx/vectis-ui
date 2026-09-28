<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'
import {
  audio_file as audioFile,
  description,
  image,
  video_file as videoFile,
} from 'vectis-ui/icons'

const kinds = ref(['images', 'video'])
</script>

<template>
  <div class="demo">
    <VToggle v-model="kinds" multiple item-variant="outline" selected-icon-filled label="Media">
      <VToggleItem value="images" label="Images" :icon-start="image" />
      <VToggleItem value="video" label="Video" :icon-start="videoFile" />
      <VToggleItem value="audio" label="Audio" :icon-start="audioFile" />
      <VToggleItem value="documents" label="Documents" :icon-start="description" />
    </VToggle>

    <p class="value">{{ kinds.length ? kinds.join(', ') : 'Nothing selected' }}</p>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
.value {
  margin: 0;
  color: var(--vectis-color-text-muted);
  font-size: var(--vectis-text-caption-size);
}
</style>
