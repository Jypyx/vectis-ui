<script setup lang="ts">
import { ref } from 'vue'
import { VMenuItem, VSplitButton } from 'vectis-ui'

const saving = ref(false)

function save() {
  saving.value = true
  setTimeout(() => (saving.value = false), 1500)
}
</script>

<template>
  <div class="row">
    <VSplitButton label="Save" :loading="saving" @click="save">
      <VMenuItem label="Save as draft" />
    </VSplitButton>
    <VSplitButton label="Save" disabled>
      <VMenuItem label="Save as draft" />
    </VSplitButton>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-4);
}
</style>
