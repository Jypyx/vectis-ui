<script setup lang="ts">
import { ref } from 'vue'
import { VToggle, VToggleItem } from 'vectis-ui'
import { audio_file as audioFile, image, video_file as videoFile } from 'vectis-ui/icons'

const kind = ref('images')
</script>

<template>
  <!-- The chosen item draws its icon in the filled form, a common way of reinforcing
       which one is in effect, and the one that reads without relying on colour alone.
       It names the icon standing FOR the item, so only the one at the start is
       switched; a trailing icon keeps its outline. Nothing happens to an icon that has
       no filled form, the library shipping a second drawing only where the fill really
       changes the geometry. -->
  <VToggle v-model="kind" selected-icon-filled item-variant="outline" label="Media">
    <VToggleItem value="images" label="Images" :icon-start="image" />
    <VToggleItem value="video" label="Video" :icon-start="videoFile" />
    <VToggleItem value="audio" label="Audio" :icon-start="audioFile" />
  </VToggle>
</template>
