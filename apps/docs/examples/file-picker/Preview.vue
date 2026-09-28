<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VFilePicker } from 'vectis-ui'

const under = ref<File[]>([])
const beside = ref<File[]>([])
const none = ref<File[]>([])

/* Create sample File objects after mounting for server rendering. */
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
