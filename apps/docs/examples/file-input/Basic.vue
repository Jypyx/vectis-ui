<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput } from 'vectis-ui'

const files = ref<File[]>([])
</script>

<template>
  <VFileInput v-model="files" label="Attachment" />
</template>
