<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput } from 'vectis-ui'

const attachment = ref<File[]>([])
</script>

<template>
  <div class="column">
    <VFileInput
      v-model="attachment"
      label="Attachment"
      hint="Drop a file on the field, or use the paperclip"
      placeholder="No file chosen yet"
    />
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
</style>
