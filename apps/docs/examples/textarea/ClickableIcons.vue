<script setup lang="ts">
import { computed, ref } from 'vue'
import { VTextarea } from 'vectis-ui'
import { attach_file as attachFile, code } from 'vectis-ui/icons'

const message = ref('')
const attachments = ref(0)

const hint = computed(() => {
  if (attachments.value === 0) return 'Nothing attached yet.'
  return attachments.value === 1 ? '1 file attached.' : `${attachments.value} files attached.`
})

function insertCodeBlock() {
  message.value += '\n```\n\n```'
}
</script>

<template>
  <VTextarea
    v-model="message"
    label="Message"
    :hint="hint"
    :rows="4"
    :icon-start="code"
    icon-start-label="Insert a code block"
    :icon-end="attachFile"
    icon-end-label="Attach a file"
    @click:icon-start="insertCodeBlock"
    @click:icon-end="attachments += 1"
  />
</template>
