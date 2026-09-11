<script setup lang="ts">
import { ref } from 'vue'
import { VInputOTP } from 'vectis-ui'

const grouped = ref('')
const prefixed = ref('')
const reference = ref('')
</script>

<template>
  <div class="column">
    <!-- Each # is a box, everything else is drawn between them and never enters the
         value. The pattern wins over `length`, which is then ignored. -->
    <VInputOTP
      v-model="grouped"
      pattern="###-###"
      label="Grouped code"
      :hint="`Two groups of three. Value: ${grouped || 'empty'}`"
    />

    <!-- A literal can be a real prefix rather than punctuation. It is shown, never
         typed, and stays out of the value. -->
    <VInputOTP
      v-model="prefixed"
      pattern="GT-###"
      format="alphanumeric"
      label="Ticket reference"
      :hint="`Three characters after the prefix. Value: ${prefixed || 'empty'}`"
    />

    <VInputOTP
      v-model="reference"
      pattern="###.###.###"
      label="Payment reference"
      :hint="`Nine digits in three groups. Value: ${reference || 'empty'}`"
    />
  </div>
</template>

<style scoped>
.column {
  display: grid;
  gap: var(--vectis-space-5);
}
</style>
