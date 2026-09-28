<script setup lang="ts">
import { ref } from 'vue'
import { VBadge, VToggle, VToggleItem } from 'vectis-ui'
import {
  audio_file as audioFile,
  image,
  info,
  search,
  video_file as videoFile,
} from 'vectis-ui/icons'

const kind = ref('images')
const view = ref('list')
</script>

<template>
  <div class="demo">
    <VToggle v-model="kind" item-variant="outline" label="Media">
      <VToggleItem value="images" label="Images" :icon-start="image" />
      <VToggleItem value="video" label="Video" :icon-start="videoFile" />
      <VToggleItem value="audio" label="Audio" :icon-start="audioFile" :icon-end="info" />
    </VToggle>

    <VToggle v-model="view" item-variant="outline" label="View">
      <VToggleItem value="list" :icon-start="search" aria-label="Search" />
      <VToggleItem value="grid" :icon-start="image" aria-label="Thumbnails" />

      <VToggleItem value="flagged">
        <VBadge :count="4">Flagged</VBadge>
      </VToggleItem>
    </VToggle>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-5);
}
</style>
