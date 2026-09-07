<script setup lang="ts">
import { ref } from 'vue'
import { VCombobox } from 'vectis-ui'
import { search, swap_vert as swapVert } from 'vectis-ui/icons'

const topic = ref('')
const tags = ref(['design', 'a11y'])
const order = ref<'A to Z' | 'Z to A'>('A to Z')

const options = [
  { value: 'design', label: 'Design' },
  { value: 'a11y', label: 'Accessibility' },
  { value: 'perf', label: 'Performance' },
  { value: 'docs', label: 'Documentation' },
]

function switchOrder() {
  order.value = order.value === 'A to Z' ? 'Z to A' : 'A to Z'
}
</script>

<template>
  <div class="fields">
    <VCombobox
      v-model="topic"
      :options="options"
      :icon-start="search"
      label="Decorative icon"
      placeholder="Search a topic"
    />

    <!-- The icon is rendered before the chips, so a multiple field keeps both. -->
    <VCombobox
      v-model="tags"
      :options="options"
      multiple
      :icon-start="search"
      label="Beside the chips"
    />

    <VCombobox
      v-model="topic"
      :options="options"
      :icon-start="swapVert"
      icon-start-label="Switch the order"
      label="Clickable icon"
      :hint="`Sorted ${order}.`"
      placeholder="Search a topic"
      @click:icon-start="switchOrder"
    />
  </div>
</template>

<style scoped>
.fields {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
