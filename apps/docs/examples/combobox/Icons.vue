<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox, type ComboboxOption } from 'vectis-ui'
import {
  description,
  folder_zip as folderZip,
  image,
  picture_as_pdf as pictureAsPdf,
  table_chart as tableChart,
  video_file as videoFile,
} from 'vectis-ui/icons'

const type = ref('img')

/* `icon` takes what every icon prop in the library takes. A row without one starts
   straight at its label rather than reserving a blank column. */
const types: ComboboxOption[] = [
  { value: 'doc', label: 'Document', icon: description },
  { value: 'img', label: 'Image', icon: image },
  { value: 'vid', label: 'Video', icon: videoFile },
  { value: 'pdf', label: 'PDF', icon: pictureAsPdf },
  { value: 'zip', label: 'Archive', icon: folderZip },
  { value: 'raw', label: 'Anything else' },
  { value: 'xls', label: 'Spreadsheet', icon: tableChart, disabled: true },
]
</script>

<template>
  <div class="column">
    <VCombobox v-model="type" :options="types" label="File type" placeholder="Choose a type" />
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
</style>
