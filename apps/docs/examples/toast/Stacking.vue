<script setup lang="ts">
import { VButton, toast } from 'vectis-ui'

let n = 0

function raise() {
  n += 1
  toast({ tone: 'accent', message: `Notification ${n}.` })
}

function raiseThree() {
  toast({ tone: 'success', message: 'Backup finished.' })
  toast({ tone: 'warning', message: 'Two files were skipped.' })
  toast({ tone: 'danger', message: 'The report could not be sent.' })
}
</script>

<template>
  <div class="demo">
    <VButton variant="outline" tone="neutral" @click="raise">Raise one more</VButton>
    <VButton variant="outline" tone="neutral" @click="raiseThree">Raise three at once</VButton>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--vectis-space-3);
}
</style>
