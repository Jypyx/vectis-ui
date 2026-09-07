<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VFilePicker } from 'vectis-ui'
import { attach_file as attachFile, description } from 'vectis-ui/icons'

const files = ref<File[]>([])

/* The files are built here and not at setup: `File` is a browser type, and this page is
   rendered on the server before it ever reaches one. */
onMounted(() => {
  files.value = [
    new File([new Uint8Array(24_000)], 'styles.css', { type: 'text/css' }),
    new File([new Uint8Array(180_000)], 'assets.zip', { type: 'application/zip' }),
  ]
})
</script>

<template>
  <div class="column">
    <VFilePicker
      v-model="files"
      multiple
      preview="bottom"
      title="Drop your sources here"
      :icon="attachFile"
      :type-icons="{ code: description }"
    />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
