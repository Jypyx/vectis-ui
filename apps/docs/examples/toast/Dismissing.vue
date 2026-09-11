<script setup lang="ts">
import { ref } from 'vue'
import { VButton, dismissToast, toast } from 'vectis-ui'

const id = ref<number | null>(null)

function raise() {
  // `toast` hands back an id, which is what lets this notification be taken away from
  // code: the request it was about came back, or the state it reported is over.
  id.value = toast({ tone: 'accent', message: 'Uploading…', duration: 0 })
}

function dismissOne() {
  if (id.value !== null) dismissToast(id.value)
  id.value = null
}
</script>

<template>
  <!-- Raised into the <VToaster /> mounted once at the root of the application. -->
  <div class="demo">
    <!-- The close cross is on by default, and turning it off only makes sense on a
         notification that goes away on its own: with no countdown and no cross,
         nothing but code can remove it. -->
    <VButton
      variant="outline"
      tone="neutral"
      @click="toast({ tone: 'success', message: 'Saved.', closable: false })"
    >
      No cross
    </VButton>

    <VButton variant="outline" tone="neutral" @click="raise">Raise one to dismiss</VButton>
    <VButton variant="outline" tone="neutral" @click="dismissOne">Dismiss that one</VButton>

    <!-- With no argument it clears every notification at once. -->
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
