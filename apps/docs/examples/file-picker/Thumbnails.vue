<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VFilePicker } from 'vectis-ui'

const shown = ref<File[]>([])
const hidden = ref<File[]>([])

/* A real PNG, drawn in the browser: a thumbnail is only ever painted from bytes an
   <img> can decode, so an empty buffer would fall back to the kind icon and prove
   nothing. Both zones are given the same two files. */
async function gradientPng(name: string): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = 96
  canvas.height = 96
  const context = canvas.getContext('2d')
  if (!context) return new File([], name, { type: 'image/png' })
  const gradient = context.createLinearGradient(0, 0, 96, 96)
  gradient.addColorStop(0, '#6366f1')
  gradient.addColorStop(1, '#ec4899')
  context.fillStyle = gradient
  context.fillRect(0, 0, 96, 96)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  return new File(blob ? [blob] : [], name, { type: 'image/png' })
}

onMounted(async () => {
  const files = [
    await gradientPng('cover.png'),
    new File([new Uint8Array(90_000)], 'notes.pdf', { type: 'application/pdf' }),
  ]
  shown.value = files
  hidden.value = [...files]
})
</script>

<template>
  <div class="grid">
    <VFilePicker
      v-model="shown"
      multiple
      preview="bottom"
      title="Thumbnails, the default"
      subtitle="An image is shown as itself"
    />

    <VFilePicker
      v-model="hidden"
      multiple
      hide-thumbnails
      preview="bottom"
      title="hideThumbnails"
      subtitle="Every file shows its kind instead"
    />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: var(--vectis-space-5);
}
</style>
