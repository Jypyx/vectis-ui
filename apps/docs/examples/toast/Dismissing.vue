<script setup lang="ts">
import { ref } from 'vue'
import { VButton, dismissToast, toast } from 'vectis-ui'

const id = ref<number | null>(null)

function raise() {
  id.value = toast({ tone: 'accent', message: 'Uploading…', duration: 0 })
}

function dismissOne() {
  if (id.value !== null) dismissToast(id.value)
  id.value = null
}
</script>

<template>
  <div class="demo">
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'success', message: 'Saved.', hideClose: true })"
    >
      No cross
    </VButton>

    <VButton variant="outline" tone="neutral" @click="raise">Raise one to dismiss</VButton>
    <VButton variant="outline" tone="neutral" @click="dismissOne">Dismiss that one</VButton>

    <VButton variant="outline" tone="neutral" @click="dismissToast()">Dismiss all</VButton>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-3);
}
</style>
