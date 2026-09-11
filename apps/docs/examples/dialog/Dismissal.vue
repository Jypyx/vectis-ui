<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VDialog, VTypography } from 'vectis-ui'

const noCross = ref(false)
const noBackdrop = ref(false)
const locked = ref(false)
</script>

<template>
  <div class="row">
    <VButton variant="outline" tone="neutral" @click="noCross = true">No cross</VButton>
    <VButton variant="outline" tone="neutral" @click="noBackdrop = true">
      Backdrop does nothing
    </VButton>
    <VButton variant="outline" tone="neutral" @click="locked = true">Footer only</VButton>
  </div>

  <!-- Escape and the backdrop still work, so the reader is never trapped. -->
  <VDialog
    v-model:open="noCross"
    hide-close
    title="Publish this version?"
    subtitle="Escape and a click outside still close it."
  >
    <VTypography>
      Taking the cross away suits a short decision, where the footer already says what the two ways
      out are.
    </VTypography>
    <template #footer>
      <VButton variant="ghost" tone="neutral" @click="noCross = false">Cancel</VButton>
      <VButton @click="noCross = false">Publish</VButton>
    </template>
  </VDialog>

  <VDialog
    v-model:open="noBackdrop"
    persistent-backdrop
    title="Unsaved changes"
    subtitle="A click outside is ignored. Escape and the cross are not."
  >
    <VTypography>
      Worth it for a form in progress, where a stray click outside would lose what has been typed.
    </VTypography>
    <template #footer>
      <VButton variant="ghost" tone="neutral" @click="noBackdrop = false">Discard</VButton>
      <VButton @click="noBackdrop = false">Keep editing</VButton>
    </template>
  </VDialog>

  <!-- Both refused: the footer is the only way out. Escape alone cannot be refused while
       the backdrop still closes, so the two go together. -->
  <VDialog
    v-model:open="locked"
    hide-close
    persistent-backdrop
    persistent-escape
    title="Accept the new terms"
    subtitle="One of the two buttons, and nothing else."
  >
    <VTypography>
      Nothing dismisses this by accident. Answer explicitly, and give every such dialog a footer:
      without one there is no way out at all.
    </VTypography>
    <template #footer>
      <VButton variant="ghost" tone="neutral" @click="locked = false">Read them again</VButton>
      <VButton @click="locked = false">Accept</VButton>
    </template>
  </VDialog>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-2);
}
</style>
