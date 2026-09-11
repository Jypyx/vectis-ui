<script setup lang="ts">
import { ref } from 'vue'
import { VButton, VDialogAlert, VTypography } from 'vectis-ui'

const open = ref(false)
const deleted = ref(false)

function confirmDelete() {
  deleted.value = true
  open.value = false
}
</script>

<template>
  <div class="demo">
    <VDialogAlert
      v-model:open="open"
      title="Delete this project?"
      subtitle="Its issues, branches and releases go with it."
    >
      <template #trigger="{ triggerProps }">
        <VButton v-bind="triggerProps" tone="danger">Delete Meridian</VButton>
      </template>

      <VTypography>
        There is no cross, Escape does nothing and a click outside does nothing: the two buttons
        below are the only way out, which is why supplying them is not optional.
      </VTypography>

      <template #footer>
        <VButton variant="ghost" tone="neutral" @click="open = false">Cancel</VButton>
        <VButton tone="danger" @click="confirmDelete">Delete</VButton>
      </template>
    </VDialogAlert>

    <VTypography v-if="deleted" tone="danger" variant="body-sm">Meridian was deleted.</VTypography>
  </div>
</template>

<style scoped>
.demo {
  display: grid;
  justify-items: start;
  gap: var(--vectis-space-3);
}
</style>
