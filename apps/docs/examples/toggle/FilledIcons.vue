<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'
import { audio_file as audioFile, image, video_file as videoFile } from 'vectis-ui/icons'

const kind = ref('images')
</script>

<template>
  <VToggle v-model="kind" selected-icon-filled item-variant="outline" label="Media">
    <VToggleItem value="images" label="Images" :icon-start="image" />
    <VToggleItem value="video" label="Video" :icon-start="videoFile" />
    <VToggleItem value="audio" label="Audio" :icon-start="audioFile" />
  </VToggle>
</template>
