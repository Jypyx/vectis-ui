<script setup lang="ts">
import { ref } from 'vue'
import { VChip, VCombobox, type ComboboxOption } from 'vectis-ui'
import {
  description,
  image,
  picture_as_pdf as pictureAsPdf,
  video_file as videoFile,
} from 'vectis-ui/icons'

const chosen = ref(['doc', 'img'])

const types: ComboboxOption[] = [
  { value: 'doc', label: 'Document', icon: description },
  { value: 'img', label: 'Image', icon: image },
  { value: 'vid', label: 'Video', icon: videoFile },
  { value: 'pdf', label: 'PDF', icon: pictureAsPdf },
]
</script>

<template>
  <div class="column">
    <VCombobox
      v-model="chosen"
      :options="types"
      multiple
      label="File types"
      placeholder="Add a type"
    >
      <!--
        `size` and `compact` are the step the field worked out for its chips, which cannot
        be guessed from out here, and `remove` is what keeps the value removable.
      -->
      <template #chip="{ option, label, remove, size, compact }">
        <VChip
          :icon-start="option?.icon"
          :size="size"
          :compact="compact"
          :dismiss-label="`Remove ${label}`"
          variant="outline"
          tone="accent"
          dismissible
          @dismiss="remove"
        >
          {{ label }}
        </VChip>
      </template>
    </VCombobox>
  </div>
</template>

<style scoped>
.column {
  max-inline-size: 26rem;
}
</style>
