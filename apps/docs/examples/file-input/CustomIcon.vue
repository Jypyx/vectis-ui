<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput } from 'vectis-ui'
import { cloud_upload as cloudUpload, image } from 'vectis-ui/icons'

const documents = ref<File[]>([])
const photos = ref<File[]>([])
</script>

<template>
  <div class="column">
    <VFileInput
      v-model="documents"
      :attach-icon="cloudUpload"
      multiple
      display="chip"
      label="Documents"
      hint="attachIcon takes the same values as every icon prop in the library"
    />

    <VFileInput
      v-model="photos"
      :attach-icon="image"
      accept="image/*"
      multiple
      display="chip"
      label="Photos"
      hint="Naming the icon after what the field accepts says more than a paperclip"
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
