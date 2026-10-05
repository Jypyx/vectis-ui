<script setup lang="ts">
import { ref } from 'vue'
import { VTreeView } from 'vectis-ui'
import type { TreeItem } from 'vectis-ui'
import { audio_file as audioFile, description, image, picture_as_pdf as pdf } from 'vectis-ui/icons'

const items: TreeItem[] = [
  {
    value: 'documents',
    label: 'Documents',
    children: [
      { value: 'resume', label: 'Resume.pdf', icon: pdf },
      {
        value: 'taxes',
        label: 'Taxes',
        children: [
          { value: 'taxes-2025', label: '2025.pdf', icon: pdf },
          { value: 'taxes-2026', label: '2026.pdf', icon: pdf },
        ],
      },
    ],
  },
  {
    value: 'pictures',
    label: 'Pictures',
    children: [
      { value: 'beach', label: 'Beach.jpg', icon: image },
      { value: 'mountain', label: 'Mountain.jpg', icon: image },
    ],
  },
  {
    value: 'music',
    label: 'Music',
    children: [{ value: 'song', label: 'Song.mp3', icon: audioFile }],
  },
  { value: 'notes', label: 'Notes.txt', icon: description },
]

const expanded = ref(['documents'])
</script>

<template>
  <VTreeView v-model:expanded="expanded" :items="items" label="Files" class="tree" />
</template>

<style scoped>
.tree {
  max-inline-size: 22rem;
}
</style>
