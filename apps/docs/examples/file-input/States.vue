<script setup lang="ts">
import { ref } from 'vue'
import { VFileInput } from 'vectis-ui'

const chosen = () => [new File(['x'], 'contract.pdf', { type: 'application/pdf' })]

const invalid = ref(chosen())
const readOnly = ref(chosen())
const disabled = ref(chosen())
const noDrop = ref<File[]>([])
</script>

<template>
  <div class="column">
    <VFileInput
      v-model="invalid"
      invalid
      display="chip"
      label="Invalid"
      hint="For a rule of your own: nothing here is checked by the browser"
    />

    <VFileInput
      v-model="readOnly"
      readonly
      display="chip"
      label="Read-only"
      hint="What was chosen stays on show, and no dialog, drop or removal will change it"
    />

    <VFileInput
      v-model="disabled"
      disabled
      display="chip"
      label="Disabled"
      hint="Greyed through the colour tokens, and out of the tab order"
    />

    <VFileInput
      v-model="noDrop"
      no-drop
      multiple
      display="chip"
      label="Drop refused"
      hint="The paperclip still opens the dialog: only dropping is turned away"
    />
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: var(--vectis-space-5);
  max-inline-size: 26rem;
}
</style>
