<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VFilePicker } from 'vectis-ui'

const under = ref<File[]>([])
const beside = ref<File[]>([])
const none = ref<File[]>([])

/* The same two files in all three, so the only thing that differs is where they are
   listed. They are built here rather than at setup: `File` is a browser type, and this
   page is rendered on the server before it ever reaches one. */
onMounted(() => {
  const seed = () => [
    new File([new Uint8Array(320_000)], 'contract.pdf', { type: 'application/pdf' }),
    new File([new Uint8Array(48_000)], 'figures.csv', { type: 'text/csv' }),
  ]
  under.value = seed()
  beside.value = seed()
  none.value = seed()
})
</script>

<template>
  <div class="column">
    <div class="narrow">
      <VFilePicker
        v-model="under"
        multiple
        preview="bottom"
        title="Listed under the zone"
        subtitle="What a narrow form wants, there being no room beside it"
      />
    </div>

    <!-- Left at the card's full width on purpose: the side list needs the room, and it
         folds back underneath as soon as the component itself is narrower than 34rem. -->
    <VFilePicker
      v-model="beside"
      multiple
      preview="end"
      title="Listed beside the zone"
      subtitle="Narrow the window and it folds back underneath"
    />

    <div class="narrow">
      <VFilePicker
        v-model="none"
        multiple
        title="Not listed, the default"
        subtitle="Two files are held all the same: the value never depends on this prop"
      />
    </div>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
}
.narrow {
  max-inline-size: 26rem;
}
</style>
