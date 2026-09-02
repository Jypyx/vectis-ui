<script setup lang="ts">
import { ref } from 'vue'
import { VFilePicker } from 'vectis-ui'

const files = ref<File[]>([])
</script>

<template>
  <VFilePicker v-model="files" title="Drag your files here" subtitle="PDF or PNG, up to 5 MB" />
</template>
